import { Router } from "express";
import portfolioController from "../controllers/portfolio"

import { isAuth, isAuthAdmin } from '../middleware/isAuth'

const router = Router();

// Getting Blogs
router.get("/blogs", portfolioController.getBlogs);

router.get("/blog/:blogId", portfolioController.getBlog);

// Blog comment 
router.post('/blog/:blogId/comment', isAuth, portfolioController.postComment);

// Contact form message
router.post('/message', portfolioController.postMessage);



export default router;