import mongoose from "mongoose";

import { WatchHistory } from "../models/watchhistory.model.js";
import { Video } from "../models/video.model.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addToWatchHistory = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    // 1. Validate video ID
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid videoId");
    }

    // 2. Check whether video exists
    const video = await Video.findOne({
        _id: videoId,
        isPublished: true
    });

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    // 3. Check whether user already watched this video
    const existingHistory = await WatchHistory.findOne({
        video: videoId,
        watchedBy: req.user._id
    });

    // 4. If already exists, update watched time
    if (existingHistory) {

        existingHistory.lastViewedAt = new Date();

        await existingHistory.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                "Watch history updated successfully",
                existingHistory
            )
        );
    }

    // 5. Create new watch history
    const history = await WatchHistory.create({
        video: videoId,
        watchedBy: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "Video added to watch history successfully",
            history
        )
    );
});


const getWatchHistory = asyncHandler(async (req, res) => {

    const history = await WatchHistory.find({
        watchedBy: req.user._id
    })
    .populate({
        path: "video",
        select: "title thumbnail duration views owner"
    })
    .sort({
        updatedAt: -1
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Watch history fetched successfully",
            history
        )
    );
});


const removeFromWatchHistory = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    // 1. Validate video ID
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid videoId");
    }

    // 2. Find and delete user's history for this video
    const history = await WatchHistory.findOneAndDelete({
        video: videoId,
        watchedBy: req.user._id
    });

    if (!history) {
        throw new APIError(
            404,
            "Video not found in watch history"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Video removed from watch history successfully",
            null
        )
    );
});


export {
    addToWatchHistory,
    getWatchHistory,
    removeFromWatchHistory
};
