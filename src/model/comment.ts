import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        creatorName: {
            type: Schema.Types.String,
            ref: 'Users',
            required: true
        },
        blogId:{
            type: Schema.Types.ObjectId,
            ref: 'Blogs',
            required: true
        },
        description: {
            type: String,
            required: true
        },

    },
    {
        timestamps: true
    });

const Comment = mongoose.model("Comments", commentSchema);

export default Comment;