process.env.JWT_SECRET = 'secret_jwt_token_key_123';

import { Types } from 'mongoose';
import * as authService from '../services/authService';
import { login, signup } from './authController';
import { AppError } from '../utils/AppError';

describe('Auth Controller', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: any;

    const mockObjectId = new Types.ObjectId;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        mockRequest = {
            body: {}
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    describe('signup() execution rules', () => {
        it('should return a 201 status and user payload data if all required params pass validation', async () => {
            mockRequest.body = {
                firstName: 'John',
                lastName: 'Dave',
                email: 'john@example.com',
                password: 'secure_password_111'
            };

            const mockServiceUserData = {
                id: mockObjectId,
                firstName: 'John',
                lastName: 'Dave',
                email: 'john@example.com',
                createdAt: new Date()
            };

            const signupSpy = jest.spyOn(authService, 'signup').mockResolvedValue(mockServiceUserData);

            await signup(mockRequest, mockResponse, mockNext);

            expect(signupSpy).toHaveBeenCalledWith('John', 'Dave', 'john@example.com', 'secure_password_111');
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'User created',
                user: mockServiceUserData
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
        
        it('should return 400 bad request error if any required validation param is missing', async () => {
            mockRequest.body = {
                firstName: 'John',
                lastName: 'Dave',
                email: 'john@example.com'
            };

            const signupSpy = jest.spyOn(authService, 'signup');

            await signup(mockRequest, mockResponse, mockNext);

            expect(signupSpy).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'All fields are required.' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should invoke next() middleware downstream with error payload when service rejects', async () => {
            mockRequest.body = {
                firstName: 'John',
                lastName: 'Dave',
                email: 'john@example.com',
                password: 'secure_password_111'
            };

            const serviceError = new AppError(409, 'USER_ALREADY_EXISTS', 'User with this email already exists.');

            jest.spyOn(authService, 'signup').mockRejectedValue(serviceError);

            await signup(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('login() execution rules', () => {
        it('should return a 200 status along with JWT token and user profile details upon valid credentials', async () => {
            mockRequest.body = {
                email: 'john@example.com',
                password: 'secure_password_111'
            };

            const mockAuthPayload = {
                token: 'mocked_jwt_session_string',
                user: {
                    id: mockObjectId,
                    firstName: 'John',
                    lastName: 'Dave',
                    email: 'john@example.com',
                    createdAt: new Date()
                }
            };

            const loginSpy = jest.spyOn(authService, 'login').mockResolvedValue(mockAuthPayload);

            await login(mockRequest, mockResponse, mockNext);

            expect(loginSpy).toHaveBeenCalledWith('john@example.com', 'secure_password_111');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockAuthPayload);
            expect(mockNext).not.toHaveBeenCalled();
        });
        
        it('should return 400 bad request error if email or password are empty', async () => {
            mockRequest.body = {
                email: ''
            };

            const loginSpy = jest.spyOn(authService, 'login');

            await login(mockRequest, mockResponse, mockNext);

            expect(loginSpy).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Email and password required' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should forward unexpected exceptions to next() global handler middleware', async () => {
            mockRequest.body = {
                email: 'john@example.com',
                password: 'secure_password_111'
            };

            const internalError = new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');

            jest.spyOn(authService, 'login').mockRejectedValue(internalError);

            await login(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(internalError);
        });
    });
});