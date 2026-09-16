import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (name === undefined) {
        throw new APIError(400, "Playlist name is required");
    }

    if (typeof name !== "string") {
        throw new APIError(400, "Playlist name must be a string");
    }

    if (!name.trim()) {
        throw new APIError(400, "Playlist name is required");
    }

    if (description !== undefined && typeof description !== "string") {
        throw new APIError(400, "Playlist description must be a string");
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description?.trim() || "",
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "Playlist created successfully",
            playlist
        )
    );
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // 1. Validate IDs
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new APIError(400, "Invalid playlistId");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid videoId");
    }

    // 2. Find playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    // 3. Check playlist ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new APIError(
            403,
            "You are not allowed to modify this playlist"
        );
    }

    // 4. Check whether video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    // 5. Only published videos can be added to playlists
    if (!video.isPublished) {
        throw new APIError(400, "Only published videos can be added to playlists");
    }

    // 6. Atomically add the video only when it is not already present
    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlist._id,
            owner: req.user._id,
            videos: { $ne: video._id }
        },
        {
            $addToSet: { videos: video._id }
        },
        {
            new: true
        }
    );

    if (!updatedPlaylist) {
        throw new APIError(
            400,
            "Video already exists in playlist"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Video added to playlist successfully",
            updatedPlaylist
        )
    );
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // 1. Validate playlist ID
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new APIError(400, "Invalid playlistId");
    }

    // 2. Find playlist and populate videos
    const playlist = await Playlist.findById(playlistId)
        .populate({
            path: "videos",
            match: { isPublished: true },
            select: "title thumbnail duration views owner",
            populate: {
                path: "owner",
                select: "username"
            }
        });

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Playlist fetched successfully",
            playlist
        )
    );
});


const getChannelPlaylists = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new APIError(400, "Invalid channelId");
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "videos",
                let: { playlistVideoIds: "$videos" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$_id", "$$playlistVideoIds"] },
                                    { $eq: ["$isPublished", true] }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1
                        }
                    }
                ],
                as: "publishedVideos"
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
                videos: "$publishedVideos._id"
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Channel playlists fetched successfully",
            playlists
        )
    );
});


const getMyPlaylists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.find({
        owner: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "My playlists fetched successfully",
            playlists
        )
    );
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new APIError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new APIError(
            403,
            "You are not allowed to modify this playlist"
        );
    }

    if (name !== undefined) {
        if (typeof name !== "string") {
            throw new APIError(400, "Playlist name must be a string");
        }

        if (!name.trim()) {
            throw new APIError(400, "Playlist name is required");
        }

        playlist.name = name.trim();
    }

    if (description !== undefined) {
        if (typeof description !== "string") {
            throw new APIError(400, "Playlist description must be a string");
        }

        playlist.description = description.trim();
    }

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Playlist updated successfully",
            playlist
        )
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // 1. Validate IDs
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new APIError(400, "Invalid playlistId");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid videoId");
    }

    // 2. Find playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    // 3. Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new APIError(
            403,
            "You are not allowed to modify this playlist"
        );
    }

    // 4. Check whether video is actually in playlist
    if (!playlist.videos.some(
        (id) => id.toString() === videoId
    )) {
        throw new APIError(
            404,
            "Video not found in playlist"
        );
    }

    // 5. Remove video
    playlist.videos = playlist.videos.filter(
        (id) => id.toString() !== videoId
    );

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Video removed from playlist successfully",
            playlist
        )
    );
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // 1. Validate playlist ID
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new APIError(400, "Invalid playlistId");
    }

    // 2. Find playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    // 3. Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new APIError(
            403,
            "You are not allowed to delete this playlist"
        );
    }

    // 4. Delete playlist
    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Playlist deleted successfully",
            null
        )
    );
});

export {
    createPlaylist,
    addVideoToPlaylist,
    getPlaylistById,
    getChannelPlaylists,
    getMyPlaylists,
    updatePlaylist,
    removeVideoFromPlaylist,
    deletePlaylist
};
