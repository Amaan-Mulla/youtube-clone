import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleVideoLike, getVideoLikeInfo } from "../controllers/like.controller.js";

const router = Router();

router.route("/toggle/:videoId").post(
    verifyJWT,
    toggleVideoLike
);

router.route("/video/:videoId").get(
    verifyJWT,
    getVideoLikeInfo
);
export default router;