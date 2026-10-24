import bcrypt from 'bcryptjs';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import Portfolio from '../models/Portfolio';
import { AppError } from '../utils/AppError';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined in .env');

export const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError(409, 'USER_ALREADY_EXISTS', 'User with this email already exists.');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, email, passwordHash });
    await Portfolio.create({ userId: user._id, holdings: [] });
    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
    };
};

export const login = async (email: string, password: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'No account found with this email address.');
    const isValid = await bcrypt.compare(password, user!.passwordHash);
    if (!isValid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    return { 
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt
        }
    };
};