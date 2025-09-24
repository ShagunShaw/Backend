// In this we are going to write the concept of storing our files (images, videos, pdfs, etc.) to our cloudinary website.

// Before proceeding, we need to know about the strategy of our workflow. We will ask the user to upload their file on the website and will
//  get those files to our backend using 'multer'. Now that we have the files, we will temporarily store it in our local server and then using 
// the 'cloudinary' package, we will upload those files to our cloudinary website.

// In this file, we are only concerned about uploading the file to out cloudinary website, assuming our file has been temporarily stored in our local server using multer.

import {v2 as cloudinary} from "cloudinary"
import fs from "fs"     // default package in npm used for file-handling
import { ApiError } from "../utils/apiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,          // You can also write it like this `${process.env.CLOUDINARY_CLOUD_NAME}`, but it's just unnecessarily extra work, we generally write like this when we're embedding them within a larger string
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


// Uploading the file
const uploadOnCloudinary= async (localFilePath) => {
    try
    {
        if(!localFilePath)         // Means that if the given path is not available, then return null
        {
            console.log(`There is no path as ${localFilePath}. Re-check your path`)
            return null
        }
        
        // Uploading 
        const response= await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"})        // 'resource_type' means what kind of file we are trying to upload: image, raw, video or auto (means khud hi dekhlo kaunsa h)

        // After file has been uploaded successfully
        fs.unlinkSync(localFilePath)    // Clean up temporary file after successful upload
        console.log("File has been uploaded successfully and the response url is: ", response.url);
        
        return response
    }
    catch(error)
    {
        fs.unlinkSync(localFilePath)    // remove the locally saved temporary file as the upload operation got failed
        // We could have also used 'unlink' here, but we are using 'unlinkSync' because we are specifying explicitly that we don't want to proceed futher before my unlinking has been successfully completed. 

        throw new ApiError(500, "Error uploading file to Cloudinary and the error is: " + error.message)
    }
}


export {uploadOnCloudinary}