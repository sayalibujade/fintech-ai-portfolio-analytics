import { Types } from 'mongoose';
import * as portfolioService from '../services/portfolioService';
import { getPortfolio } from './portfolioController';

describe('Portfolio Controller', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: any;

    const mockUserId = 'user_id_22'
    const mockPortfolioId = new Types.ObjectId();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        mockRequest = {
            user: { id: mockUserId }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    describe('getPortfolio() execution path branches', () => {
        it('should return 200 and enrich assets with mock prices', async () => {
            const mockDbPortfolio = {
                _id: mockPortfolioId,
                userId: mockUserId,
                updatedAt: new Date(),
                holdings: [
                    { symbol: 'AAPL', shares: 10, avgPrice: 150.00 },
                    { symbol: 'msft', shares: 5, avgPrice: 300.00 }
                ]
            };

            const serviceSpy = jest.spyOn(portfolioService, 'getPortfolio').mockResolvedValue(mockDbPortfolio as any);

            await getPortfolio(mockRequest, mockResponse, mockNext);

            expect(serviceSpy).toHaveBeenCalledWith(mockUserId);
            expect(mockResponse.status).not.toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                _id: mockDbPortfolio._id,
                userId: mockDbPortfolio.userId,
                updatedAt: mockDbPortfolio.updatedAt,
                holdings: [
                    { symbol: 'AAPL', shares: 10, avgPrice: 150.00, currentPrice: 182.50 },
                    { symbol: 'msft', shares: 5, avgPrice: 300.00, currentPrice: 100.00 }
                ]
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 404 status error if the service returns no portfolio data', async () => {
            jest.spyOn(portfolioService, 'getPortfolio').mockResolvedValue(null);
            
            await getPortfolio(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(404);            
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Portfolio not found' });            
            expect(mockNext).not.toHaveBeenCalled();
        });

        
        it('should catch unexpected exceptions and forward them down via next() middleware', async () => {
            const trackingError = new Error('Database timeout failure');
            jest.spyOn(portfolioService, 'getPortfolio').mockRejectedValue(trackingError);
            
            await getPortfolio(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).not.toHaveBeenCalled();            
            expect(mockResponse.json).not.toHaveBeenCalled();            
            expect(mockNext).toHaveBeenCalledWith(trackingError);
        });
    });
});