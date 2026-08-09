// first through multer user will upload file 
//we will keep this file in local server
//then it will take local path of this file and upload it to cloudinary
//then as file get uploaded to cloudinary we will remove the file from local server
//then we will get the url of this file
//then we will save this url in our database
//then we will use this url to display the image
//to handle file there is a package called fs which is used to handle files in node.js
//fs allow user to read write delete files and folders
//fs.unlinkSync(path) is used to delete the file from local server

import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        //file has been uploaded successfully
        // console.log(response);
        // console.log("File uploaded successfully", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        //remove the file from local server if upload fails 
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary }