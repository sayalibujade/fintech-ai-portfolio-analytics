import Portfolio from '../models/Portfolio';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { login, signup } from './authService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authentication Service', () => {
       beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('signup() execution rules', () => {
        it('should create user account profile and return asset data if payload values match unique limits', async() => {
            const findOneSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
            const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('mocked_hashed_password' as never);

            const mockCreatedUser = {
                _id: 'mock_user_id_123',
                firstName: 'TestFirstName',
                lastName: 'TestLastName',
                email: 'test@example.com',
                createdAt: new Date()
            };
            
            const createSpy = jest.spyOn(User, 'create').mockResolvedValue(mockCreatedUser as any);
            const portfolioSpy = jest.spyOn(Portfolio, 'create').mockResolvedValue({} as any);

            const result = await signup('TestFirstName', 'TestLastName', 'test@example.com', 'password123');

            expect(findOneSpy).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(hashSpy).toHaveBeenCalledWith('password123', 10);
            expect(createSpy).toHaveBeenCalled();
            expect(portfolioSpy).toHaveBeenCalledWith({ userId: 'mock_user_id_123', holdings: [] });

            expect(result.id).toBe('mock_user_id_123');
            expect(result.email).toBe('test@example.com');
        });

        it('should throw an AppError with 409 status code if email id already exists in database', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue({ _id: 'existing_id' } as any);
            jest.spyOn(User, 'create');

            await expect(signup('TestFirstName', 'TestLastName', 'test@example.com', 'password123'))
                .rejects
                .toThrow(new AppError(409, 'USER_ALREADY_EXISTS', 'User with this email already exists.'));
            expect(User.create).not.toHaveBeenCalled();
        });
    });

    describe('login() execution rules', () => {
        it('should return cryptographically signed JWT authorization tokens if creadentials match user records', async () => {
            const mockUser = {
                _id: 'user_id_111',
                firstName: 'John',
                lastName: 'White',
                email: 'john@example.com',
                passwordHash: 'stored_hash_value',
                createdAt: new Date()
            };
            jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
            jest.spyOn(jwt, 'sign').mockImplementation(() => 'mock_jwt_access_token');

            const result = await login('john@example.com', 'password123');

            expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'stored_hash_value');
            expect(result.token).toBe('mock_jwt_access_token');
            expect(result.user.id).toBe('user_id_111');
        });

        it('should throw an AppError 404 status if target user email resolves to null', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(null);
            
            await expect(login('unknown@example.com', 'pass'))
                .rejects
                .toThrow(new AppError(404, 'USER_NOT_FOUND', 'No account found with this email address.'));
        });

        it('should throw an AppError 401 status if password decrypt verification checks fail parameters', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue({ passwordHash: 'hash' } as any);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
            await expect(login('john@example.com', 'wrong_password'))
                .rejects
                .toThrow(new AppError(401, 'INVALID_CREDENTILAS', 'Invalid email or password.'));
        });
    });

    describe('Authentication Service Environment guard check', () => {
        it('should crash process loop immediately when JWT_SECRET vanishes from configuration systems', () => {
            const originalSecret = process.env.JWT_SECRET;
            delete process.env.JWT_SECRET;

            expect(() => {
                jest.isolateModules(() => {
                    require('./authService');
                });
            }).toThrow(new Error('JWT_SECRET not defined in .env'));

            process.env.JWT_SECRET = originalSecret
        });
    });
});