import { v2 as cloudinary } from "cloudinary";

/**
 * Deletes a resource from Cloudinary by public_id.
 * @param {string} publicId - The public_id of the resource to delete.
 * @returns {Promise<object>} - The result from Cloudinary.
 */


export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error("Failed to delete from Cloudinary: " + error.message);
    }
};