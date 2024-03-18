import { Router, RequestHandler } from "express";
import { body } from "express-validator";

import dashboardController from "../controllers/dashboard";
import {isAuth, isAuthAdmin} from '../middleware/isAuth'

const router = Router();

router.get("/blogs", isAuthAdmin, dashboardController.getBlogs);

router.get("/blog/:blogId", isAuthAdmin,dashboardController.getBlog);

router.put(
    "/blog/:blogId",
    isAuthAdmin,
    [
        body("title").trim().isLength({ min: 5 }),
        body("description").trim().isLength({ min: 5 }),
    ],
    dashboardController.updateBlog
);

router.post(
    "/blog",
    isAuthAdmin,
    [
        body("title").trim().isLength({ min: 5 }),
        body("description").trim().isLength({ min: 5 }),
    ],
    dashboardController.postBlog
);

router.delete("/blog/:blogId", isAuthAdmin, dashboardController.deleteBlog);

// Users
router.get("/users", isAuthAdmin, dashboardController.getUsers);

//router.get("/user", isAuthAdmin, dashboardController.deleteBlog);

export default router;
