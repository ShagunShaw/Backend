import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const toggleLikeOnComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const user = req.user;

    if(!commentId){
        throw new ApiError(400, "Comment ID is missing in params");
    }

    if(!user){
        throw new ApiError(401, "You need to be logged in to like a comment");
    }

    // Checking if this comment exists or not
    const comment= await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment with this id not found");
    }

    const isLiked = await Like.findOne({ comment: commentId, likedBy: user._id });

    let message = "";
    let like = null;
    if(isLiked)
    {
        like= await Like.findOneAndDelete({ comment: commentId, likedBy: user._id });
        message = "Like removed from comment";
    }
    else
    {
        like = await Like.create({ comment: commentId, likedBy: user._id });
        message = "Like created on comment";
    }

    res.status(201)
       .json(new ApiResponse(200, like, message));
})


export const toggleLikeOnVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;

    if(!videoId){
        throw new ApiError(400, "Video ID is missing in params");
    }

    if(!user){
        throw new ApiError(401, "You need to be logged in to like a video");
    }

    // Checking if this video exists or not
    const video= await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video with this id not found");
    }

    const isLiked = await Like.findOne({ video: videoId, likedBy: user._id });

    let message = "";
    let like = null;
    if(isLiked)
    {
        like = await Like.findOneAndDelete({ video: videoId, likedBy: user._id });
        message = "Like removed from video";
    }
    else
    {
        like = await Like.create({ video: videoId, likedBy: user._id });
        message = "Like created on video";
    }

    res.status(201)
       .json(new ApiResponse(200, like, message));
})


export const toggleLikeOnTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const user = req.user;

    if(!tweetId){
        throw new ApiError(400, "Tweet ID is missing in params");
    }

    if(!user){
        throw new ApiError(401, "You need to be logged in to like a tweet");
    }

    // Checking if this tweet exists or not
    const tweet= await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet with this id not found");
    }

    const isLiked = await Like.findOne({ tweet: tweetId, likedBy: user._id });

    let message = "";
    let like = null;
    if(isLiked)
    {
        like = await Like.findOneAndDelete({ tweet: tweetId, likedBy: user._id });
        message = "Like removed from tweet";
    }
    else
    {
        like = await Like.create({ tweet: tweetId, likedBy: user._id });
        message = "Like created on tweet";
    }

    res.status(201)
       .json(new ApiResponse(200, like, message));
})




export const isCommentLikedByUser = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const user = req.user;

    if(!commentId){
        throw new ApiError(400, "Comment ID is missing in params");
    }

    if(!user){
        throw new ApiError(401, "You need to be logged in to check if a comment is liked by you or not");
    }

    // Checking if this comment exists or not
    const comment= await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment with this id not found");
    }


    const like = await Like.findOne({ comment: commentId, likedBy: user._id });

    if(like)
    {
        res.status(200).json(new ApiResponse(200, { liked: true }, "Comment is liked by user"));
    }
    else
    {
        res.status(200).json(new ApiResponse(200, { liked: false }, "Comment is not liked by user"));
    }
})


export const isVideoLikedByUser = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;

    if(!videoId){
        throw new ApiError(400, "Video ID is missing in params");
    }

    if(!user){
        throw new ApiError(401, "You need to be logged in to check if a video is liked by you or not");
    }

    // Checking if this video exists or not
    const video= await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video with this id not found");
    }


    const like = await Like.findOne({ video: videoId, likedBy: user._id });

    if(like)
    {
        res.status(200).json(new ApiResponse(200, { liked: true }, "Video is liked by user"));
    }
    else
    {
        res.status(200).json(new ApiResponse(200, { liked: false }, "Video is not liked by user"));
    }
})


export const isTweetLikedByUser = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const user = req.user;

    if(!tweetId){
        throw new ApiError(400, "Tweet ID is missing in params");
    }

    if(!user){
        throw new ApiError(401, "You need to be logged in to check if a tweet is liked by you or not");
    }

    // Checking if this tweet exists or not
    const tweet= await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet with this id not found");
    }


    const like = await Like.findOne({ tweet: tweetId, likedBy: user._id });

    if(like)
    {
        res.status(200).json(new ApiResponse(200, { liked: true }, "Tweet is liked by user"));
    }
    else
    {
        res.status(200).json(new ApiResponse(200, { liked: false }, "Tweet is not liked by user"));
    }
})




export const likeCountOnComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if(!commentId){
        throw new ApiError(400, "Comment ID is missing in params");
    }

    // Checking if this comment exists or not
    const comment= await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment with this id not found");
    }

    const likeCount = await Like.countDocuments({ comment: commentId });
    if(!likeCount){     // i.e. if there are no likes on this comment
        res.status(200)
           .json(new ApiResponse(200, 0 , "Like count fetched for comment"));
    }

    res.status(200)
       .json(new ApiResponse(200, likeCount , "Like count fetched for comment"));
})


export const likeCountOnVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(400, "Video ID is missing in params");
    }

    // Checking if this video exists or not
    const video= await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video with this id not found");
    }

    const likeCount = await Like.countDocuments({ video: videoId });
    if(!likeCount){     // i.e. if there are no likes on this video
        res.status(200)
           .json(new ApiResponse(200, 0 , "Like count fetched for video"));
    }

    res.status(200)
       .json(new ApiResponse(200, likeCount , "Like count fetched for video"));
})


export const likeCountOnTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!tweetId){
        throw new ApiError(400, "Tweet ID is missing in params");
    }

    // Checking if this tweet exists or not
    const tweet= await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet with this id not found");
    }

    const likeCount = await Like.countDocuments({ tweet: tweetId });
    if(!likeCount){     // i.e. if there are no likes on this tweet
        res.status(200)
           .json(new ApiResponse(200, 0 , "Like count fetched for tweet"));
    }

    res.status(200)
       .json(new ApiResponse(200, likeCount , "Like count fetched for tweet"));
})


export const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Aggregation pipeline to get liked videos with details
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$ownerDetails"
                    },
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            videoFile: 1,
                            duration: 1,
                            views: 1,
                            ownerDetails: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $sort: {
                createdAt: -1 // Most recently liked first
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        },
        {
            $project: {
                _id: 1,
                videoDetails: 1,
                createdAt: 1
            }
        }
    ]);
    
    // Get total count
    const totalLikedVideos = await Like.countDocuments({
        likedBy: req.user._id,
        video: { $exists: true, $ne: null }
    });
    
    const totalPages = Math.ceil(totalLikedVideos / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    likedVideos,
                    pagination: {
                        currentPage: pageNumber,
                        totalPages,
                        totalLikedVideos,
                        limit: limitNumber,
                        hasNextPage,
                        hasPrevPage
                    }
                },
                "Liked videos fetched successfully"
            )
        );
});