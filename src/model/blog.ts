import mongoose, { Schema } from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        comments: Number,
        likes: Number
    },
    {
        timestamps: true
    });

const Blog = mongoose.model("Blogs", blogSchema);

export default Blog;