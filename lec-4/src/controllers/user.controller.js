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

    await User.findByIdAndUpdate(req.user._id,  {
        // setting refresh tken to undefined is not a good practice
        // so we are using $unset to remove the refresh token from the database
        //     $set:{
        //         refreshToken: undefined }}, 
        // {new: true}); // new: true is used to return the updated user

        $unset: {
            refreshToken: 1 // 1 is used to remove the field from the database
        }
    }, {new: true});

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

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // req body
    // find the user
    // check the old password
    // change the password
    // send the response

    const { currentPassword, newPassword } = req.body;

    if(!currentPassword || !newPassword){
        throw new ApiError(400, "All fields are required");
    }

    // through middleware we get this req.user?._id
    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false}); // validateBeforeSave: false is used to bypass the validation of the user model

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
    // req body
    // find the user
    // send the response
    // req.user?._id) this we get through middleware, auth middleware return this user object

    return res.status(200).json(new ApiResponse(200, req.user, "User profile fetched successfully"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
    // req body
    // find the user
    // update the user
    // send the response
    // if we have to update some file or photo keep the separte end point for it 

    const { fullName, email } = req.body;

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required");
    }

    // if we pass new true then it will return the updated user
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email
        }
    }, {new: true}).select("-password -refreshToken");

    if(!user){
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "User profile updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    // req body
    // check the file is uploaded or not to cloudinary
    // find the user
    // delete the old avatar from cloudinary
    // update the user
    // send the response
    // if we have to update some file or photo keep the separte end point for it 

    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }
 
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(400, "Failed to upload avatar");
    }

    const oldAvatar = req.user?.avatar;
    if(oldAvatar){
        await deleteFromCloudinary(oldAvatar);
    }


    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    }, {new: true}).select("-password -refreshToken");

    if(!user){
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "User avatar updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
// to go on a channel profile we need to get the user id from the url
const {username} = req.params;
if(!username?.trim()){
    throw new ApiError(400, "Username is required");
}

// const user = await User.findOne({username: username.toLowerCase()});
// if(!user){
//     throw new ApiError(404, "User not found");
// }
/// we will use aggregation pipeline to get the user channel profile
// it will be array of objects
const channel = await User.aggregate([
    {
        $match: {
            username: username.toLowerCase()
        }
    },
    // we will get the number of subscriber/followers of the channel
    { 
        $lookup: {  // it will join the subscriptions collection with the users collection
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    //it will get number of channels I have subscribedto/following
    {
        $lookup: {  // it will join the subscriptions collection with the users collection
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }   
    },
    // now we have to add fields for total subscribers and total channels I have subscribed to
    // think it like a instagram profile 
    // totalSubscriber as a total number of followers
    //totalSubscribedTo as a total number of following
    //isSubscribed as a boolean value to know if I am following this user or not
    {
        $addFields: {
            totalSubscribers: { $size: "$subscribers" }, // it will give you the number of subscribers
            totalSubscribedTo: { $size: "$subscribedTo" },// it will give you the number of channels I have subscribed to
            // now we want to know I as user subscribed to this channel or not 
            isSubscribed: { 
                 $cond: {
                    // $in can be used to check if a value is in an array or in an object
                    if: {
                        $in: [req.user?._id, "$subscribers.subscriber"] // here I am checking I as a user is in the list of following of this user 
                    },
                    then: true,
                    else: false
                 }
            } // it will give you true if I am subscribed to the channel
        },   
    },
    // now we want to project the fields we need to show in the response
    {
        $project: {
            // we send 1 to show the field in the response
            // _id: 1,
            fullName: 1,
            username: 1,
            email: 1,
            avatar: 1,
            coverImage: 1,
            totalSubscribers: 1,
            totalSubscribedTo: 1,
            isSubscribed: 1
    }}
]);

// we are checking channel length here because the aggreagation pipeline returns an array of objects
// so we are checking the length of the array to know if the channel is found or not
if(channel.length === 0){
    throw new ApiError(404, "channel not found");
}

// sending channel[0] as there will be one user matched with the username in the aggregation pipeline
return res.status(200).json(new ApiResponse(200, channel[0], "User channel profile fetched successfully"));
});


// now we need to know the watch history of a user 
// so here we need to join the watch history collection with the users collection
// and get the videos that the user has watched
// we will use aggregation pipeline to get the watch history of a user
// here we will use $lookup to join the watch history collection with the users collection
// here we will $lookup to join the video  to which user/channel has uploaded
// it will be a nested lookup

const getWatchHistory = asyncHandler(async (req, res) => {
   //req.user?._id
   // it gives id of the user which is in string format 
   // but in mongodb id is in object id format
   // so we are using moongose it converts req.user?._id to object id format in the back by it self

   // but inside aggregation pipeline we use object id format not string format
   // in aggregationppeline req.user?._id is not converted to object id format₹ by moongose it self
   // so we are using ObjectId(req.user?._id) to convert the string format to object id format
   const user = await User.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(req.user?._id)
        }
    },
    {
        // here we are in user collection and we want to get watchHistory of this user
        $lookup: {
            from: "videos",
            localField: "watchHistory", // local field of user collection which is watchHistory
            foreignField: "_id", // id of video created by mongodb
            as: "watchHistory", 
            // now to get owner of this video we need below pipeline to be added
            // here we are in video collection and we want to get owner of this video
            pipeline: [
                {
                    $lookup: {
                        from: "users",
                        localField: "owner", // local field of video collection which is owner
                        foreignField: "_id", // id of owner created by mongodb in user collection
                        as: "owner",
                        //here we dont want all the details of owner user
                        pipeline: [
                            {
                                $project: {
                                    //_id: 1,
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]   
                    }
                } ,  
                //now we want to structure the owner object in the response for frontend 
                // as it is an array of objects so we use $first to get the first object
                {
                    $addFields: {
                        owner: {
                            $first: "$owner"
                        }
                    }
                }
            ]   
        },

    }
]);

if(user.length === 0){
    throw new ApiError(404, "User not found");
}

return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
});

export { registerUser, loginUser, logoutUser, updateAccessToken, changeCurrentPassword, getUserProfile, updateUserProfile, updateUserAvatar, getUserChannelProfile, getWatchHistory };   