import { Request, Response } from 'express';
import { errorHandler } from './errorMiddleware';
import { AppError } from '../utils/AppError';

describe('Auth Middleware Suite', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        
        jest.spyOn(console, 'error').mockImplementation(() => {});

        mockRequest = {};

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    it('should parse custom AppError contexts and return the designated status codes and codes mappings', () => {
        const customAppError = new AppError(409, 'USER_ALREADY_EXISTS', 'User with this email already exists.');

        errorHandler(customAppError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(409);
        expect(mockResponse.json).toHaveBeenCalledWith({
            code: 'USER_ALREADY_EXISTS',
            error: 'User with this email already exists.'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });
    
    it('should log error context and return a generic 500 error if an unknown runtime exception is intercepted', () => {
        const structuralCrashError = new Error('Connection breakdown error');

        errorHandler(structuralCrashError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(console.error).toHaveBeenCalledWith(structuralCrashError);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            code: 'INTERNAL_SERVER_ERROR',
            error: 'Internal Server Error'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });
});