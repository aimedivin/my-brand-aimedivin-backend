import { RequestHandler } from "express"
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import Joi, { ValidationError } from "joi"

import bcrypt from 'bcryptjs'
import User from "../model/user";
import validationSchema from "../helpers/validation_schema"
import { CustomError } from './dashboard'
import { devNull } from "os"

export class Auth {
    postSignUp: RequestHandler = async (req, res) => {
        try {
            const validateResult = await validationSchema.validateSchema.validateAsync(req.body);

            const name = req.body.name;
            const photo = req.body.photo;
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

            res.status(200)
                .json({
                    token: token,
                    userId: user._id.toString()
                })
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
            const name = req.body.name;
            const photo = req.body.photo;
            const dob = req.body.dob;
            const userIdParam = req.params.userId;
            const userId = req.userId;
            const validateResult = validationResult(req);

            if (userIdParam != userId) {
                const error = new CustomError('Not authorized', 401);
                throw error;
            }

            if (!validateResult.isEmpty()) {
                const error = new CustomError('Validation failed, Invalid data', 422);
                throw error;
            }

            const updatedDocument = await User.findByIdAndUpdate(userId, { $set: { name: name, photo: photo, dob: dob } }, { new: true });

            const sanitizedUpdatedUser = { ...updatedDocument };

            console.log(sanitizedUpdatedUser)

            return res.status(200)
                .json({
                    "Message": "User updated successfully!",
                    "Updated User": updatedDocument
                })

        } catch (err) {
            console.log(err);

            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            } else {
                res.status(500).json({ message: "Server error" });
            }
        }
    }
}
