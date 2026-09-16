
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    uploadCloudinary,
    deleteCloudinary,
    removeLocalFile
} from "../utils/cloudinary.js";
import { getVideoDuration } from "../utils/videoMetadata.js";
import mongoose from "mongoose";
import { WatchHistory } from "../models/watchhistory.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { CommentLike } from "../models/commentlike.model.js";
import { Playlist } from "../models/playlist.model.js";



const getAllVideos = asyncHandler(async (req, res) => {

    // Get query parameters
    // Default page = 1
    // Default limit = 10
    const {
        page = 1,
        limit = 10,
        query,
        sortBy,
        sortType,
        userId
    } = req.query;

    const filter = {
        isPublished: true
    };

    // Search by title or description
    if (query) {
        filter.$or = [
            {
                title: {
                    $regex: query,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: query,
                    $options: "i"
                }
            }
        ];
    }

    // Filter videos uploaded by a particular user
    if (userId) {

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new APIError(
                400,
                "Invalid userId"
            );
        }

        filter.owner = userId;
    }

    // Sorting
    const sort = {};

    if (sortBy) {
        sort[sortBy] =
            sortType === "asc" ? 1 : -1;
    } else {
        // Default: newest videos first
        sort.createdAt = -1;
    }

    // Get videos with pagination
    const videos = await Video.paginate(
        filter,
        {
            page: Number(page),
            limit: Number(limit),
            sort,

            // Get owner information
            populate: {
                path: "owner",
                select: "username fullName avatar"
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Videos fetched successfully",
            videos
        )
    );
});


const publishVideo = asyncHandler(async (req, res) => {
    
    const { title, description} = req.body;
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    let videoUpload;
    let thumbnailUpload;

    try {
        if (!title || !description || !videoFileLocalPath || !thumbnailLocalPath) {
            throw new APIError(400, "All fields are required");
        }

        const duration = await getVideoDuration(videoFileLocalPath);
        videoUpload = await uploadCloudinary(videoFileLocalPath);

        if (!videoUpload) {
            throw new APIError(500, "Video upload failed");
        }

        thumbnailUpload = await uploadCloudinary(thumbnailLocalPath);

        if (!thumbnailUpload) {
            throw new APIError(500, "Thumbnail upload failed");
        }

        const video = await Video.create({
            videoFile: videoUpload.url,
            videoPublicId: videoUpload.public_id,

            thumbnail: thumbnailUpload.url,
            thumbnailPublicId: thumbnailUpload.public_id,
            
            
            title,
            description,
            duration,
            owner: req.user._id
        });

        return res.status(201).json(
            new ApiResponse(201, "Video published successfully", video)
        );
    } catch (error) {
        if (thumbnailUpload?.public_id) {
            await deleteCloudinary(thumbnailUpload.public_id, "image");
        }

        if (videoUpload?.public_id) {
            await deleteCloudinary(videoUpload.public_id, "video");
        }

        throw error;
    } finally {
        await removeLocalFile(videoFileLocalPath);
        await removeLocalFile(thumbnailLocalPath);
    }
});


const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId).populate(
        "owner",
        "username fullName avatar"
    );

    if (
        !video ||
        (!video.isPublished &&
            video.owner?._id?.toString() !== req.user?._id?.toString())
    ) {
        throw new APIError(404, "Video not found");
    }

    

    return res.status(200).json(
        new ApiResponse(200, "Video fetched successfully", video)
    );
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const thumbnailLocalPath = req.file?.path;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new APIError(
            403,
            "You are not authorized to update this video"
        );
    }

    const { title, description, isPublished } = req.body;

    if (title !== undefined) {
        video.title = title;
    }

    if (description !== undefined) {
        video.description = description;
    }

    if (isPublished !== undefined) {
        video.isPublished = isPublished;
    }

    if (thumbnailLocalPath) {
        const thumbnailUpload = await uploadCloudinary(thumbnailLocalPath);

        if (!thumbnailUpload) {
            throw new APIError(500, "Thumbnail upload failed");
        }

        await deleteCloudinary(video.thumbnailPublicId, "image");

        video.thumbnail = thumbnailUpload.url;
        video.thumbnailPublicId = thumbnailUpload.public_id;
    }

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Video updated successfully",
            video
        )
    );
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You are not allowed to delete this video");
    }

    await deleteCloudinary(video.videoPublicId, "video");
    await deleteCloudinary(video.thumbnailPublicId, "image");

    const commentIds = await Comment.distinct("_id", { video: videoId });

    await WatchHistory.deleteMany({ video: videoId });
    await Like.deleteMany({ video: videoId });
    await CommentLike.deleteMany({
        comment: { $in: commentIds }
    });
    await Comment.deleteMany({ video: videoId });
    await Playlist.updateMany(
        { videos: videoId },
        { $pull: { videos: videoId } }
    );
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, "Video deleted successfully", null)
    );
});



const togglePublishVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new APIError(
            403,
            "You are not authorized to update this video"
        );
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Video publish status updated successfully",
            video
        )
    );
});









const watchVideo = asyncHandler(async (req, res) => {
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

    // 3. Find user's watch history
    let history = await WatchHistory.findOne({
        video: videoId,
        watchedBy: req.user._id
    });

    const now = new Date();

    // 30 minutes in milliseconds
    const thirtyMinutes = 30 * 60 * 1000;

    let viewCounted = false;

    // 4. First time watching this video
    if (!history) {

        history = await WatchHistory.create({
            video: videoId,
            watchedBy: req.user._id,
            lastViewedAt: now
        });

        // Count the view
        video.views += 1;
        await video.save();

        viewCounted = true;

    } else {

        // 5. Calculate time since last view
        const timeSinceLastView =
            now.getTime() - history.lastViewedAt.getTime();

        // 6. Count another view only after 30 minutes
        if (timeSinceLastView >= thirtyMinutes) {

            video.views += 1;
            await video.save();

            viewCounted = true;
        }

        // Always update latest watch time
        history.lastViewedAt = now;
        await history.save();
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Video watched successfully",
            {
                views: video.views,
                viewCounted
            }
        )
    );
});


const getAllVideosAdvanced = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Validate pagination
    if (pageNumber < 1) {
        throw new APIError(400, "Page must be greater than 0");
    }

    if (limitNumber < 1) {
        throw new APIError(400, "Limit must be greater than 0");
    }

    // -----------------------------
    // 1. Build filter
    // -----------------------------

    const matchStage = {
        isPublished: true
    };

    // Search by title or description
    if (query) {
        matchStage.$or = [
            {
                title: {
                    $regex: query,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: query,
                    $options: "i"
                }
            }
        ];
    }

    // Filter videos by owner
    if (userId) {

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new APIError(
                400,
                "Invalid userId"
            );
        }

        matchStage.owner =
            new mongoose.Types.ObjectId(userId);
    }

    // -----------------------------
    // 2. Build sorting
    // -----------------------------

    const sortStage = {};

    sortStage[sortBy] =
        sortType === "asc" ? 1 : -1;

    // -----------------------------
    // 3. Aggregation
    // -----------------------------

    const result = await Video.aggregate([

        // Stage 1: Filter videos
        {
            $match: matchStage
        },

        // Stage 2: Get owner information
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },

        // Stage 3: Convert owner array into object
        {
            $unwind: "$owner"
        },

        // Stage 4: Get likes
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },

        // Stage 5: Get comments
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },

        // Stage 6: Calculate counts
        {
            $addFields: {

                likeCount: {
                    $size: "$likes"
                },

                commentCount: {
                    $size: "$comments"
                },

                isLiked: {
                    $in: [
                        new mongoose.Types.ObjectId(
                            req.user._id
                        ),
                        "$likes.owner"
                    ]
                }
            }
        },

        // Stage 7: Select required fields
        {
            $project: {

                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                description: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,

                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    fullName: "$owner.fullName",
                    avatar: "$owner.avatar"
                },

                likeCount: 1,
                commentCount: 1,
                isLiked: 1

            }
        },

        // Stage 8: Pagination + total count
        {
            $facet: {

                // Get videos for current page
                videos: [

                    {
                        $sort: sortStage
                    },

                    {
                        $skip:
                            (pageNumber - 1) * limitNumber
                    },

                    {
                        $limit: limitNumber
                    }

                ],

                // Get total number of videos
                totalCount: [

                    {
                        $count: "count"
                    }

                ]

            }
        }

    ]);

    // -----------------------------
    // 4. Extract results
    // -----------------------------

    const videos =
        result[0]?.videos || [];

    const totalDocs =
        result[0]?.totalCount[0]?.count || 0;

    // Calculate total pages
    const totalPages =
        Math.ceil(totalDocs / limitNumber);

    // -----------------------------
    // 5. Send response
    // -----------------------------

    return res.status(200).json(
        new ApiResponse(
            200,
            "Advanced videos fetched successfully",
            {
                docs: videos,

                totalDocs,

                limit: limitNumber,

                totalPages,

                page: pageNumber,

                hasPrevPage:
                    pageNumber > 1,

                hasNextPage:
                    pageNumber < totalPages,

                prevPage:
                    pageNumber > 1
                        ? pageNumber - 1
                        : null,

                nextPage:
                    pageNumber < totalPages
                        ? pageNumber + 1
                        : null
            }
        )
    );
});



const getChannelVideos = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const {
        page = 1,
        limit = 10
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new APIError(
            400,
            "Invalid userId"
        );
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (pageNumber < 1) {
        throw new APIError(
            400,
            "Page must be greater than 0"
        );
    }

    if (limitNumber < 1) {
        throw new APIError(
            400,
            "Limit must be greater than 0"
        );
    }

    const result = await Video.aggregate([

        // 1. Only published videos
        // belonging to this channel
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                isPublished: true
            }
        },

        // 2. Get owner information
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },

        // 3. Convert owner array to object
        {
            $unwind: "$owner"
        },

        // 4. Get likes
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },

        // 5. Get comments
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },

        // 6. Calculate counts
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

        // 7. Select fields
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                description: 1,
                views: 1,
                createdAt: 1,

                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    fullName: "$owner.fullName",
                    avatar: "$owner.avatar"
                },

                likeCount: 1,
                commentCount: 1
            }
        },

        // 8. Pagination
        {
            $facet: {

                videos: [
                    {
                        $sort: {
                            createdAt: -1
                        }
                    },

                    {
                        $skip:
                            (pageNumber - 1) * limitNumber
                    },

                    {
                        $limit: limitNumber
                    }
                ],

                totalCount: [
                    {
                        $count: "count"
                    }
                ]
            }
        }
    ]);

    const videos =
        result[0]?.videos || [];

    const totalDocs =
        result[0]?.totalCount[0]?.count || 0;

    const totalPages =
        Math.ceil(totalDocs / limitNumber);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Channel videos fetched successfully",
            {
                docs: videos,
                totalDocs,
                limit: limitNumber,
                totalPages,
                page: pageNumber,

                hasPrevPage:
                    pageNumber > 1,

                hasNextPage:
                    pageNumber < totalPages,

                prevPage:
                    pageNumber > 1
                        ? pageNumber - 1
                        : null,

                nextPage:
                    pageNumber < totalPages
                        ? pageNumber + 1
                        : null
            }
        )
    );
});


const getMyVideos = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 10
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (pageNumber < 1) {
        throw new APIError(
            400,
            "Page must be greater than 0"
        );
    }

    if (limitNumber < 1) {
        throw new APIError(
            400,
            "Limit must be greater than 0"
        );
    }

    const result = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
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
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                description: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    fullName: "$owner.fullName",
                    avatar: "$owner.avatar"
                },
                likeCount: 1,
                commentCount: 1
            }
        },
        {
            $facet: {
                videos: [
                    {
                        $sort: {
                            createdAt: -1
                        }
                    },
                    {
                        $skip:
                            (pageNumber - 1) * limitNumber
                    },
                    {
                        $limit: limitNumber
                    }
                ],
                totalCount: [
                    {
                        $count: "count"
                    }
                ]
            }
        }
    ]);

    const videos = result[0]?.videos || [];
    const totalDocs = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalDocs / limitNumber);

    return res.status(200).json(
        new ApiResponse(
            200,
            "My videos fetched successfully",
            {
                docs: videos,
                totalDocs,
                limit: limitNumber,
                totalPages,
                page: pageNumber,
                hasPrevPage: pageNumber > 1,
                hasNextPage: pageNumber < totalPages,
                prevPage: pageNumber > 1
                    ? pageNumber - 1
                    : null,
                nextPage: pageNumber < totalPages
                    ? pageNumber + 1
                    : null
            }
        )
    );
});



const getChannelStats = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new APIError(
            400,
            "Invalid userId"
        );
    }

    const stats = await Video.aggregate([

        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                isPublished: true
            }
        },

        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },

         {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },

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

    const result = stats[0] || {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
    };

    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Channel statistics fetched successfully",
            {
                ...result,
                totalSubscribers
            }
        )
    );
});


export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishVideo,
    
    watchVideo,
    getAllVideosAdvanced,
    getChannelVideos,
    getChannelStats,
    getMyVideos
}
