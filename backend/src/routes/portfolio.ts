import { Router } from 'express';
import { getPortfolio } from '../controllers/portfolioController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

//GET portfolio by userId
router.get('/', authenticate, getPortfolio);

export default router;