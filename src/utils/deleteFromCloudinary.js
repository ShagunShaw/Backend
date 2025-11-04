import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError.js";

/**
 * Deletes a resource from Cloudinary by public_id.
 * @param {string} publicId - The public_id of the resource to delete.
 * @returns {Promise<object>} - The result from Cloudinary.
 */


export const deleteFromCloudinary = async (publicId, resourceType) => {
    try {
        let result= null;

        if(resourceType === 'image')    result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        else if (resourceType === 'video')    result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        
        if(result === null) {
            throw new ApiError(500, "Invalid resource type for Cloudinary deletion. The result value is null here");
        }

        return result;
    } catch (error) {
        throw new ApiError(500, "Failed to delete from Cloudinary: " + error.message);
    }
};