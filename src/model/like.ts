import mongoose, { Schema } from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        blogId: {
            type: Schema.Types.ObjectId,
            ref: 'Blogs',
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        }
    });

const Like = mongoose.model("Likes", likeSchema);

export default Like;