import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const RequestSchema = z.object({
    previewUrl: z.string().url().startsWith("https://preview.freecodecamp.org/"),
});

export const validatePreviewLink = (req: Request, res: Response, next: NextFunction) => {
    try {
        RequestSchema.parse(req.body);
        next();
    } catch (error: any) {
        console.error('Error validating preview link', error.issues)
        res.status(400).json({
            success: false,
            message: error.errors[0].message
        });
    }
};