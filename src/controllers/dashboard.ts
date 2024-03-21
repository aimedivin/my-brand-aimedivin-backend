import { RequestHandler } from 'express';
import { validationResult } from 'express-validator'
import Blog from '../model/blog';
import { Types, isValidObjectId } from 'mongoose';
import User from '../model/user';
import Comment from '../model/comment';
import Message from '../model/message';

// Custom Error Class
export class CustomError {
    message: string;
    statusCode: number;
    constructor(message: string, statusCode: number) {
        this.message = message
        this.statusCode = statusCode
    }
}

export class Dashboard {
    // Fetching All blogs
    getBlogs: RequestHandler = async (req, res) => {
        try {
            const blogs = await Blog.find();

            res.status(200)
                .json({
                    message: 'Blogs fetched successfully!',
                    blogs: blogs
                });
        } catch (err) {
            res.status(500)
                .json({
                    "message": "Internal server error"
                })
        }
    };


    // Fetching Single blog
    getBlog: RequestHandler = async (req, res) => {
        try {
            const blogId = req.params.blogId;
            if (!isValidObjectId(blogId)) {
                return res.status(400).json({ message: "Invalid blog id" });
            }
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
    updateBlog: RequestHandler = async (req, res) => {
        try {
            const blogId: string = req.params.blogId;

            if (!isValidObjectId(blogId)) {
                return res.status(400).json({ message: "Invalid blog id" });
            }

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
                        message: "Blog updated successfully",
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
                res.status(500).json({ message: "Server error" });
            }
        }
    }


    // Creating new blog
    postBlog: RequestHandler = async (req, res) => {
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
                    "message": "The details provided belong to another blog in the database"
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
    deleteBlog: RequestHandler = async (req, res) => {
        const blogId = req.params.blogId;
        const userId = req.userId;

        if (!isValidObjectId(blogId)) {
            return res.status(400).json({ message: "Invalid blog id" });
        }

        try {
            const result = await Blog.findByIdAndDelete(blogId);
            if (result) {
                const blogComments = await Comment.deleteMany({ blogId: blogId });

                return res.status(200)
                    .json({
                        message: `Blog and it's ${blogComments.deletedCount} comment(s) was deleted successfully `
                    });
            }
            return res.status(404)
                .json({
                    message: "Blog not found"
                });
        } catch (error) {
            res.status(500)
                .json({ message: "Server rror" });

        }
    }

    // -------------- USERS ------------------

    getUsers: RequestHandler = async (req, res) => {
        try {
            const users = await User.find();
            if (users) {
                res.status(200)
                    .json({
                        message: "Users were retrieved successfully!",
                        users: users
                    })
            }
        } catch (err) {
            res.status(500)
                .json({
                    message: "Server Error"
                })
        }
    }

    // -------------- MESSAGES -----------------
    getMessages: RequestHandler = async (req, res) => {
        try {
            const messages = await Message.find();

            res.status(200)
                .json({
                    message: 'Message fetched successfully!',
                    msg: messages
                });
        } catch (err) {
            res.status(500)
                .json({
                    "message": "Internal server error"
                })
        }
    }

    // Fetching single message
    getMessage: RequestHandler = async (req, res) => {
        try {
            const msgId = req.params.msgId;
            if (!isValidObjectId(msgId)) {
                return res.status(400).json({ message: "Invalid message id" });
            }
            const message = await Message.findById(msgId);
            if (message)
                return res.status(200)
                    .json({
                        message: 'Message fetched successfully',
                        msg: message
                    });
            res.status(404)
                .json({
                    message: "Message not found"
                });
        } catch (err) {
            res.status(500).json({ message: "Server error" })
            console.log(err);
        }
    }
}

