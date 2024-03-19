import { RequestHandler } from 'express';

import Blog from '../model/blog';
import Comment from '../model/comment';
import Message from '../model/message';

import { CustomError } from './dashboard';
import Like from '../model/like';
import mongoose, {isValidObjectId} from 'mongoose';
export class Portfolio {
    // Fetching All blogs
    getBlogs: RequestHandler = async (req, res) => {
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
    getBlog: RequestHandler = async (req, res) => {
        try {
            const blogId = req.params.blogId;
            
            if (!isValidObjectId(blogId)) {
                return res.status(404).json({ message: "Blog not found" });
            }
            
            const blog = await Blog.findById(blogId)
            
            if (blog) {
                return res.status(200)
                    .json({
                        message: 'Blog fetched successfully',
                        blog: blog
                    });
            }
            res.status(404)
                .json({
                    message: "Blog not found"
                });
        } catch (err) {
            console.log(err);
            
            res.status(500).json({ message: "Server error" })
        }
    }

    //-------------------- Blog Comment ------------------
    getComments: RequestHandler = async (req, res) => {
        try {
            const blogId = req.params.blogId
            const blogComments = await Comment.find({ blogId });

            if (!blogComments) {
                const error = new CustomError("The blog does not exist", 404);
                throw error;
            }
            res.status(200)
                .json({
                    message: "Blog comments",
                    comments: blogComments
                })
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            } else {
                res.status(500).json({ Error: "Retrieving comments error!" });
            }
        }
    }

    postComment: RequestHandler = async (req, res) => {
        try {

            const { description } = req.body;
            const blogId = req.params.blogId
            const userId = req.userId;

            //Check if blog exist
            const blog = await Blog.findById(blogId);
            if (!blog) {
                const error = new CustomError("This blog does not exist", 404);
                throw error;
            }

            blog.comments = (blog.comments ? blog.comments : 0) + 1;
            await blog.save();

            const newComment = new Comment(
                {
                    creatorId: userId,
                    blogId: blogId,
                    description: description
                }
            );
            await newComment.save();

            res.status(201)
                .json({
                    message: 'Comment posted!',
                    comment: newComment.toObject()
                });
        }
        catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            } else {
                res.status(500).json({ Error: "Adding comment failed" });
            }
        }
    }


    //-------------------- Blog Like ------------------
    postLike: RequestHandler = async (req, res) => {
        try {
            const { description } = req.body;
            const blogId = req.params.blogId
            const userId = req.userId;

            //Check if blog exist
            const blog = await Blog.findById(blogId);
            if (!blog) {
                const error = new CustomError("This blog does not exist", 404);
                throw error;
            }

            const blogLike = await Like.findOne({ blogId, userId });
            if (!blogLike) {
                const newBlogLike = new Like({ blogId, userId })
                newBlogLike.save();

                blog.likes = (blog.likes ? blog.likes : 0) + 1;
                blog.save();

                return res.status(201)
                    .json({ message: "Like was added successfully" })
            }
            res.status(409)
                .json({ message: "Like you're trying to add on this blog already exist, you can't add another" })
        }
        catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            } else {
                res.status(500).json({ message: "Server error: Adding like failed" });
            }
        }
    }

    deleteLike: RequestHandler = async (req, res) => {
        try {
            const { description } = req.body;
            const blogId = req.params.blogId
            const userId = req.userId;

            //Check if blog exist
            const blog = await Blog.findById(blogId);
            if (!blog) {
                const error = new CustomError("This blog does not exist", 404);
                throw error;
            }

            const blogLike = await Like.findOneAndDelete({ blogId, userId });
            if (!blogLike) {
                const error = new CustomError("Can't Remove Like which doesn't exist on this blog", 404);
                throw error;
            }

            blog.likes = blog.likes! - 1;
            blog.save();

            res.status(201)
                .json({ message: "Like was Removed successfully" })
        }
        catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            } else {
                res.status(500).json({ message: "Server error: Adding like failed" });
            }
        }
    }



    // Save Message
    postMessage: RequestHandler = async (req, res) => {
        const { email, subject, description } = req.body
        try {
            const newMessage = new Message({ email, subject, description });
            await newMessage.save();
            res.status(201).json(newMessage.toObject());
        } catch (error) {
            console.log(error);
        }
    }
}