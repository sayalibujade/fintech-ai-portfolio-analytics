import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/authService';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        const userData = await authService.signup(firstName, lastName, email, password);
        res.status(201).json({ message: 'User created', user: userData });
    } catch (error: any) {
        next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
        const { token, user } = await authService.login(email, password);
        res.status(200).json({ token, user });
    } catch (error: any) {
        next(error);
    }
}