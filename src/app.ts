import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import "dotenv/config"
import mongoose from 'mongoose'
import bodyParser from 'body-parser';
//import multer from 'multer'

import dashboardRoutes from './routes/dashboardRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import authRoutes from './routes/authRoutes';

import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express'
import path from 'path';



export const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

// health check for the server
app.get("/health", async (req: Request, res: Response) => {
    res.status(200).json({ message: "health OK!" });
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/auth', authRoutes);

// app.use((error: any, req: Request, res: Response, next: NextFunction) => {
//     console.log(error);
//     res.status( error.statusCode).json({message: error.message})
// })
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My Brand Aime-Divin API Doc",
            version: "0.1.0",
            description: "A simple API application made with NodeJs, ExpressJs, MongoDB, Mongoose and documented with Swagger",
            contact: {
                name: "Aime Divin",
                email: "aimedifi003@gmail.com"
            }
        },
        servers: [
            {
                url: "https://my-brand-aimedivin-backend.onrender.com/"
            },
            {
                url: "http://localhost:3000",
            }
        ]
    },
    apis: ['src/routes/*.ts']
}
const specs = swaggerJsDoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => {
        console.log("Database connected");
    })
    .catch(err => {
        console.log(err);

    })

const startServer = () => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${ port }`);
    });
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}