import mongoose from 'mongoose';
import Portfolio from '../models/Portfolio';
import { AppError } from '../utils/AppError';

export const getPortfolio = (userId: string) => {
    return Portfolio.findOne({ userId });
};

export const processBuy = async (
    userId: string,
    symbol: string,
    shares: number,
    price: number
) => {
    const p = await Portfolio.find();
    const portfolio = await Portfolio.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!portfolio) throw new AppError(404, 'PORTFOLIO_NOT_FOUND', 'Portfolio not found.');

    const holding = portfolio.holdings.find(holding => holding.symbol === symbol.toUpperCase());
    if (!holding) {
        portfolio.holdings.push({
            symbol: symbol.toUpperCase(),
            shares,
            avgPrice: price
        });
        return portfolio.save();
    }
    const totalCost = holding.shares * holding.avgPrice + shares * price;
    const totalShares = holding.shares + shares;

    holding.shares = totalShares;
    holding.avgPrice = totalCost/totalShares;
    return portfolio.save();
};

export const processSell = async (
    userId: string,
    symbol: string,
    shares: number
) => {
    const portfolio = await Portfolio.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!portfolio) throw new AppError(404, 'PORTFOLIO_NOT_FOUND', 'Portfolio not found.');

    const holding = portfolio?.holdings.find(holding => holding.symbol === symbol.toUpperCase());

    if (!holding) {
       throw new AppError(404, 'HOLDING_NOT_FOUND', 'Holding not found in the portfolio.');
    }

    if (holding.shares < shares) {
        throw new AppError(400, 'INSUFFICIENT_SHARES', 'Insufficient shares available to complete this transaction.');
    }
    holding.shares -= shares;

    if (holding.shares === 0) {
        portfolio!.holdings = portfolio!.holdings.filter(holding => holding.symbol !== symbol.toUpperCase());
    }
    return portfolio.save();
};
