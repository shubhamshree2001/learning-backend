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

// extract public_id from a cloudinary url
// eg: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/file.jpg -> folder/file
const getPublicIdFromUrl = (url) => {
    if (!url) return null;

    // if already a public_id (no http), return as is
    if (!url.includes("cloudinary.com")) return url;

    const parts = url.split("/");
    const uploadIndex = parts.findIndex((part) => part === "upload");
    if (uploadIndex === -1) return null;

    // skip "upload" and optional version segment like v1234567890
    let publicIdParts = parts.slice(uploadIndex + 1);
    if (publicIdParts[0]?.startsWith("v") && /^v\d+$/.test(publicIdParts[0])) {
        publicIdParts = publicIdParts.slice(1);
    }

    const publicIdWithExt = publicIdParts.join("/");
    return publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove file extension
};

const deleteFromCloudinary = async (fileUrlOrPublicId) => {
    try {
        if (!fileUrlOrPublicId) return null;

        const publicId = getPublicIdFromUrl(fileUrlOrPublicId);
        if (!publicId) return null;

        // destroy removes the asset from cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto",
        });

        // response.result is "ok" when deleted, "not found" if missing
        return response;
    } catch (error) {
        console.log("Error while deleting from cloudinary", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary }
