import { RequestHandler, Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import 'dotenv/config'

import { CustomError } from '../controllers/dashboard'
import { Error } from "mongoose";
import User from "../model/user";

// Extend Request interface to include the userId property
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
function authorizationCheck(req: Request) {
    const header = req.get('Authorization');

    if (!header) {
        const error = new CustomError('You\'re not authorized', 401);
        throw error;
    }

    const token = header.split(' ')[1];
    let decodedToken;

    decodedToken = jwt.verify(token, `${process.env.JWT_SECRET}`) as JwtPayload;

    if (!decodedToken) {
        const error = new CustomError('You\'re not authorized', 401);
        throw error;
    }
    return decodedToken;
}

export const isAuth: RequestHandler = async (req, res, next) => {
    try {
        const decodedToken = authorizationCheck(req)
        req.userId = decodedToken.userId;

        let user = await User.findById(decodedToken.userId);

        if (!user!.isAdmin) {
            next()
        } else {
            const error = new CustomError('You\'re not authorized g', 401);
            throw error;
        }
    }
    catch (err) {

        if ((err as Error).name === 'JsonWebTokenError' || (err as Error).name === 'TokenExpiredError') {
            res.status(401).json({ message: 'You\'re not authorized' });
        }
        else if (err instanceof CustomError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            res.status(500).json({ message: "Server error" });
        }
    }
}

export const isAuthAdmin: RequestHandler = async (req, res, next) => {

    try {
        const decodedToken = authorizationCheck(req)
        let user = await User.findById(decodedToken.userId);

        if (!user!.isAdmin) {
            const error = new CustomError('You\'re not authorized', 401);
            throw error;
        }
        next()
    }
    catch (err) {

        if ((err as Error).name === 'JsonWebTokenError' || (err as Error).name === 'TokenExpiredError') {
            res.status(401).json({ message: 'You\'re not authorized' });
        }
        else if (err instanceof CustomError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            res.status(500).json({ message: "Server error" });
        }
    }
}
