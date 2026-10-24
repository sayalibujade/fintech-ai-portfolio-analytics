import { NextFunction, Request, Response } from 'express';
import * as portfolioService from '../services/portfolioService';

export const getPortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const portfolio = await portfolioService.getPortfolio(userId as string);
        if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

        const enrichedHoldings = portfolio.holdings.map(item => {
            const symbolKey = item.symbol.toUpperCase().trim();
            //Fetch price from our dictionary ,fallback to $100 if asset isn't listed
            const livePrice = MOCK_MARKET_PRICES[symbolKey] || 100.00;
            return {
                symbol: item.symbol,
                shares: item.shares,
                avgPrice: item.avgPrice,
                currentPrice: livePrice
            }
        });
        res.json({
            _id: portfolio._id,
            userId: portfolio.userId,
            holdings: enrichedHoldings,
            updatedAt: portfolio.updatedAt
        });
    } catch (error: any) {
        next(error);
    }      
}

const MOCK_MARKET_PRICES: Record<string, number> = {
    AAPL: 182.50,
    TSLA: 210.40,
    BTC: 64200.00,
    ETH: 2650.00,
    GOOGL: 165.30
};