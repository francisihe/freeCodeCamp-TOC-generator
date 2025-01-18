import dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV: string = process.env.NODE_ENV || 'development';
export const PORT: number = parseInt(process.env.PORT || '3000');