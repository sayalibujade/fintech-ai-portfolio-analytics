import Portfolio from '../models/Portfolio';
import * as marketProviderService from '../services/marketProviderService';
import * as aiService from '../services/aiService';
import { analyzePortfolio } from './aiController';

describe('AI Controller', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: any;

    const findOneSpy = jest.spyOn(Portfolio, 'findOne');
    const analyzeSpy = jest.spyOn(aiService, 'analyzePortfolioContext');

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        mockRequest = {
            body: { prompt: 'Analyze my risk parameters' },
            user: { id: 'user_ai-1' }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    it('should respond with a 200 JSON payload containing structured Gemini analytics text if portfolio has open weights', async () => {
        const mockDbPortfolio = {
            updatedAt: '2026-10-07T12:00:00.000Z',
            holdings: [
                { symbol: 'AAPL', shares: 10, avgPrice: 150.00 },
                { symbol: 'NVDA', shares: 20, avgPrice: 100.00 },
                { symbol: 'XYZ', shares: 50, avgPrice: 10.00 }
            ]
        };

        jest.spyOn(Portfolio, 'findOne').mockResolvedValue(mockDbPortfolio as any);
        jest.spyOn(marketProviderService, 'getLatestMarketPrice').mockImplementation((symbol) => {
            if (symbol === 'AAPL') return 225.00;
            if (symbol === 'NVDA') return 115.50;
            return 12.50;
        });
        jest.spyOn(aiService, 'analyzePortfolioContext').mockResolvedValue('#### AI Report\n- Weights look fully optimized.');

        await analyzePortfolio(mockRequest, mockResponse, mockNext);

        expect(Portfolio.findOne).toHaveBeenCalledWith({ userId: 'user_ai-1' });
        expect(marketProviderService.getLatestMarketPrice).toHaveBeenCalledWith('AAPL');
        expect(marketProviderService.getLatestMarketPrice).toHaveBeenCalledWith('NVDA');
        expect(aiService.analyzePortfolioContext).toHaveBeenCalledWith(
            'Analyze my risk parameters',
            {
                profileName: 'Active Live Database Context Workspace',
                lastUpdated: '2026-10-07T12:00:00.000Z',
                holdings: [
                    { ticker: 'AAPL', sharesOwned: 10, averageBuyPrice: 150.00, currentPrice: 225.00, sector: expect.any(String) },
                    { ticker: 'NVDA', sharesOwned: 20, averageBuyPrice: 100.00, currentPrice: 115.50, sector: expect.any(String) },
                    { ticker: 'XYZ', sharesOwned: 50, averageBuyPrice: 10.00, currentPrice: 12.50, sector: 'Diversified / Unassigned Financials' }
                ]
            }
        );
        expect(mockResponse.json).toHaveBeenCalledWith({ analysis: '#### AI Report\n- Weights look fully optimized.' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return a 400 validation alert if the prompt text query parameter is missing from the payload request body', async () => {
        // Strip the prompt from the request body input
        mockRequest.body.prompt = undefined;

        await analyzePortfolio(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Prompt query text is required.' });
        expect(findOneSpy).not.toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return a 422 alert if no portfolio document or active assets are found inside the account database profiles', async () => {
        // Simulate an account profile with zero open transaction logs
        const mockEmptyPortfolio = { holdings: [] as any[] };
        jest.spyOn(Portfolio, 'findOne').mockResolvedValue(mockEmptyPortfolio as any);

        await analyzePortfolio(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(422);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'No active investment portfolio found for this account. Please log a transaction first.'
        });
        expect(analyzeSpy).not.toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fallback to 422 if findOne returns null entirely', async () => {
        jest.spyOn(Portfolio, 'findOne').mockResolvedValue(null);

        await analyzePortfolio(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(422);
        expect(mockNext).not.toHaveBeenCalled();
    });

      it('should cleanly redirect execution traces down to next(error) if processing runtime crashes', async () => {
        const testRuntimeCrash = new Error('Mongoose query pool connection exhaustion exception.');
        jest.spyOn(Portfolio, 'findOne').mockRejectedValue(testRuntimeCrash);

        await analyzePortfolio(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(testRuntimeCrash);
        expect(mockResponse.json).not.toHaveBeenCalled();
    });
});