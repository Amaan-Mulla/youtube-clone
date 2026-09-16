import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { CommentLike } from "../models/commentlike.model.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

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

    const comments = await Comment.paginate(
        { video: videoId }, // filter comments by videoId
        {
            page,
            limit,
            sort: { createdAt: -1 }, // sort comments by creation date in descending order
            populate: {
                path: "owner",
                select: "username fullName avatar"
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(200, "Comments fetched successfully", comments)
    );
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid videoId");
    }

    if (!content?.trim()) {
        throw new APIError(400, "Comment content is required");
    }

    const video = await Video.findOne({
        _id: videoId,
        isPublished: true
    });

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });

const createdComment = await Comment.findById(comment._id).populate({
    path: "owner",
    select: "username fullName avatar"
});


    return res.status(201).json(
        new ApiResponse(201, "Comment added successfully", createdComment)
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new APIError(400, "Invalid commentId");
    }

    if (!content?.trim()) {
        throw new APIError(400, "Comment content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new APIError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new APIError(
            403,
            "You are not authorized to update this comment"
        );
    }

   comment.content = content;

await comment.save();

// Fetch the updated comment with populated owner details
const updatedComment = await Comment.findById(comment._id).populate({
    path: "owner",
    select: "username fullName avatar"
});

return res.status(200).json(
    new ApiResponse(
        200,
        "Comment updated successfully",
        updatedComment
    )
);

});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new APIError(400, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new APIError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new APIError(
            403,
            "You are not authorized to delete this comment"
        );
    }

    await CommentLike.deleteMany({ comment: commentId });
    await comment.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, "Comment deleted successfully", {})
    );
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
