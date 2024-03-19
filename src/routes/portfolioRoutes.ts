import { Router } from "express";
import { Portfolio } from "../controllers/portfolio"

import { isAuth, isAuthAdmin } from '../middleware/isAuth'

const router = Router();

const portfolioController = new Portfolio();

// Getting Blog(s)
router.get("/blogs", portfolioController.getBlogs);

router.get("/blog/:blogId", portfolioController.getBlog);

// Blog comment 
router.get('/blog/:blogId/comment', portfolioController.getComments);

router.post('/blog/:blogId/comment', isAuth, portfolioController.postComment);

// Blog like 
router.post('/blog/:blogId/like', isAuth, portfolioController.postLike);

router.delete('/blog/:blogId/like', isAuth, portfolioController.deleteLike);

// Contact form message
router.post('/message', portfolioController.postMessage);



export default router;