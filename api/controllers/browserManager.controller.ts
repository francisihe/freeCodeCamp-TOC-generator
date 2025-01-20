import { Request, Response } from "express";
import { getStatus } from "../services/browserManager";

export const getBrowserStatus = (req: Request, res: Response): void => {
    const status = getStatus();
    res.json({
        "success": true,
        "message": "Browser status retrieved successfully",
        "data": status,
        "meta": {
            "timestamp": new Date().toISOString()
        }
    });
};