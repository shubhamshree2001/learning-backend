
//import mongoose from "mongoose";
import mongoose,{ Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, // easy for searching in database
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true, // easy for searching in database
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String,
    },
     watchHistory: [
        {
            type:  Schema.Types.ObjectId,
            ref: "Video",
        },
     ],
     password: {
        type: String,
        required: [true, "Password is required"],
     },
     refreshToken: {
        type: String,
     },
}, { timestamps: true });

// so the first this is "save" this is a hook that is going to be executed before the data is saved in the database
//second thing is async function() {} this is a function that is going to be executed before the data is saved in the database
//it is a callback function but dont write it like ()=>{}
//third thing is async function() {} because it takes time to encrypt and decrypt the password 
// in mongoose 7+, async middleware should NOT use next() — just return when done
userSchema.pre("save", async function() {
    // so that encryption is not done again and again if the password is not modified
    // as userscheme has lot of other field 
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// now we will create some methods so that we can verify the password when user sends and we save the encrypted one
//creatong custom methods in mongoose schema
userSchema.methods.isPasswordCorrect = async function(password) {
    // first password is the password that user sends
    // second password is the encrypted password that is saved in the database
    return await bcrypt.compare(password, this.password);
};

// now we will create a method to generate a jwt token
userSchema.methods.generateAccessToken = function() {
    // the sign method need two things first is the payload and second is the secret key and third is the expires in
    //_id is taken from database
    // the payload is the data that we want to store in the token
    // the secret key is the key that we use to sign the token
    // the expires in is the time after which the token will expire
    // so we are signing the token with the user id and the secret key and the expires in
    // so when user sends a request to the server , the server will verify the token and if it is valid then it will allow the user to access the resource
    // if it is not valid then it will return an error
    return jwt.sign({ _id: this._id, email: this.email, fullName: this.fullName ,username: this.username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};

export const User = mongoose.model("User", userSchema);
