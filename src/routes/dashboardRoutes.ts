import {Router} from "express";
import dashboardController from "../controllers/dashboard";

const router = Router();

router.get("/blogs", dashboardController.getBlogs);

router.get("/blogs/:blogId", dashboardController.getBlog);

router.post("/blogs/edit-blog", dashboardController.postEditBlog);

router.post("/blogs", dashboardController.postBlog);

router.post("/blogs/delete-blog", dashboardController.postDeleteBlog);

export default router;