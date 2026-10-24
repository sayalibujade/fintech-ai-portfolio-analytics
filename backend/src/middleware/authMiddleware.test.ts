process.env.JWT_SECRET = 'secret_jwt_token_key_123';

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from './authMiddleware';

describe('Auth Middleware Suite', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        mockRequest = {
            headers: {}
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    it('should allow access and attach user payload when a valid bearer token is provided', () => {
        mockRequest.headers!.authorization = 'Bearer valid_mock_token';
        const mockDecodedPayload = { id: 'user_id_1' };

        const verifySpy = jest.spyOn(jwt, 'verify').mockReturnValue(mockDecodedPayload as any);

        authenticate(mockRequest as Request, mockResponse as Response, mockNext);

        expect(verifySpy).toHaveBeenCalledWith('valid_mock_token', 'secret_jwt_token_key_123');
        expect(mockRequest.user).toEqual(mockDecodedPayload);
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).not.toHaveBeenCalled();
    });
    
    it('should return 401 error if the authorization header is missing', () => {
        mockRequest.headers!.authorization = undefined;

        authenticate(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token missing' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 error if token verification throws an error inside the catch block', () => {
        mockRequest.headers!.authorization = 'Bearer invalid_or_expired_token';

        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('jwt expired');
        });

        authenticate(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        expect(mockNext).not.toHaveBeenCalled();
    });
});