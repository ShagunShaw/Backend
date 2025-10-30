import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";


export const addCommentOnVideo= asyncHandler(async (req, res) => {
    const { videoId }= req.params
    const video= await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(404, "Video not found")
    }

    const { content } = req.body
    if(!content || content.trim()==="")      
    {
        throw new ApiError(400, "Comment is required")
    }

    if(!req.user)
    {
        throw new ApiError(401, "You must be logged in to add comment")
    }
    const user = req.user


    const newComment= await Comment.create({
        content: content,
        video: videoId,
        owner: user._id
    })

    res.status(201)
       .json(new ApiResponse(201, newComment, "Comment added successfully"))
})



export const getAllCommentsOfVideo= asyncHandler(async (req, res) => {
    const { videoId }= req.params

    const video= await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(404, "Video not found")
    }

    const commentExists = await Comment.exists({ video: videoId }); // Check if any comment exists for this videoId
    if (!commentExists) {
        throw new ApiError(404, "No comment exists in this video. Be the 1st one to comment");
    }

    const comments = await Comment.aggregate([
    {
        $match: { video: new mongoose.Types.ObjectId(videoId) }
    },
    {
        $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDetails',
        pipeline: [
            { $project: { avatar: 1, fullName: 1, username: 1 } }
        ]
        }
    },
    { $unwind: '$ownerDetails' },
    {
        $project: {
        content: 1,
        isEdited: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: 1,
        ownerDetails: 1,
        video: 1      // check kro why this 'video' filed is not coming in the response
        }
    },
    { $sort: { createdAt: -1 } }    // Sort comments by creation date in descending order
    ]);                     

    res.status(200)
       .json(new ApiResponse(200, { comments }, "Comments fetched successfully"))
}
)



export const editComment= asyncHandler(async (req, res) => {
    const { commentId, videoId }= req.params

    const video= await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(404, "Video not found")
    }

    const comment= await Comment.findById(commentId)
    if(!comment)
    {
        throw new ApiError(404, "Comment not found")
    }

    const { newComment } = req.body
    if(!newComment || newComment.trim()==="")
    {
        throw new ApiError(400, "Could not edit comment as there is nothing in the new comment")
    }

    if(!req.user)
    {
        throw new ApiError(401, "You must be logged in to edit comment")
    }
    const user = req.user

    if(user._id.toString() !== comment.owner.toString())   // Only the owner of the comment can edit the comment
    {
        throw new ApiError(403, "You are not authorized to edit this comment")
    }

    const updatedComment= await Comment.findOneAndUpdate(
        { _id: commentId, video: videoId, owner: user._id },     // yeh 3 cheezein match krni chahiye tabhi comment update hoga
        { content: newComment, isEdited: true },
        { new: true }       // yeh 'new: true' isliye likha h taaki updated comment hi return ho
    )

    if(!updatedComment)
    {
        throw new ApiError(500, "Something went wrong. Could not update comment")
    }

    res.status(200)
       .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
}
)



export const deleteComment= asyncHandler(async (req, res) => {
    const { commentId, videoId }= req.params

    const video= await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(404, "Video not found")
    }

    const comment= await Comment.findById(commentId)
    if(!comment)
    {
        throw new ApiError(404, "Comment not found")
    }

    if(!req.user)
    {
        throw new ApiError(401, "You must be logged in to delete comment")
    }
    const user = req.user


    if(user._id.toString() !== comment.owner.toString())   // Only the owner of the comment can delete the comment
    {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    const deletedComment= await Comment.findOneAndDelete(
        { _id: commentId, video: videoId, owner: user._id }
    )

    if(!deletedComment)
    {
        throw new ApiError(500, "Something went wrong. Could not delete comment")
    }

    res.status(200)
       .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"))
}
)