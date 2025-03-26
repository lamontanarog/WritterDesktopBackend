import { Router } from 'express';
import authRoutes from '../controllers/authController';
import ideasRoutes from '../controllers/ideasController';
import textsRoutes from '../controllers/textsControllers';
import authMiddlware from '../middleware/authMiddleware';
import adminMiddleware from '../middleware/adminMiddleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ideas', (req, res, next) => {
    authMiddlware(req, res, next)
}, ideasRoutes);
router.use('/texts', (req, res, next) => {
    authMiddlware(req, res, next)
}, textsRoutes);


export default router;