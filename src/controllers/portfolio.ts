import {RequestHandler} from 'express';

import Blog from '../model/blog';
import Comment from '../model/comment';
import Message from '../model/message';

import { CustomError } from './dashboard';

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

//-------------------- Blog Comment ------------------
const postComment: RequestHandler = async (req, res) => {
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
            res.status(500).json();
        }
    }
}



// Save Message
const postMessage: RequestHandler = async (req, res) => {
    const {email, subject, description} = req.body
    try {
        const newMessage = new Message ({email, subject, description});
        await newMessage.save();
        res.status(201).json(newMessage.toObject());
    } catch(error) {
        console.log(error);
    }
}

export default {
    getBlogs,
    getBlog,
    postMessage,
    postComment
}