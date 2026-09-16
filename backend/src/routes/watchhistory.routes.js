import { Router } from "express";

import {
    addToWatchHistory,
    getWatchHistory,
    removeFromWatchHistory
} from "../controllers/watchhistory.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:videoId").post(
    verifyJWT,
    addToWatchHistory
);

router.route("/").get(
    verifyJWT,
    getWatchHistory
);

router.route("/:videoId").delete(
    verifyJWT,
    removeFromWatchHistory
);

export default router;