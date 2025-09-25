import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const createLikeOnComment = asyncHandler(async (req, res) => {
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

    const like = await Like.create({ comment: commentId, likedBy: user._id });

    res.status(201)
       .json(new ApiResponse(200, "Like created on comment", like));
})


export const createLikeOnVideo = asyncHandler(async (req, res) => {
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

    const like = await Like.create({ video: videoId, likedBy: user._id });

    res.status(201)
       .json(new ApiResponse(200, "Like created on video", like));
})


export const createLikeOnTweet = asyncHandler(async (req, res) => {
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

    const like = await Like.create({ tweet: tweetId, likedBy: user._id });

    res.status(201)
       .json(new ApiResponse(200, "Like created on tweet", like));
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




export const removeLikeOnComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const user = req.user;

    if(!commentId){
        throw new ApiError(400, "Comment ID is missing in params");
    }

    if(!user){
        throw new ApiError(401, "You need to be logged in to remove your like from a comment");
    }

    // Checking if this comment exists or not
    const comment= await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment with this id not found");
    }

    const like = await Like.findOneAndDelete({ comment: commentId, likedBy: user._id });

    if(like)
    {
        res.status(200).json(new ApiResponse(200, { removed: true }, "Like removed from comment"));
    }
    else
    {
        res.status(200).json(new ApiResponse(200, { removed: false }, "You have not liked this comment"));
    }
})


export const removeLikeOnVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;

    if(!videoId){
        throw new ApiError(400, "Video ID is missing in params");
    }

    if(!user){
        throw new ApiError(401, "You need to be logged in to remove your like from a video");
    }

    // Checking if this video exists or not
    const video= await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video with this id not found");
    }

    const like = await Like.findOneAndDelete({ video: videoId, likedBy: user._id });

    if(like)
    {
        res.status(200).json(new ApiResponse(200, { removed: true }, "Like removed from video"));
    }
    else
    {
        res.status(200).json(new ApiResponse(200, { removed: false }, "You have not liked this video"));
    }
})


export const removeLikeOnTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const user = req.user;

    if(!tweetId){
        throw new ApiError(400, "Tweet ID is missing in params");
    }

    if(!user){
        throw new ApiError(401, "You need to be logged in to remove your like from a tweet");
    }

    // Checking if this tweet exists or not
    const tweet= await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet with this id not found");
    }

    const like = await Like.findOneAndDelete({ tweet: tweetId, likedBy: user._id });

    if(like)
    {
        res.status(200).json(new ApiResponse(200, { removed: true }, "Like removed from tweet"));
    }
    else
    {
        res.status(200).json(new ApiResponse(200, { removed: false }, "You have not liked this tweet"));
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