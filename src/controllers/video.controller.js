import {  asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js"
import fs from "fs/promises"


export const getVideosByRecommendation= asyncHandler(async (req, res) => {
    // Yh wala agr kbhi possible ho toh ai use krke daal dena
})


export const getAllVideosOfUser= asyncHandler(async (req, res) => {
    const { userId }= req.params

    if(!userId)
    {
        throw new ApiError(400, "User id is required")
    }

    const videos= await Video.find({ owner: userId, playlist: "NONE" }).sort({ createdAt: -1 })        // -1 means descending order

    if(!videos)
    {
        throw new ApiError(404, "No videos found for this user, check the playlist instead")
    }

    res.status(200)
       .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})


export const getVideoById= asyncHandler(async (req, res) => {
    const { videoId }= req.params

    if(!videoId)
    {
        throw new ApiError(400, "Video id is required")
    }

    const video= await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(404, "Video of this ID not found")
    }

    res.status(200)
       .json(new ApiResponse(200, video, "Video fetched successfully"))
})


export const uploadVideo= asyncHandler(async (req, res) => {
    if(!req.user)
    {
        throw new ApiError(401, "You must be logged in to upload video")
    }
    const { user }= req.user

    const { title, description }= req.body

    if(!title || !description)
    {
        throw new ApiError(400, "Title and description are required")
    }


    if(!req.files || !req.files.videoFile || !req.files.thumbnail)
    {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const videoFile= req.file?.videoFile?.[0]?.path
    const thumbnail= req.files?.thumbnail?.[0]?.path


    
    const uploadVideo= await uploadOnCloudinary(videoFile)
    const uploadThumbnail= await uploadOnCloudinary(thumbnail)

    if(!uploadVideo || !uploadThumbnail)
    {
        throw new ApiError(500, "Error uploading video or thumbnail")
    }


    await fs.unlink(videoFile)         
    await fs.unlink(thumbnail)         


    const newVideo= await Video.create({
        owner: user._id,
        title,
        description,
        duration: uploadVideo.duration,       // Duration will be provided by cloudinary
        videoFile: uploadVideo.url,
        thumbnail: uploadThumbnail.url
    })

    res.status(201)
       .json(new ApiResponse(201, newVideo, "Video uploaded successfully"))
})


export const deleteVideoById= asyncHandler(async (req, res) => {
    const { videoId }= req.params
    const { user }= req.user

    if(!videoId)
    {
        throw new ApiError(400, "Video id is missing")
    }

    const video= await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(404, "Video of this ID not found")
    }

    if(video.owner.toString() !== user._id.toString())
    {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    // To delete video and thumbnail from cloudinary as well
    const videoPublicIdMatch = video.videoFile.match(/\/([^/]+)\.[a-zA-Z]+$/);
    const thumbnailPublicIdMatch = video.thumbnail.match(/\/([^/]+)\.[a-zA-Z]+$/);

    if (videoPublicIdMatch && videoPublicIdMatch[1]) {
        const videoPublicId = videoPublicIdMatch[1];
        const deletedVideoFromCloudinary = await deleteFromCloudinary(videoPublicId);
        if (!deletedVideoFromCloudinary) {
            throw new ApiError(500, "Error deleting video from Cloudinary");
        }
    }

    if (thumbnailPublicIdMatch && thumbnailPublicIdMatch[1]) {
        const thumbnailPublicId = thumbnailPublicIdMatch[1];
        const deletedThumbnailFromCloudinary = await deleteFromCloudinary(thumbnailPublicId);
        if (!deletedThumbnailFromCloudinary) {
            throw new ApiError(500, "Error deleting thumbnail from Cloudinary");
        }
    }

    const deletedVideo= await Video.findByIdAndDelete(videoId)
    if(!deletedVideo)
    {
        throw new ApiError(500, "Error deleting video")
    }

    res.status(200)
       .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"))
})


export const updateVideoById= asyncHandler(async (req, res) => {
    const { videoId }= req.params
    const { user }= req.user

    if(!videoId)
    {
        throw new ApiError(400, "Video id is missing")
    }   

    const video= await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(404, "Video of this ID not found")
    }

    if(video.owner.toString() !== user._id.toString())
    {
        throw new ApiError(403, "You are not authorized to update details of this video")
    }


    const { title, description }= req.body
    const thumbnail= req.file?.thumbnail?.[0]?.path;

    // Yha pe frontend pe jb user update krne jaega, toh uska already exisiting title and description wha present hoag, bss wo wha pe usko edit krr skta h
    if(title === "" || description === "")
    {
        throw new ApiError(400, "Title and description cannot be empty")
    }

    let uploadedThumbnail= null
    if(thumbnail)
    {
        // Delete the previous thumbnail from Cloudinary
        const prevThumbnailUrl = video.thumbnail;

        // Extract public_id from the previous thumbnail URL
        const publicIdMatch = prevThumbnailUrl.match(/\/([^/]+)\.[a-zA-Z]+$/);

        if (publicIdMatch && publicIdMatch[1]) {
            const publicId = publicIdMatch[1];
            const deletedTThumbnail = await deleteFromCloudinary(publicId);
            if (!deletedTThumbnail) {
                throw new ApiError(500, "Error deleting previous thumbnail, aborting update");
            }
        }

        // Upload the new thumbnail to Cloudinary
        uploadedThumbnail = await uploadOnCloudinary(thumbnail);
        if (!uploadedThumbnail) {
            throw new ApiError(500, "Error uploading thumbnail");
        }


        await fs.unlink(thumbnail);
    }


    const updatedVideo= await Video.findByIdAndUpdate(videoId, {
        title: title || video.title,
        description: description || video.description,
        thumbnail: uploadedThumbnail.url || video.thumbnail
    }, { new: true })


    res.status(200)
       .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})