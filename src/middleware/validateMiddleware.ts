import {Request, Response, NextFunction} from 'express';
import {AnyZodObject} from 'zod';

export const validateMiddleware = (schema:AnyZodObject) => (req:Request, res:Response, next:NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error:any) {
        return res.status(400).json({message: error.errors});
    }
}
