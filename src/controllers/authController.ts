import { Router } from 'express';
import prisma from '../index';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateSchema } from '../middleware/validateSchema';
import { registerSchema, loginSchema } from '../validators/authValidator';

const authRouter = Router();


authRouter.post('/register',validateSchema(registerSchema), async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({
            error: 'error creating user'
        })
    }
})

authRouter.post('/login',validateSchema(loginSchema), async (req: any, res: any) => {
    const { email, password } = req.body;
    try {

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'user not found' });

        const isMath = await bcrypt.compare(password, user.password);
        if (!isMath) return res.status(400).json({ error: 'invalid password' });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
        res.json({ token });
    }

    catch (error) {
        res.status(500).json({ error: 'error logging in' })
    }

});

authRouter.get('/me', async (req: any, res: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        const user = await prisma.user.findUnique({ where: { id: (decoded as any).userId } });
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: ' Token invalid' });
    }
})

export default authRouter;