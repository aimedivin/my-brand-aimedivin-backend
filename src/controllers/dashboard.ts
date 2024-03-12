import {RequestHandler} from 'express';
import Blog from '../model/blogs';
import { log } from 'console';

// 
const getBlogs: RequestHandler = async (req, res) => {
    try {
        const blogs = await Blog.find({},{"title":1});
        console.log(blogs);
        res.status(200).json(blogs);

    } catch(err) {
        console.log("Error");
    }
};

const postBlog: RequestHandler = async (req, res) => {
    try {
        const {title, description, photo} = req.body;

        //Check if blog exist
        const existingBlog = await Blog.findOne({
            $and: [
                {title},
                {$or: [
                    {description},
                    {photo}
                ]}
            ]
        });
        
        if(existingBlog) 
            return res.status(409).json({message: "Blog already Exist"});

        //Create new blog if doesn't exist
        const newBlog = new Blog(req.body);
        await newBlog.save(); 
        
        res.status(201).json(newBlog.toObject());
        
    } catch(err) {
        console.log(err);
        res.status(500).json({message: "Error"})
    }
};

export default {
    getBlogs,
    postBlog
}