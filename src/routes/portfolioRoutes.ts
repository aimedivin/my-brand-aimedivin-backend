import { Router } from "express";
import portfolioControllers from "../controllers/portfolio"

const router = Router();

router.post('/message', portfolioControllers.postMessage);

export default router;