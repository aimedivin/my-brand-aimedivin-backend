import { RequestHandler } from "express"
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

import bcrypt from 'bcryptjs'
import User from "../model/user";


// Custom Error Class
class CustomError {
    message: string;
    statusCode: number;
    constructor(message: string, statusCode: number) {
        this.message = message
        this.statusCode = statusCode
    }
}

const postSignUp: RequestHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new CustomError('Validation failed, Enter valid inputs', 422);
            throw error;
        }
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const hashedPassword = await bcrypt.hash(password, 12);

        if (hashedPassword) {
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword
            });
            user.save()
            if (user) {
                res.status(201)
                    .json({
                        message: 'User created successfully!',
                        user: user
                    })
            }
        }
    }
    catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            res.status(500).json();
        }
    }
};

const login: RequestHandler = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password;
        const user = await User.findOne({ email: email });

        if (!user) {
            const error = new CustomError('User with this email not found', 401);
            throw error;
        }
        const userPasswordCheck = await bcrypt.compare(password, user.password);

        if (!userPasswordCheck) {
            const error = new CustomError('Invalid password', 401);
            throw error;
        }
        const token = jwt.sign({
            email: user.email,
            userId: user._id.toString()
        },
            `${process.env.JWT_SECRET}`,
            { expiresIn: '1h' }
        );


        res.status(200)
            .json({
                token: token,
                userId: user._id.toString()
            })
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            res.status(500).json();
        }
    }
}
export default {
    postSignUp,
    login
}