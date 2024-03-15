import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import "dotenv/config"
import mongoose from 'mongoose'
import bodyParser from 'body-parser';
//import multer from 'multer'

import dashboardRoutes from './routes/dashboardRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import authRoutes from './routes/authRoutes';


const app = express();

app.use(bodyParser.json())
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/auth', authRoutes);

// app.use((error: any, req: Request, res: Response, next: NextFunction) => {
//     console.log(error);
//     res.status( error.statusCode).json({message: error.message})
// })

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => {
        console.log("Database connected");
        app.listen(3000, () => {
            console.log('Server started on port: 3000');
        })
    })
    .catch(err => {
        console.log(err);

    })
