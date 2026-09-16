import mongoose, { Schema } from "mongoose";

const commentLikeSchema = new Schema(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            required: true
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

commentLikeSchema.index(
    { comment: 1, owner: 1 },
    { unique: true }
);

export const CommentLike = mongoose.model(
    "CommentLike",
    commentLikeSchema
);