import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            code: error.code,
            error: error.message
        });
    }
    console.error(error);
    return res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        error: 'Internal Server Error'
    });
};