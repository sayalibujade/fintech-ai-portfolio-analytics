import Transaction from '../models/Transaction';
import * as portfolioService from './portfolioService';
import { addTransaction, getTransactions } from './transactionService';

describe('Transaction Service', () => {
       beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('addTransaction() execution rules', () => {
        it('should log buy ticket params in database and route calculations to portfolio buy updates', async() => {
            const mockTransaction = {
                _id: 'mock_id_buy_1',
                userId: 'userId_1',
                symbol: 'NVDA',
                type: 'BUY',
                shares: 10,
                price: 115.50,
                date: new Date()
            };
            jest.spyOn(Transaction, 'create').mockResolvedValue(mockTransaction as any);
            
            const processBuySpy = jest.spyOn(portfolioService, 'processBuy').mockResolvedValue({} as any);
            const processSellSpy = jest.spyOn(portfolioService, 'processSell');

            const result = await addTransaction('userId_1', 'nvda', 'BUY', 10, 115.50);

            expect(Transaction.create).toHaveBeenCalledWith({ 
                userId: 'userId_1',
                symbol: 'NVDA',
                type: 'BUY',
                shares: 10,
                price: 115.50
            });
            expect(processBuySpy).toHaveBeenCalledWith('userId_1', 'nvda', 10, 115.50);
            expect(processSellSpy).not.toHaveBeenCalled();
            expect(result._id).toBe('mock_id_buy_1');
        });

        it('should log sell ticket params in database and route calculations to portfolio sell updates', async () => {
            const mockTransaction = {
                _id: 'mock_id_sell_2',
                userId: 'userId_2',
                symbol: 'AAPL',
                type: 'SELL',
                shares: 5,
                price: 225.00,
                date: new Date()
            };
            jest.spyOn(Transaction, 'create').mockResolvedValue(mockTransaction as any);
            
            const processBuySpy = jest.spyOn(portfolioService, 'processBuy');
            const processSellSpy = jest.spyOn(portfolioService, 'processSell').mockResolvedValue({} as any);

            const result = await addTransaction('userId_2', 'AAPL', 'SELL', 5, 225.00);

            expect(Transaction.create).toHaveBeenCalledWith({ 
                userId: 'userId_2',
                symbol: 'AAPL',
                type: 'SELL',
                shares: 5,
                price: 225.00
            });
            expect(processSellSpy).toHaveBeenCalledWith('userId_2', 'AAPL', 5);
            expect(processBuySpy).not.toHaveBeenCalled();
            expect(result._id).toBe('mock_id_sell_2');
        });
    });

    describe('getTransactions() execution rules', () => {
        it('should query database logs filtered by user context and sort sescending by timestamp date', async () => {
            const mockFindChain = {
                sort: jest.fn().mockResolvedValue([
                    { _id: 't1', symbol: 'TSLA', type: 'BUY' },
                    { _id: 't2', symbol: 'MSFT', type: 'SELL' }
                ])
            };
            jest.spyOn(Transaction, 'find').mockReturnValue(mockFindChain as any);
            const result = await getTransactions('userId_123');

            expect(Transaction.find).toHaveBeenCalledWith({ userId: 'userId_123' });
            expect(mockFindChain.sort).toHaveBeenCalledWith({ date: -1 });
            expect(result).toHaveLength(2);
            expect(result[0].symbol).toBe('TSLA');
        });
    });
});