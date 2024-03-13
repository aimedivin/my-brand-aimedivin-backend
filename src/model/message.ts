import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    subject: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    }
});


const Message = mongoose.model("Messages", messageSchema);

export default Message;