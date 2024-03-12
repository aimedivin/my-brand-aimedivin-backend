import express from "express";
import dashboardController from "../controllers/dashboard";

const router = express.Router();


router.get("/", dashboardController.getBlogs);

router.post("/", dashboardController.postBlog);

export default router;