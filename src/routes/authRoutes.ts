/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * 
 */
/**
 * @swagger
 * tags:
 *   name: Authorization
 *   description: The authentication managing API
 *
 * /api/auth/login:
 *   post:
 *     summary: "Returns Authorization Token"
 *     tags: [Authorization]
 *     description: "Authorizes default users with username and password set as root to use the endpoints"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@abc.com
 *               password:
 *                 type: string
 *                 example: userpassword
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Authorization token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               token: token
 *               userId: userId
 * 
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               message: The provided credentials are invalid.
 *       500:
 *         $ref: '#/components/responses/serverError'
 * 
 * /api/auth/signup:
 *   post:
 *     summary: abc
 *     tags: [Authorization]
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: 
 *                   type: string
 *                   example: User created successfully!
 *                 user: 
 *                   type: object
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Existing User
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               message: User already exists!
 *       500:
 *         $ref: '#/components/responses/serverError'
 * 
 * /api/auth/{userId}:
 *   put:
 *     summary: abc
 *     tags: [Authorization]
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully!
 *                 Updated user:
 *                   type: object
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/fourZeroOneAuth'
 *       422:
 *         description: Data Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                  type: string
 *                  example: Validation failed, Invalid data
 *       500:
 *         $ref: '#/components/responses/serverError'
 */

import { Router } from 'express';
import { body } from "express-validator";
import User from '../model/user';

import { Auth } from '../controllers/auth';
import { isAuth } from '../middleware/isAuth';

const router = Router();

const authController = new Auth();

router.post('/signup', authController.postSignUp);

router.put('/user/:userId', isAuth,
    [
        body('name').trim()
            .not()
            .isEmpty()
    ],
    authController.updateUser
);

router.post('/login', authController.login);

export default router;