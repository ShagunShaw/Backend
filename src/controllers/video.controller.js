import {  asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js"


export const getVideosByRecommendation= asyncHandler(async (req, res) => {
    // Yh wala agr kbhi possible ho toh ai use krke daal dena
})


export const getAllVideosOfUser= asyncHandler(async (req, res) => {
    const { userId }= req.params

    if(!userId)
    {
        throw new ApiError(400, "User id is required")
    }

    const videos= await Video.find({ owner: userId, playlist: null }).sort({ createdAt: -1 })        // -1 means descending order

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
    const user= req.user

    const { title, description }= req.body

    if(!title || !description)
    {
        throw new ApiError(400, "Title and description are required")
    }


    if(!req.files || !req.files.videoFile || !req.files.thumbnail)
    {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const videoFile= req.files?.videoFile?.[0]?.path
    const thumbnail= req.files?.thumbnail?.[0]?.path


    
    const uploadVideo= await uploadOnCloudinary(videoFile)
    const uploadThumbnail= await uploadOnCloudinary(thumbnail)

    if(!uploadVideo)
    {
        throw new ApiError(500, "Error uploading video")
    }

    if(!uploadThumbnail)
    {
        throw new ApiError(500, "Error uploading thumbnail")
    }


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
    const user= req.user

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
    const thumbnailPublicIdMatch = video.thumbnail.match(/\/([^/]+)\.[a-zA-Z]+$/);
    if (thumbnailPublicIdMatch && thumbnailPublicIdMatch[1]) {
        const thumbnailPublicId = thumbnailPublicIdMatch[1];
        const deletedThumbnailFromCloudinary = await deleteFromCloudinary(thumbnailPublicId, 'image');
        if (!deletedThumbnailFromCloudinary) {
            throw new ApiError(500, "Error deleting thumbnail from Cloudinary");
        }
    }


    const arr = video.videoFile.split("/");
    const videoPublicIdMatch = arr[arr.length- 1].split(".")[0]
    if (videoPublicIdMatch) {
        const deletedVideoFromCloudinary = await deleteFromCloudinary(videoPublicIdMatch, 'video');
        if (!deletedVideoFromCloudinary) {
            throw new ApiError(500, "Error deleting video from Cloudinary");
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
    const user= req.user

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
    const thumbnail= req.file?.path;        // Note: updating thumbnail is optional

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
            const deletedTThumbnail = await deleteFromCloudinary(publicId, 'image');
            if (!deletedTThumbnail) {
                throw new ApiError(500, "Error deleting previous thumbnail, aborting update");
            }
        }

        // Upload the new thumbnail to Cloudinary
        uploadedThumbnail = await uploadOnCloudinary(thumbnail);
        if (!uploadedThumbnail) {
            throw new ApiError(500, "Error uploading thumbnail");
        }
    }


    const updatedVideo= await Video.findByIdAndUpdate(videoId, {
        title: title || video.title,
        description: description || video.description,
        thumbnail: uploadedThumbnail.url || video.thumbnail
    }, { new: true })


    res.status(200)
       .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})


// See how you can add pagination to it
export const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // fetch paginated videos
    const videosList = await Video.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

    // pagination meta
    const totalVideos = await Video.countDocuments();
    const totalPages = Math.ceil(totalVideos / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    const pagination = {
        currentPage: pageNumber,
        totalPages,
        totalVideos,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
    };

    // ensure the variable named `videos` is the object your frontend expects
    const videos = {
        videos: videosList,
        pagination
    };

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
})