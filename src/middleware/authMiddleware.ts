import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {prisma} from '../index';

interface AuthRequest extends Request {
    user?: any
}

// declare global {
//     namespace Express {
//         interface Request {
//             user?: any
//         }
//     }
// }

const authMiddleware = async (req: AuthRequest | Request, res: Response | any, next: NextFunction | any) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Acceso denegado. No se encontro token' });
    }

    try {
        const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET as string);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(401).json({ message: 'user not found' })
        }
        (req as AuthRequest).user = user;
        void next();
    } catch (error) {
        res.status(400).json({ message: 'token invalid' });
    }
}

// const authMiddlware = (req: Request, res: Response, next: NextFunction) => {
//     const token = req.header('Authorization')?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'unauthorized' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         res.status(400).json({ message: 'token invalid' });
//     }
// };

export default authMiddleware;