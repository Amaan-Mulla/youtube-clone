import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
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

// Prevent the same user from liking the same video more than once
likeSchema.index(
    { video: 1, owner: 1 },
    { unique: true }
);

export const Like = mongoose.model("Like", likeSchema);