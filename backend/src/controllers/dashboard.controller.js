import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";

const getChannelStats = asyncHandler(async (req, res) => {

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const stats = await Video.aggregate([

        // 1. Get videos owned by the logged-in user
        {
            $match: {
                owner: userId
            }
        },

        // 2. Get likes for each video
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },

        // 3. Get comments for each video
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },

        // 4. Count likes and comments
        {
            $addFields: {
                likeCount: {
                    $size: "$likes"
                },

                commentCount: {
                    $size: "$comments"
                }
            }
        },

        // 5. Calculate totals
        {
            $group: {
                _id: null,

                totalVideos: {
                    $sum: 1
                },

                totalViews: {
                    $sum: "$views"
                },

                totalLikes: {
                    $sum: "$likeCount"
                },

                totalComments: {
                    $sum: "$commentCount"
                }
            }
        }
    ]);

    // 6. Get total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: req.user._id
    });

    // 7. Handle case where user has no videos
    const result = stats[0] || {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
    };

    // 8. Add subscriber count
    const finalStats = {
        ...result,
        totalSubscribers
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            "Channel statistics fetched successfully",
            finalStats
        )
    );
});

export {
    getChannelStats
};
