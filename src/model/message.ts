import { timeStamp } from "console";
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });


const Message = mongoose.model("Messages", messageSchema);

export default Message;