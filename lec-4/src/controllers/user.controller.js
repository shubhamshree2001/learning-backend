import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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

export { registerUser }; 