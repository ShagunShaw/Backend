import { asyncHandler } from "../utils/asyncHandler.js";    
import Tweet from "../models/tweet.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";


export const createTweet = asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    if(!content){
        return next(new apiError(400, "Content is required"))
    }

    let image = null;
    if(req.file)        // Making the image upload optional
    {
        const uploadedImage= req.file.image[0].path

        image = await uploadOnCloudinary(uploadedImage);
        if(!image){
            return next(new apiError(400, "Image upload failed"))
        }

        fs.unlinkSync(uploadedImage)  
    }

    const tweet = await Tweet.create({
        owner: req.user._id,
        content,
        image: image ? image.url : null
    })

    res.status(201)
       .json(new apiResponse(201, tweet, "Tweet created successfully"))
})


export const getAllTweetsByID = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    const tweets = await Tweet.find({ owner: userId })
                              .sort({ createdAt: -1 })

    res.status(200)
       .json(new apiResponse(200, tweets, "Tweets fetched successfully"))
})


export const getAllTweetsOfUser = asyncHandler(async (req, res, next) => {
    const user= req.user

    const tweets = await Tweet.find({ owner: user._id })
                              .sort({ createdAt: -1 })

    res.status(200)
       .json(new apiResponse(200, tweets, "Your tweets are fetched successfully"))
})


export const updateTweetByID = asyncHandler(async (req, res, next) => {
    const { tweetId } = req.params;
    const user = req.user

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        return next(new apiError(404, "Tweet of this ID not found"))
    }

    if(tweet.owner.toString() !== user._id.toString()){
        return next(new apiError(403, "You are not authorized to update this tweet"))
    }

    const { content } = req.body;
    if(!content){
        return next(new apiError(400, "Content is required"))
    }

    const image= null;
    if(req.file)        
    {
        const uploadedImage= req.file.image[0].path
        image = await uploadOnCloudinary(uploadedImage);

        if(!image){
            return next(new apiError(400, "Image upload failed"))
        }

        fs.unlinkSync(uploadedImage)

        // To delete the previous image from cloudinary
        if(tweet.image){
            const public_id = tweet.image.split("/").pop().split(".")[0];
            await deleteFromCloudinary(public_id);
        }
    }

    tweet.content = content;
    if(image){
        tweet.image = image.url;
    }
    tweet.isEdited = true;

    await tweet.save();

    res.status(200)
       .json(new apiResponse(200, tweet, "Tweet updated successfully"))
})


export const deleteTweetByID = asyncHandler(async (req, res, next) => {
    const { tweetId } = req.params;
    const user = req.user

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        return next(new apiError(404, "Tweet of this ID not found"))
    }

    if(tweet.owner.toString() !== user._id.toString()){
        return next(new apiError(403, "You are not authorized to delete this tweet"))
    }

    // To delete the previous image from cloudinary
    if(tweet.image){
        const public_id = tweet.image.split("/").pop().split(".")[0];
        await deleteFromCloudinary(public_id);
    }

    await tweet.remove();

    res.status(200)
       .json(new apiResponse(200, null, "Tweet deleted successfully"))
})