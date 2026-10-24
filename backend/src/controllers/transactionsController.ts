import { NextFunction, Request, Response } from 'express';
import * as transactionService from '../services/transactionService';

export const addTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { symbol, type, shares, price } = req.body;
        const userId = req.user!.id;
        const transaction = await transactionService.addTransaction(userId, symbol.toUpperCase(), type, shares, price);
        res.status(201).json(transaction);
    } catch (error: any) {
        next(error);
    }
}

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const transactions = await transactionService.getTransactions(userId);
        res.json(transactions);
    } catch (error: any) {
        next(error);
    }
}