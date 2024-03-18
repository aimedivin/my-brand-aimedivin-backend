import { Router } from 'express';
import { body } from "express-validator";
import User from '../model/user';

import authController from '../controllers/auth';
import { isAuth } from '../middleware/isAuth';

const router = Router();

router.post('/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Enter valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(user => {
                        if (user) {
                            return Promise.reject('E-mail address already exists!');
                        }
                    });
            })
            .normalizeEmail(),
        body('password').trim()
            .isLength({ min: 5 }),
        body('name').trim()
            .not()
            .isEmpty()
    ],
    authController.postSignUp
);

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