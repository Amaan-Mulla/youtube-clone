import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'; // it is used to paginate the results of a query on a Mongoose model

const commentSchema = new Schema(
    {
       content: {
            type: String,
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    },
    {
        timestamps: true,
    }
)

commentSchema.plugin(mongoosePaginate);

export const Comment = mongoose.model("Comment", commentSchema);