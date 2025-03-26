import { Router } from 'express';
import prisma from '../index';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { validateSchema } from '../middleware/validateSchema';
import { registerSchema, loginSchema } from '../validators/authValidator';

const authRouter = Router();


authRouter.post('/register', validateSchema(registerSchema), async (req : any, res : any) => {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'user already exists' });

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
    const token = generateToken(user.id, "user");
    res.json({ message: "user created", token });
})

authRouter.post('/login', validateSchema(loginSchema), async (req: any, res: any) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({message: "credentials invalid"});

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return res.status(400).json({message: "credentials invalid"});

    const token = generateToken (user.id,  user.role);
    res.json({message:"login successful", token});
});

// authRouter.get('/me', async (req: any, res: any) => {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ error: 'unauthorized' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET!); 
//         const user = await prisma.user.findUnique({ where: { id: (decoded as any).userId } });
//         res.json(user);
//     } catch (error) {
//         res.status(400).json({ message: 'token invalid' });
//     }
// })

export default authRouter;