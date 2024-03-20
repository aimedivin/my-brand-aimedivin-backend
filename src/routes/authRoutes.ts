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