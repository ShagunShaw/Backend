import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"



export const createPlaylist= asyncHandler(async (req, res) => {
    const { name, description }= req.body
    const user= req.user

    if(!name || name.trim()==="" || !description || description.trim()==="")
    {
        throw new ApiError(400, "Name and description are required to create a playlist")
    }

    const playlist= await Playlist.create({
        name,
        description,
        thumbnail: "",       // Since now only the playlist is created with no videos in it, so thumbnail is set to empty string. It will be updated when the first video is added to the playlist
        videos: [],
        owner: user._id
    })

    res.status(201)
       .json(new ApiResponse(201, playlist, "Playlist created successfully. Now add videos to the playlist."))
})


export const AddVideoToPlaylist= asyncHandler(async (req, res) => {
    const { playlistId }= req.params
    const { user }= req.user
    const { title, description }= req.body

    const playlist= await Playlist.findById(playlistId)
    if(!playlist)
    {
        throw new ApiError(404, "Playlist with this ID not found")
    }

    if(playlist.owner.toString() !== user._id.toString())
    {
        throw new ApiError(403, "You are not authorised to add videos to this playlist")
    }


    if(!title || !description)
    {
        throw new ApiError(400, "Title and description of the video are required")
    }

    if(!req.files || !req.files.videoFile || !req.files.thumbnail)
    {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    // Now for adding a video to the playlist, we need to upload the video first in the video model. We cant directly call the upload video controller here as it can cause several issues and is not a good practice as well. We could
    // have created a service for uploading video and then used that service in both the video and playlist controllers, but that I am not doing for now. To keep things simple, we are just writing the code for uploading videos here itself and then adding the video to the playlist.
    
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

    playlist.videos.push(newVideo._id)

    if(!playlist.thumbnail)
    {
        playlist.thumbnail= newVideo.thumbnail
    }

    await playlist.save({validateBeforeSave: false})      // We are setting validateBeforeSave to false because we are not updating all the fields of the playlist, so we dont want to run the validators on the fields which are not being updated

    res.status(201)
       .json(new ApiResponse(201, newVideo, "Video added to playlist successfully"))
})


export const deletePlaylist= asyncHandler(async (req, res) => {
    const { playlistId }= req.params
    const user= req.user

    const playlist= await Playlist.findOne({ _id: playlistId })

    if(!playlist)
    {
        throw new ApiError(404, "Playlist with this ID not found")
    }

    if(playlist.owner.toString() !== user._id.toString())
    {
        throw new ApiError(403, "You are not authorised to delete this playlist")
    }


    // Delete all videos associated with this playlist and their files from Cloudinary
    const videos = await Video.find({ _id: { $in: playlist.videos } });

    for (const video of videos) {
        // Delete video file from Cloudinary
        if (video.videoFile) {
            const videoPublicIdMatch = video.videoFile.match(/\/([^/]+)\.[a-zA-Z]+$/);
            if (videoPublicIdMatch && videoPublicIdMatch[1]) {
                await deleteFromCloudinary(videoPublicIdMatch[1]);
            }
        }
        else
        {
            throw new ApiError(500, "Video file URL is missing for a video in the playlist")
        }


        // Delete thumbnail from Cloudinary
        if (video.thumbnail) {
            const thumbPublicIdMatch = video.thumbnail.match(/\/([^/]+)\.[a-zA-Z]+$/);
            if (thumbPublicIdMatch && thumbPublicIdMatch[1]) {
                await deleteFromCloudinary(thumbPublicIdMatch[1]);
            }
        }
        else
        {
            throw new ApiError(500, "Thumbnail URL is missing for a video in the playlist")
        }
    }

    // Delete all videos from the database
    await Video.deleteMany({ _id: { $in: playlist.videos } })


    // Delete the playlist itself
    await playlist.deleteOne()

    res.status(200)
       .json(new ApiResponse(200, playlist, "Playlist deleted successfully"))
})


export const getPlaylistById= asyncHandler(async (req, res) => {
    const { playlistId }= req.params

    if(!playlistId)
    {
        throw new ApiError(400, "Playlist id is missing in params")
    }

    const playlist= await Playlist.findById(playlistId)
    if(!playlist)
    {
        throw new ApiError(404, "Playlist of this ID not found")
    }

    res.status(200)
       .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})


export const getAllPlaylistsOfUser= asyncHandler(async (req, res) => {
    const { userId }= req.params

    if(!userId)
    {
        throw new ApiError(400, "User id is missing in params")
    }

    const playlists= await Playlist.find({ owner: userId })

    res.status(200)
       .json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
})


export const removeVideoFromPlaylist= asyncHandler(async (req, res) => {
    const { playlistId, videoId }= req.params
    const user= req.user

    if(!playlistId || !videoId)
    {
        throw new ApiError(400, "Playlist id or video id is missing in params")
    }

    const playlist= await Playlist.findById(playlistId)
    if(!playlist)
    {
        throw new ApiError(404, "Playlist with this ID not found")
    }

    if(playlist.owner.toString() !== user._id.toString())
    {
        throw new ApiError(403, "You are not authorised to remove videos from this playlist")
    }

    const video= await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(404, "Video with this ID not found")
    }

    if(playlist.thumbnail === video.thumbnail)
    {
        const nextVideoId= playlist.videos[1]       // Since the first video is being removed, so the next video will be at index 1, and now we will put the index of next video in the thumbnail
        const nextVideo= await Video.findById(nextVideoId)
        if(nextVideo)
        {
            playlist.thumbnail= nextVideo.thumbnail
        }
    }

    // Delete the thumbnail from Cloudinary before deleting the video document
    const thumbnailUrl = video.thumbnail;
    if (thumbnailUrl) {
        // Extract public_id from the Cloudinary URL
        const publicIdMatch = thumbnailUrl.match(/\/([^/]+)\.[a-zA-Z]+$/);
        
        if (publicIdMatch && publicIdMatch[1]) {
            const publicId = publicIdMatch[1];
            await deleteFromCloudinary(publicId);
        }
    }
    else
    {
        throw new ApiError(500, "Thumbnail URL is missing for the video being removed")
    }


    const videoURL= video.videoFile;
    if(videoURL)
    {
        const publicIdMatch = videoURL.match(/\/([^/]+)\.[a-zA-Z]+$/);
        if (publicIdMatch && publicIdMatch[1]) {
            const publicId = publicIdMatch[1];
            await deleteFromCloudinary(publicId);
        }
    }
    else
    {
        throw new ApiError(500, "Video file URL is missing for the video being removed")
    }

    await video.deleteOne()

    playlist.videos.pull(videoId)
    await playlist.save({validateBeforeSave: false})

    res.status(200)
       .json(new ApiResponse(200, video, "Video removed from playlist successfully"))
})


export const updatePlaylist= asyncHandler(async (req, res) => {
    const { playlistId }= req.params
    const user= req.user

    if(!playlistId)
    {
        throw new ApiError(400, "Playlist id is missing in params")
    }

    if(playlist.owner.toString() !== user._id.toString())
    {
        throw new ApiError(403, "You are not authorised to update this playlist")
    }

    const { title, description }= req.body
    if(!title || !description)
    {
        throw new ApiError(400, "Title and description are required")
    }

    const playlist= await Playlist.findById(playlistId)
    if(!playlist)
    {
        throw new ApiError(404, "Playlist with this ID not found")
    }


    const updatedPlaylist= await Playlist.findByIdAndUpdate(playlistId, {
        name: title || playlist.name,
        description: description || playlist.description
    }, { new: true })

    res.status(200)
       .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})