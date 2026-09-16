import mongoose from "mongoose";

import { CommentLike } from "../models/commentlike.model.js";
import { Comment } from "../models/comment.model.js";

import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const likeComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;

    // 1. Validate comment ID
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new APIError(400, "Invalid commentId");
    }

    // 2. Check whether comment exists
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new APIError(404, "Comment not found");
    }

    // 3. Check whether user already liked this comment
    const existingLike = await CommentLike.findOne({
        comment: commentId,
        owner: req.user._id
    });

    if (existingLike) {
        throw new APIError(409, "Comment already liked");
    }

    // 4. Create like
    const like = await CommentLike.create({
        comment: commentId,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "Comment liked successfully",
            like
        )
    );
});


const unlikeComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;

    // 1. Validate comment ID
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new APIError(400, "Invalid commentId");
    }

    // 2. Delete user's like
    const like = await CommentLike.findOneAndDelete({
        comment: commentId,
        owner: req.user._id
    });

    if (!like) {
        throw new APIError(404, "Comment like not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Comment unliked successfully",
            null
        )
    );
});


const getCommentLikeInfo = asyncHandler(async (req, res) => {

    const { commentId } = req.params;

    // 1. Validate comment ID
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new APIError(400, "Invalid commentId");
    }

    // 2. Check comment exists
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new APIError(404, "Comment not found");
    }

    // 3. Count all likes
    const likeCount = await CommentLike.countDocuments({
        comment: commentId
    });

    // 4. Check whether current user liked it
    const existingLike = await CommentLike.findOne({
        comment: commentId,
        owner: req.user._id
    });

    const isLiked = !!existingLike;

    return res.status(200).json(
        new ApiResponse(
            200,
            "Comment like information fetched successfully",
            {
                likeCount,
                isLiked
            }
        )
    );
});


export {
    likeComment,
    unlikeComment,
    getCommentLikeInfo
};