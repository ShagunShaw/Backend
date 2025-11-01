import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";


export const toggleSubscription = asyncHandler(async (req, res, next) => {
    const { userId }= req.params
    if(!userId)
    {
        throw new ApiError(400, "User ID is missing in parameters")
    }

    if(!req.user)
    {
        throw new ApiError(401, "You must be logged in to subscribe to a channel")
    }
    const user= req.user

    const subscription= await Subscription.findOne({
        subscriber: user._id,
        channel: userId
    })

    if(subscription)
    {
        await Subscription.findOneAndDelete({
            subscriber: user._id,
            channel: userId
        })
        res.status(200)
           .json(new ApiResponse(200, null, "Unsubscribed from the channel successfully"))
    }
    else
    {
        const newSubscription= await Subscription.create({
            subscriber: user._id,
            channel: userId
        })
        res.status(201)
           .json(new ApiResponse(201, newSubscription, "Subscribed to the channel successfully"))
    }
})

export const getAllSubscriptions = asyncHandler(async (req, res, next) => {
    const user = req.user

    const subscriptions = await Subscription.find({ subscriber: user._id })
    .populate({
        path: "channel",
        select: "username fullName avatar coverImage _id"
    });

    const subscriptionsWithCount = await Promise.all(
    subscriptions.map(async (sub) => {
        const count = await Subscription.countDocuments({ channel: sub.channel._id });
        return {
        ...sub.toObject(),
        subscribersCount: count
        };
    })
    );   

    res.status(200)
       .json(new ApiResponse(200, subscriptionsWithCount, "Fetched all subscriptions successfully"))
})


export const getAllSubscribersAndTheirCount = asyncHandler(async (req, res, next) => {
    const user= req.user

    const subscribers= await Subscription.find({
        channel: user._id
    }).populate("subscriber")
    .select("-password -email -createdAt -updatedAt -refreshToken")

    const count= subscribers.length

    res.status(200)
       .json(new ApiResponse(200, { subscribers, count } , "Fetched all subscribers successfully"))
})


export const isSubscribed = asyncHandler(async (req, res, next) => {
    const { userId }= req.params
    if(!userId)
    {
        throw new ApiError(400, "User ID is missing in parameters")
    }

    const user= req.user

    const subscription= await Subscription.findOne({
        subscriber: user._id,
        channel: userId
    })


    if(!subscription)
    {
        res.status(200)
           .json(new ApiResponse(200, false, "Not subscribed to the channel"))
    }
    else
    {
        res.status(200)
           .json(new ApiResponse(200, true, "Subscribed to the channel"))
    }
})