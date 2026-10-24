import Transaction from '../models/Transaction';
import * as portfolioService from './portfolioService';

export const addTransaction = async (
    userId: string,
    symbol: string,
    type: 'BUY' | 'SELL',
    shares: number,
    price: number
) => {
    const transaction = await Transaction.create({
        userId,
        symbol: symbol.toUpperCase(),
        type,
        shares,
        price
    });

    if ('BUY' === type) {
        await portfolioService.processBuy(
            userId,
            symbol,
            shares,
            price
        );
    }
    if ('SELL' === type) {
        await portfolioService.processSell(
            userId,
            symbol,
            shares
        );
    }
    return transaction;
};

export const getTransactions = (userId: string) => {
    return Transaction.find({ userId }).sort({ date: -1 });
};