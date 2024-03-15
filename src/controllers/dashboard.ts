import { RequestHandler } from 'express';
import { validationResult } from 'express-validator'
import Blog from '../model/blog';
import { Types } from 'mongoose';

// Custom Error Class
class CustomError {
    message: string;
    statusCode: number;
    constructor(message: string, statusCode: number) {
        this.message = message
        this.statusCode = statusCode
    }
}

// Fetching All blogs
const getBlogs: RequestHandler = async (req, res) => {
    try {
        const blogs = await Blog.find();

        res.status(200)
            .json({
                message: 'Blogs fetched successfully',
                blogs: blogs
            });
    } catch (err) {
        console.log("Error");
    }
};


// Fetching Single blog
const getBlog: RequestHandler = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await Blog.findById(blogId);
        if (blog)
            return res.status(200)
                .json({
                    message: 'Blog fetched successfully',
                    blog: blog
                });
        res.status(404)
            .json({
                message: "Blog not found"
            });
    } catch (err) {
        res.status(500).json({ message: "Server error" })
        console.log(err);
    }
}

// Updating existing Blog
const updateBlog: RequestHandler = async (req, res) => {
    try {
        const blogId: string = req.params.blogId;

        const validationError = validationResult(req);

        if (!validationError.isEmpty()) {
            const error = new CustomError('Validation failed, Invalid data', 422);
            throw error;
        }

        const newTitle: string = req.body.title;
        const newDescription: string = req.body.description;
        const newImageUrl: string = req.body.imageUrl;

        // Check if provided details belong to another blog 
        const existingBlog = await Blog.findOne({
            $and: [
                { _id: { $ne: blogId } },
                {
                    $or: [
                        { title: { $eq: newTitle } },
                        { description: { $eq: newDescription } },
                        { imageUrl: { $eq: newImageUrl } }
                    ]
                }
            ]
        });
        console.log(existingBlog);

        if (existingBlog)
            return res.status(409)
                .json({
                    message: "The details provided belong to another blog in the database"
                });

        const blog = await Blog.findById(blogId);

        if (blog) {
            blog.title = newTitle;
            blog.description = newDescription;
            blog.imageUrl = newImageUrl;

            blog.save()
            return res.status(200)
                .json({
                    message: "Post updated",
                    blog: blog
                });
        }
        return res.status(404)
            .json({
                message: "blog to update is not found"
            })
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            res.status(500).json();
        }
    }
}


// Creating new blog
const postBlog: RequestHandler = async (req, res, next) => {
    try {
        const validationError = validationResult(req);

        if (!validationError.isEmpty()) {
            const error = new CustomError('Validation failed, Invalid data', 422);

            throw error;
        }
        const { title, description, imageUrl } = req.body;

        //Check if blog exist
        const existingBlog = await Blog.findOne({
            $and: [
                { title },
                {
                    $or: [
                        { description },
                        { imageUrl }
                    ]
                }
            ]
        })

        if (existingBlog) return res
            .status(409)
            .json({
                "message": "Blog currently exist in database"
            });
        //Create new blog if doesn't exist
        const newBlog = new Blog(
            {
                title: title,
                description: description,
                imageUrl: imageUrl
            }
        );
        await newBlog.save();

        res.status(201)
            .json({
                message: 'Blog created successfully!',
                blog: newBlog.toObject()
            });
    }
    catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            res.status(500).json();
        }
    }
};

// Deleting blog
const deleteBlog: RequestHandler = async (req, res) => {
    const blogId= req.params.blogId;
    
    try {
        let result = await Blog.findByIdAndDelete(blogId);
        if (result)
            return res.status(200)
                .json({
                    message: "Blog deleted successfully"
                });

        return res.status(404)
            .json({
                message: "Blog not found"
            });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Blog deleting Error" });

    }
}

export default {
    getBlogs,
    getBlog,
    updateBlog,
    postBlog,
    deleteBlog
}

