import {RequestHandler} from 'express';
import Blog from '../model/blogs';
import {Types } from 'mongoose';


// Interface for the blog
// interface myBlog {
//     _id: Types.ObjectId;
//     title: string;
//     description: string;
//     imageUrl: string;
// }

// Fetching All blogs
const getBlogs: RequestHandler = async (req, res) => {
    try {
        const blogs = await Blog.find({},{"title":1, "description": 1, "imageUrl":1});
        
        res.status(200).json(blogs);
    } catch(err) {
        console.log("Error");
    }
};


// Fetching Single blog
const getBlog: RequestHandler = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await Blog.findById(blogId);
        if (blog)
            return res.status(200).json(blog);
        res.status(400).json({message: "blog not found"})
    } catch (err) {
        res.status(400).json({message: "blog not found"})
        console.log(err);
    }
}

// Updating existing Blog
const postEditBlog: RequestHandler = async (req, res) => {
    const blogId: string = req.body.blogId;
    const newTitle: string = req.body.title;
    const newDescription: string = req.body.description;
    const newImageUrl: string = req.body.imageUrl;

    try {
        // Check if provided details belong to another blog 
        const existingBlog = await Blog.findOne({
            $and: [
                {_id: { $ne: blogId}},
                {$or: [
                    {title: { $eq: newTitle}},
                    {description: {$eq: newDescription}},
                    {imageUrl: {$eq: newImageUrl}}
                ]}
            ]
        });
        console.log(existingBlog);
        
        if (existingBlog) return res.status(409).json({message: "The details provided belong to another blog in the database"});

        const blog = await Blog.findById(blogId);
        
        if(blog) {
            blog.title = newTitle;
            blog.description = newDescription;
            blog.imageUrl = newImageUrl;

            blog.save()
            return res.status(200).json(blog);
        } 
        return res.status(409).json({message: "blog to update is not found"})
    } catch (err) {
        res.json({message: "Blog updating Error"})
    }
}


// Creating new blog
const postBlog: RequestHandler = async (req, res) => {
    try {
        const {title, description, imageUrl} = req.body;

        //Check if blog exist
        const existingBlog = await Blog.findOne({
        $and: [
            {title},
            {$or: [
                {description},
                {imageUrl}
            ]}
        ]
        })
        
        if (existingBlog) return res.status(409).json({"message": "Blog currently exist in database"});
        //Create new blog if doesn't exist

        const newBlog = new Blog(req.body);
        await newBlog.save(); 
        
        res.status(201).json(newBlog.toObject());
        
    } catch(err) {
        console.log(err);
        res.status(500).json({message: "Error"})
    }
};

// Deleting blog
const postDeleteBlog: RequestHandler = async (req, res) => {
    const {blogId} = req.body
    try {
        let result = await Blog.findByIdAndDelete(blogId);
        console.log(result);
        if (result)
            return res.status(200).json({message: "Blog deleted successfully"});
        return res.status(404).json({message: "Blog not found"});
    } catch (error) {
        console.log(error);
        res.status(400).json({message: "Blog deleting Error"});
        
    }
} 

export default {
    getBlogs,
    getBlog,
    postEditBlog,
    postBlog,
    postDeleteBlog
}

