import { Types } from 'mongoose';
import * as transactionService from '../services/transactionService';
import { addTransaction, getTransactions } from './transactionsController';

describe('Transactions Controller', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: any;

    const mockUserId = 'user_id_33'
    const mockTransactionId = new Types.ObjectId();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        mockRequest = {
            body: {},
            user: { id: mockUserId }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    describe('addTransaction() execution branches', () => {
        it('should process a valid transaction payload, uppercase the ticker, and return a 201 status with payload', async () => {
            mockRequest.body = {
                symbol: 'TSLA',
                type: 'BUY',
                shares: 5,
                price: 210.40
            };
            const mockServiceResult = {
                _id: mockTransactionId,
                userId: mockUserId,
                symbol: 'TSLA',
                type: 'BUY',
                shares: 5,
                price: 210.40,
                createdAt: new Date()
            };

            const addSpy = jest.spyOn(transactionService, 'addTransaction').mockResolvedValue(mockServiceResult as any);

            await addTransaction(mockRequest, mockResponse, mockNext);

            expect(addSpy).toHaveBeenCalledWith(mockUserId, 'TSLA', 'BUY', 5, 210.40);
            expect(mockResponse.status).toHaveBeenCalledWith(201);            
            expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResult);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should intercept service execution runtime exceptions and forward to next() middleware', async () => {
            mockRequest.body = {
                symbol: 'AAPL',
                type: 'SELL',
                shares: 100,
                price: 182.50
            };

            const serviceError = new Error('Database isolation error execution roadblock.');
            jest.spyOn(transactionService, 'addTransaction').mockRejectedValue(serviceError);
            
            await addTransaction(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).not.toHaveBeenCalled();            
            expect(mockResponse.json).not.toHaveBeenCalled();            
            expect(mockNext).toHaveBeenCalledWith(serviceError);
        });
    });

     describe('getTransactions() execution branches', () => {
        it('should query transaction logs and return a list matching  the active context session', async () => {
            const mockHistory = {
                _id: mockTransactionId,
                symbol: 'BTC',
                type: 'BUY',
                shares: 0.25,
                price: 64200.00
            };

            const getSpy = jest.spyOn(transactionService, 'getTransactions').mockResolvedValue(mockHistory as any);

            await getTransactions(mockRequest, mockResponse, mockNext);

            expect(getSpy).toHaveBeenCalledWith(mockUserId);
            expect(mockResponse.status).not.toHaveBeenCalled();            
            expect(mockResponse.json).toHaveBeenCalledWith(mockHistory);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should forward structural lookups expections to the global error middleware block', async () => {
            const connectionError = new Error('Read replica cluster dropped socket connection.');
            jest.spyOn(transactionService, 'getTransactions').mockRejectedValue(connectionError);
            
            await getTransactions(mockRequest, mockResponse, mockNext);
       
            expect(mockResponse.json).not.toHaveBeenCalled();            
            expect(mockNext).toHaveBeenCalledWith(connectionError);
        });
    });
});