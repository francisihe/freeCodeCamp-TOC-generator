import { Request, Response } from "express";

export const checkHealthStatus = async (req: Request, res: Response) => {

    res.json({
        success: true,
        message: "API is healthy...",
        meta: {
            timestamp: new Date().toISOString()
        }
    });

    return;
}