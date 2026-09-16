import { Router } from "express";

import {
    likeComment,
    unlikeComment,
    getCommentLikeInfo
} from "../controllers/commentLike.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:commentId")
    .post(verifyJWT, likeComment)
    .delete(verifyJWT, unlikeComment)
    .get(verifyJWT, getCommentLikeInfo);

export default router;