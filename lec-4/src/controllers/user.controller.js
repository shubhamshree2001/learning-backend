import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // we will send access and refresh token to user, but we will also save refresh token in the database

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        // validateBeforeSave: false is used to bypass the validation of the user model
        // because we are not saving the password in the database
        // we are only saving the refresh token in the database

        return { accessToken, refreshToken };

    } catch(error){
        throw new ApiError(500, error?.message || "Failed to generate tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get data from user in body
    //validation - check non empty
    //check user already exists : email , name
    //check for images or avatar
    //upload them to cloudinary , avatar
    //create user in object  create entry in db 
    //remove the passowrd and refresh token from response
    // check user is created or not 
    // send the response to the user

    // we also need to verify files that we will do in routes thoeugh multer middleware
    // console.log(req.body);

    // destructuring the body for which ever needed
    const { fullName, email, username, password} = req.body;

//    if([fullName, email, password].some((field) => field?.trim() === "")) {
//     throw new ApiError(400, "All fields are required");
//    }

   if(fullName === "" || email === "" || password === "" || username === "") {
    throw new ApiError(400, "All fields are required");
   }

    const existedUser = await User.findOne({$or: [{email}, {username}]});
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // now to check file is uploaded or not
    // console.log(req.files);
    const avatarLoalPath = req.files?.avatar[0]?.path; // it will give you the path which multer has uploaded
    //const coverImageLocalPath = req.files?.coverImage[0]?.path; 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    
    if(!avatarLoalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLoalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Failed to upload images");
    }

    const user =await User.create({
        fullName,
        username: username?.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    // removing password and refresh token filed from the response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Failed to create user");
    }

     
    return res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    //req body
    //username or email
    //find the user
    //password check
    //access token and refresh token
    //send cookie (jwt)

    const { username, email, password } = req.body;

    if(!username && !email){
        throw new ApiError(400, "Username or email is required");
    }

    // this or operator takes two object and checks does that object is present in the database or not
    const user = await User.findOne({$or: [{username}, {email}]});
    if(!user){
        throw new ApiError(404, "User not found");
    }

    if(!password){
        throw new ApiError(400, "Password is required");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // optonal step it is
     const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

     //we will send accesstoken and refresh token to user in cookie

     // http only means that the cookie is only accessible by the server
     // secure means that the cookie is only accessible by the server
     // cannot mofify the cookie from the client side
     // maxAge means that the cookie will expire in 30 days
     const cookieOptions = {
        httpOnly: true,
        secure: true,
     };

     // we are sending in cookie and in response as well 
     return res.status(200).cookie("accessToken", accessToken, cookieOptions)
     .cookie("refreshToken", refreshToken, cookieOptions)
     .json(new ApiResponse(200, {user: loggedInUser,accessToken, refreshToken}, "Login successful"));

});

const logoutUser = asyncHandler(async (req, res) => {
    // req body
    // find the user
    // remove the refresh token from the database
    // remove the cookies
    // send the response

    await User.findByIdAndUpdate(req.user._id, 
        {
            $set:{
                refreshToken: undefined }}, 
        {new: true}); // new: true is used to return the updated user

        const cookieOptions = {
            httpOnly: true,
            secure: true,
        };

        return res.status(200).clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {} , "Logout successful"));
});

const updateAccessToken = asyncHandler(async (req, res) => {
    // first get the refresh token from the cookie or header
    // verify the refresh token we get it decoded and then we get userId from it
    // find the user
    //match the incoming refresh token with the refresh token in the database
    // generate new access token
    // update the refresh token in the database
    // send the response

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedRefreshToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        if (!decodedRefreshToken){
            throw new ApiError(401, "unauthorized request");
        }
    
    
        const userId = decodedRefreshToken?._id;
    
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if(user?.refreshToken !== incomingRefreshToken){ 
            throw new ApiError(401, "Refresh token is not valid");
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    
        const cookieOptions = {
            httpOnly: true,
            secure: true,
        };
    
        return res.status(200).cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token updated successfully"));
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized");
    }
});

export { registerUser, loginUser, logoutUser, updateAccessToken };  