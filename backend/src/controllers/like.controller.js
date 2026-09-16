import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // 1. Validate videoId
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

    // 3. Check whether current user already liked the video
    const existingLike = await Like.findOne({
        video: videoId,
        owner: req.user._id
    });

    // 4. If already liked → remove like
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(
                200,
                "Video unliked successfully",
                null
            )
        );
    }

    // 5. If not liked → create like
    const like = await Like.create({
        video: videoId,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "Video liked successfully",
            like
        )
    );
});


const getVideoLikeInfo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid videoId");
    }

    const video = await Video.findOne({
        _id: videoId,
        isPublished: true
    });

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    const likeCount = await Like.countDocuments({
        video: videoId
    });

    const existingLike = await Like.findOne({
        video: videoId,
        owner: req.user._id
    });

    const isLiked = !!existingLike;

    return res.status(200).json(
        new ApiResponse(
            200,
            "Video like information fetched successfully",
            {
                likeCount,
                isLiked
            }
        )
    );
});

export {
    toggleVideoLike,
    getVideoLikeInfo
};
