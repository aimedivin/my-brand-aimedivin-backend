import {RequestHandler} from 'express';
import Message from '../model/message';


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
    postMessage
}