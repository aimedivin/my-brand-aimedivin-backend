import { RequestHandler } from "express"
import { validationResult } from 'express-validator'
import jwt, { JwtPayload } from 'jsonwebtoken'
import 'dotenv/config'
import Joi, { ValidationError } from "joi"

import bcrypt from 'bcryptjs'
import User from "../model/user";
import validationSchema from "../helpers/validation_schema"
import { CustomError } from './dashboard'
import { devNull } from "os"
import { isValidObjectId } from "mongoose"

export class Auth {
    postSignUp: RequestHandler = async (req, res) => {
        try {

            const validateResult = await validationSchema.validateSchema.validateAsync(req.body);

            if (!req.file) {
                const error = new CustomError('No image provided.', 415);
                throw error;
            }

            const name = req.body.name;
            const photo = req.file.path;
            const dob = req.body.dob;
            const email = req.body.email;
            const password = req.body.password;

            const userDb = await User.findOne({ email });
            if (userDb) {
                return res.status(400).json({ Message: 'User already exists!' });
            }
            const hashedPassword = await bcrypt.hash(password, 12);

            if (hashedPassword) {
                const user = await User.create({
                    name: name,
                    photo: photo,
                    dob: dob,
                    email: email,
                    password: hashedPassword
                });

                if (user) {
                    const sanitizedUser = await User.findOne({ email }, { password: 0 })
                    return res.status(201)
                        .json({
                            message: 'User created successfully!',
                            user: sanitizedUser
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
                res.status(500).json({ message: "Server error" });
            }
        }
    };

    login: RequestHandler = async (req, res) => {
        try {
            const email = req.body.email
            const password = req.body.password;
            const user = await User.findOne({ email: email });

            if (!user) {
                const error = new CustomError('The provided credentials are invalid.', 401);
                throw error;
            }
            const userPasswordCheck = await bcrypt.compare(password, user.password);

            if (!userPasswordCheck) {
                const error = new CustomError('The provided credentials are invalid.', 401);
                throw error;
            }
            const token = jwt.sign({
                email: user.email,
                userId: user._id.toString()
            },
                `${process.env.JWT_SECRET}`,
                { expiresIn: '1h' }
            );

            const refreshToken = jwt.sign({
                email: user!.email,
                userId: user!._id.toString()
            },
                `${process.env.JWT_REFRESH_SECRET}`
            );

            res.status(200)
                .json({
                    token: token,
                    refreshToken: refreshToken,
                    userId: user._id.toString()
                });

        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            } else {
                res.status(500).json({ message: "Server error" });
            }
        }
    }

    updateUser: RequestHandler = async (req, res) => {
        try {
            let photo;
            if (req.file && req.file.path) {
                photo = req.file.path;
            }
            else {
                if (!req.body.photoUrl) {
                    const error = new CustomError('Unsupported Media Type.', 415);
                    throw error;
                }
                photo = req.body.photoUrl;
            } 

            const name = req.body.name;
            const dob = req.body.dob;
            const userIdParam = req.params.userId;
            const userId = req.userId;
            const validateResult = validationResult(req);

            if (!isValidObjectId(userIdParam)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            if (userIdParam != userId) {
                const error = new CustomError('Not authorized', 401);
                throw error;
            }

            if (!validateResult.isEmpty()) {
                const error = new CustomError('Validation failed, Invalid data', 422);
                throw error;
            }

            const updatedDocument = await User.findByIdAndUpdate(userId, { $set: { name: name, photo: photo, dob: dob } }, { new: true });

            // const sanitizedUpdatedUser = { ...updatedDocument };

            // console.log(sanitizedUpdatedUser)

            return res.status(200)
                .json({
                    "Message": "User updated successfully!",
                    "UpdatedUser": updatedDocument
                })

        } catch (err) {

            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            } else {
                res.status(500).json({ message: "Server error" });
            }
        }
    }

    // Fetching single user information

    getUser: RequestHandler = async (req, res) => {
        try {
            const userIdParam = req.params.userId;
            const userId = req.userId;

            if (!isValidObjectId(userIdParam) || !isValidObjectId(userId)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            const user = await User.findById(userIdParam, { password: 0 });
            const userAdmin = await User.findById(userId, { password: 0 });

            if (user && userAdmin) {
                if (userIdParam != userId && !userAdmin.isAdmin) {
                    const error = new CustomError('You\'re not authorized', 401);
                    throw error;
                }

                return res.status(200)
                    .json({
                        "Message": "User information successfully retrieved!",
                        "user": user
                    });
            }
            return res.status(404)
                .json(
                    { massage: 'User not found.' }
                )
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(500).json({ Error: "Server Error" });
            }
        }
    }

    accessTokenRefresh: RequestHandler = async (req, res) => {
        try {
            const userId = req.params.userId;
            const refreshToken = req.body.token;
            
            const user = await User.findById(userId);

            const decodedToken = jwt.verify(refreshToken, `${process.env.JWT_REFRESH_SECRET}`) as JwtPayload;
            
            if (!user || !(userId == decodedToken.userId)) {
                const error = new CustomError('You\'re not authorized.', 401);
                throw error;
            }

            const token = jwt.sign({
                email: user!.email,
                userId: user!._id.toString()
            },
                `${process.env.JWT_SECRET}`,
                { expiresIn: '1h' }
            );

            res.status(200)
                .json({
                    token: token,
                    userId: user!._id.toString()
                })
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(500).json({ message: "Server error" });
            }
        }
    }
}
