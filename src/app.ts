import express, {Request, Response} from 'express';
import cors from 'cors';
import mongoose from 'mongoose'
import "dotenv/config"

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => {
        console.log("Database connected");
        
    })

const app = express();

app.use(express.json());
app.use(cors());


app.listen(3000, () => {
    console.log('Server started on port: 3000')
})