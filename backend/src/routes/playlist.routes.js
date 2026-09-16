import { Router } from "express";

import {
    createPlaylist,
    addVideoToPlaylist,
    getPlaylistById,
    getChannelPlaylists,
    getMyPlaylists,
    updatePlaylist,
    removeVideoFromPlaylist,
    deletePlaylist
} from "../controllers/playlist.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Create playlist
router.route("/").post(
    verifyJWT,
    createPlaylist
);

router.route("/").get(
    verifyJWT,
    getMyPlaylists
);

router.route("/channel/:channelId").get(
    getChannelPlaylists
);

// Add video to playlist
router.route("/:playlistId/videos/:videoId").post(
    verifyJWT,
    addVideoToPlaylist
);

// Get playlist by ID
router.route("/:playlistId").get(
    getPlaylistById
);

router.route("/:playlistId").patch(
    verifyJWT,
    updatePlaylist
);

// Remove video from playlist
router.route("/:playlistId/videos/:videoId").delete(
    verifyJWT,
    removeVideoFromPlaylist
);

// Delete playlist
router.route("/:playlistId").delete(
    verifyJWT,
    deletePlaylist
);


export default router;
