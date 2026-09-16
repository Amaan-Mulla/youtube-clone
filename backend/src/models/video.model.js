import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'; // it is used to paginate the results of a query on a Mongoose model

const videoSchema = new Schema( 
    {
        videoFile: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        videoPublicId: {
        type: String,
        },
        thumbnailPublicId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

videoSchema.plugin(mongoosePaginate);

export const Video = mongoose.model("Video", videoSchema);