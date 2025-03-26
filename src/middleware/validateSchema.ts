import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';

export const validateSchema = (schema: ZodSchema) => {
    return (req : Request, res : Response, next : NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ errors: result.error.format() });
        } else {
            next();
        }
    }
}