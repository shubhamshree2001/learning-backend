import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
 
export const verifyJwtToken = asyncHandler(async (req, res, next) => {

    try{
    // get the token from the cookie
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!accessToken){
        throw new ApiError(401, "Unauthorized");
    }

     const decodedToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

     // this _id is same key as when we have created the token
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
     if(!user){
        throw new ApiError(401, "invalid token");
     }
     // ---- discuss about frontend 


      // as we get the user , 
      //we will assign this user to the request object
      // so that we can use this user in the next middleware or controller
     req.user = user;
     next();

    } catch(error){
        throw new ApiError(401, error.message || "Unauthorized");
    }

});