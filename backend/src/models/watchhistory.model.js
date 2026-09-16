import mongoose, { Schema } from "mongoose";

const watchHistorySchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },

        watchedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

         lastViewedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Same user should have only one history entry for the same video
watchHistorySchema.index(
    { video: 1, watchedBy: 1 },
    { unique: true }
);

export const WatchHistory = mongoose.model(
    "WatchHistory",
    watchHistorySchema
);