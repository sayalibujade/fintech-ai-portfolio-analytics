import { Router } from 'express';
import { addTransaction, getTransactions } from '../controllers/transactionsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

//GET all transactions for a user
router.get('/', authenticate, getTransactions);

//POST -> add a new transaction
router.post('/', authenticate, addTransaction);

export default router;