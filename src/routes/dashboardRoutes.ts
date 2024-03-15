import { Router } from "express";
import { body } from "express-validator";
import dashboardController from "../controllers/dashboard";

const router = Router();

router.get("/blogs", dashboardController.getBlogs);

router.get("/blog/:blogId", dashboardController.getBlog);

router.put(
    "/blog/:blogId",
    [
        body("title").trim().isLength({ min: 5 }),
        body("description").trim().isLength({ min: 5 }),
    ],
    dashboardController.updateBlog
);

router.post(
    "/blog",
    [
        body("title").trim().isLength({ min: 5 }),
        body("description").trim().isLength({ min: 5 }),
    ],
    dashboardController.postBlog
);

router.delete("/blog/:blogId", dashboardController.deleteBlog);

export default router;
