import { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import allowedDomains from '../config/allowedDomains';

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedDomains.includes(origin)) {
            callback(null, true);
        } else {
            const errorMessage = `CORS policy: Origin ${origin} not allowed.`;
            callback(new Error(errorMessage));
        }
    },
    credentials: true,
};

export const corsMiddleware = cors(corsOptions);

export const corsErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.message.includes('CORS policy')) {
        console.error(err.message);
        res.status(403).json({
            success: false,
            message: err.message
        });
    } else {
        next(err);
    }
};