import { GoogleGenAI } from '@google/genai';
import { Router } from 'express';
import { analyzePortfolio } from '../controllers/aiController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

const ai = new GoogleGenAI();

router.post('/analyze', authenticate, analyzePortfolio);
export default router;