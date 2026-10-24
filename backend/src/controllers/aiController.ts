import { NextFunction, Request, Response } from 'express';
import { analyzePortfolioContext } from '../services/aiService';
import Portfolio from '../models/Portfolio';
import { SECTOR_LOOKUP } from '../utils/constants';
import { getLatestMarketPrice } from '../services/marketProviderService';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    }
}

export const analyzePortfolio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authRequest = req as AuthenticatedRequest;
        const { prompt } = req.body;

        if (!prompt) {
            res.status(400).json({ error: 'Prompt query text is required.' });
            return;
        }

        const userId = authRequest.user?.id;

        const dbPortfolio = await Portfolio.findOne({ userId });
        
        if (!dbPortfolio || !dbPortfolio.holdings || dbPortfolio.holdings.length === 0) {
            res.status(422).json({
                error: 'No active investment portfolio found for this account. Please log a transaction first.'
            });
            return;
        }

        const portfolioContext = {
            profileName: 'Active Live Database Context Workspace',
            lastUpdated: dbPortfolio.updatedAt,
            holdings: dbPortfolio.holdings.map((holding: any) => {
                const uppercaseSymbol = holding.symbol.toUpperCase();

                // THE INTEGRATION CAPABILITY: Query your live ticking simulation cache!
                // This instantly pulls the current real-time streaming price point.
                const currentLiveMarketPrice = getLatestMarketPrice(uppercaseSymbol);

                return {
                    ticker: uppercaseSymbol,
                    sharesOwned: holding.shares,
                    averageBuyPrice: holding.avgPrice,
                    currentPrice: currentLiveMarketPrice, //holding.avgPrice - previously set when current price wasn't mapped,
                    sector: SECTOR_LOOKUP[uppercaseSymbol] || 'Diversified / Unassigned Financials'
                };
            })
        };

        const analysisResult = await analyzePortfolioContext(prompt, portfolioContext);

        res.json({ analysis: analysisResult });
    } catch (error) {
        next(error);
    }
}