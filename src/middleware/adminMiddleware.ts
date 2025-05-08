import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    user?: any;
}

const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        res.status(403).json({ message: 'Acceso denegado. No eres admin' });
        return;
    }
    next();
}

export default adminMiddleware;