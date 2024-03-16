import mongoose, { Schema } from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        blogId: {
            type: Schema.Types.ObjectId,
            ref: 'Blogs',
            required: true
        }
    },
    {
        timestamps: true
    });

const Like = mongoose.model("Likes", likeSchema);

export default Like;