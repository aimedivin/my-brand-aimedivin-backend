import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    photo: {
        type: String,
        require: true
    }
});


const Blog = mongoose.model("Blogs", blogSchema);

export default Blog;