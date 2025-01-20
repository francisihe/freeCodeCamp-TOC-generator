import dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV: string = process.env.NODE_ENV || 'development';
export const PORT: number = parseInt(process.env.PORT || '3000');

// Browser manager constants
export const MAX_PAGES: number = process.env.MAX_PAGES ? parseInt(process.env.MAX_PAGES) : 5;
export const PAGE_TIMEOUT: number = process.env.PAGE_TIMEOUT ? parseInt(process.env.PAGE_TIMEOUT) : 40000;
export const QUEUE_TIMEOUT: number = process.env.QUEUE_TIMEOUT ? parseInt(process.env.QUEUE_TIMEOUT) : 60000;
export const PAGE_IDLE_TIMEOUT: number = process.env.PAGE_IDLE_TIMEOUT ? parseInt(process.env.PAGE_IDLE_TIMEOUT) : 0.5 * 60 * 1000; // 30 seconds