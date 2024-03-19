import { RequestHandler } from "express"
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import Joi, { ValidationError } from "joi"

import bcrypt from 'bcryptjs'
import User from "../model/user";
import validationSchema from "../helpers/validation_schema"
import { CustomError } from './dashboard'


export class Auth {
    postSignUp: RequestHandler = async (req, res) => {
        try {
            const validateResult = await validationSchema.validateSchema.validateAsync(req.body);

            const name = req.body.name;
            const email = req.body.email;
            const password = req.body.password;
            const userDb = await User.findOne({ email });
            if (userDb) {
                res.status(400).json({ Message: 'User already exists!' });
            }
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
            }
            else if ((err as Error).name == 'ValidationError') {
                res.status(422).json({
                    Message: (err as ValidationError).details[0].message
                })
            }
            else {
                res.status(500).json();
            }
        }
    };

    login: RequestHandler = async (req, res) => {
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
            res.status(500).json({ Message: "Login Error" });
        }
    }
}

const updateUser: RequestHandler = async (req, res) => {
    try {
        const name = req.body.name;
        const userIdParam = req.params.userId;
        const userId = req.userId;
        const validateResult = validationResult(req);

        if (userIdParam != userId) {
            const error = new CustomError('Not authorized', 401);
            throw error;
        }

        if (!validateResult.isEmpty()) {
            const error = new CustomError('Validation failed, Enter valid inputs', 422);
            throw error;
        }

        const updatedDocument = await User.findByIdAndUpdate(userId, { $set: { name: name } }, { new: true })
        res.status(200)
            .json({
                "Message": "User updated Successfully!",
                "Updated User": updatedDocument
            })

    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            res.status(500).json({ Message: "User Update Error", Error: err });
        }
    }
}

export default {
    postSignUp,
    login,
    updateUser
}