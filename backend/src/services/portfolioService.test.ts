import Portfolio from '../models/Portfolio';
import { AppError } from '../utils/AppError';
import { getPortfolio, processSell, processBuy } from './portfolioService';

describe('Portfolio Service', () => {
    const mockUserId = '660000000000000000000001';
       beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('getPortfolio() execution rules', () => {
        it('should query portfolio document filtered by userId', async() => {
            const mockPortfolio = { userId: mockUserId, holdings: [] };
            jest.spyOn(Portfolio, 'findOne').mockResolvedValue(mockPortfolio as any);

            const result = await getPortfolio(mockUserId);

            expect(Portfolio.findOne).toHaveBeenCalledWith({ userId: mockUserId });
            expect(result).toEqual(mockPortfolio);
        });
    });

    describe('processBuy() execution rules', () => {
        it('should throw 404 AppError if target portfolio context block does not exist', async () => {
            jest.spyOn(Portfolio, 'find').mockResolvedValue([] as any);
            jest.spyOn(Portfolio, 'findOne').mockResolvedValue(null);
            
            await expect(processBuy(mockUserId, 'AAPL', 10, 150))
                .rejects
                .toThrow(new AppError(404, 'PORTFOLIO_NOT_FOUND', 'Portfolio not found.'));
        });

        it('should append a new holding block if ticker does not exist in allocations array', async () => {
            const mockSave = jest.fn().mockResolvedValue(true);
            const mockPortfolio = {
                userId: mockUserId,
                holdings: [] as any[],
                save: mockSave
            };

            jest.spyOn(Portfolio, 'find').mockResolvedValue([mockPortfolio] as any);
            jest.spyOn(Portfolio, 'findOne').mockResolvedValue(mockPortfolio as any);

            await processBuy(mockUserId, 'aapl', 10, 150);

            expect(mockPortfolio.holdings).toHaveLength(1);
            expect(mockPortfolio.holdings[0]).toEqual({
                symbol: 'AAPL',
                shares: 10,
                avgPrice: 150
            });
            expect(mockSave).toHaveBeenCalled();
        });

        it('should recalculate fintech weighted average cost basis if ticker already exists', async () => {
            const mockSave = jest.fn().mockResolvedValue(true);
            const mockExistingHolding = { symbol: 'NVDA', shares: 10, avgPrice: 100 };
            const mockPortfolio = {
                userId: mockUserId,
                holdings: [{ symbol: 'NVDA', shares: 10, avgPrice: 100 }],
                save: mockSave
            };

            jest.spyOn(Portfolio, 'find').mockResolvedValue([mockPortfolio] as any);
            jest.spyOn(Portfolio, 'findOne').mockResolvedValue(mockPortfolio as any);

            await processBuy(mockUserId, 'nvda', 10, 200);

            expect(mockPortfolio.holdings[0].shares).toBe(20);
            expect(mockPortfolio.holdings[0].avgPrice).toBe(150);
            expect(mockSave).toHaveBeenCalled();
        });
    });

    describe('processSell() execution rules', () => {
        it('should throw 404 AppError if target portfolio context is missing on sell execution', async () => {
            jest.spyOn(Portfolio, 'findOne').mockResolvedValue(null);
            
            await expect(processSell(mockUserId, 'AAPL', 5))
                .rejects
                .toThrow(new AppError(404, 'PORTFOLIO_NOT_FOUND', 'Portfolio not found.'));
        });

        it('should throw 404 AppError if requested ticker is missing from asset holdings', async () => {
            const mockPortfolio = {
                holdings: [] as any[]
            };
            
            jest.spyOn(Portfolio, 'findOne').mockResolvedValue(mockPortfolio as any);
            
            await expect(processSell(mockUserId, 'TSLA', 5))
                .rejects
                .toThrow(new AppError(404, 'HOLDING_NOT_FOUND', 'Holding not found in the portfolio.'));
        });

        it('should throw 400 AppError if order unit count volume exceeds positions owned', async () => {
            const mockPortfolio = {
                holdings: [{ symbol: 'AAPL', shares: 5 }]
            };
            
            jest.spyOn(Portfolio, 'findOne').mockResolvedValue(mockPortfolio as any);
            
            await expect(processSell(mockUserId, 'AAPL', 10))
                .rejects
                .toThrow(new AppError(400, 'INSUFFICIENT_SHARES', 'Insufficient shares available to complete this transaction.'));
        });

        it('should decrement share counts if volume params pass rules', async () => {
            const mockSave = jest.fn().mockResolvedValue(true);
            const mockExistingHolding = { symbol: 'AAPL', shares: 15 };
            const mockPortfolio = {
                holdings: {
                    find: jest.fn().mockReturnValue(mockExistingHolding)
                },
                save: mockSave
            };

            jest.spyOn(Portfolio, 'findOne').mockResolvedValue(mockPortfolio as any);

            await processSell(mockUserId, 'AAPL', 5);

            expect(mockExistingHolding.shares).toBe(10);
            expect(mockSave).toHaveBeenCalled();
        });

        it('should filter target document completely from matrix array if share count hits absolute zero', async () => {
            const mockSave = jest.fn().mockResolvedValue(true);
            const mockPortfolio = {
                holdings: [
                    { symbol: 'AAPL', shares: 5 },
                    { symbol: 'NVDA', shares: 2 },
                ],
                save: mockSave
            };

            jest.spyOn(mockPortfolio.holdings, 'find').mockReturnValue(mockPortfolio.holdings[0]);
            jest.spyOn(Portfolio, 'findOne').mockResolvedValue(mockPortfolio as any);

            await processSell(mockUserId, 'AAPL', 5);

            expect(mockPortfolio.holdings).toHaveLength(1);
            expect(mockPortfolio.holdings[0].symbol).toBe('NVDA');
            expect(mockSave).toHaveBeenCalled();
        });
    });
});