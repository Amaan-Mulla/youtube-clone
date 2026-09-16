import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // 1. Validate channelId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new APIError(400, "Invalid channelId");
    }

    // 2. Check whether channel/user exists
    const channel = await User.findById(channelId);

    if (!channel) {
        throw new APIError(404, "Channel not found");
    }

    // 3. Prevent subscribing to yourself
    if (req.user._id.toString() === channelId) {
        throw new APIError(400, "You cannot subscribe to yourself");
    }

    // 4. Check whether already subscribed
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    // 5. Already subscribed → unsubscribe
    if (existingSubscription) {
        await Subscription.findByIdAndDelete(
            existingSubscription._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Unsubscribed successfully",
                null
            )
        );
    }

    // 6. Not subscribed → create subscription
    const subscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "Subscribed successfully",
            subscription
        )
    );
});



const getChannelSubscriptionInfo = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // 1. Validate channelId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new APIError(400, "Invalid channelId");
    }

    // 2. Check whether channel exists
    const channel = await User.findById(channelId);

    if (!channel) {
        throw new APIError(404, "Channel not found");
    }

    // 3. Count all subscribers of this channel
    const subscriberCount = await Subscription.countDocuments({
        channel: channelId
    });

    // 4. Check whether current user subscribed to this channel
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    // 5. Convert result into true/false
    const isSubscribed = !!existingSubscription;

    return res.status(200).json(
        new ApiResponse(
            200,
            "Channel subscription information fetched successfully",
            {
                subscriberCount,
                isSubscribed
            }
        )
    );
});


const getMySubscriptions = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({
        subscriber: req.user._id
    })
        .populate(
            "channel",
            "username fullName avatar coverImage"
        )
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "My subscriptions fetched successfully",
            subscriptions
        )
    );
});

export {
    toggleSubscription,
    getChannelSubscriptionInfo,
    getMySubscriptions
};