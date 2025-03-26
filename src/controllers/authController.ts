import { Router } from 'express';
import prisma from '../index';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { validateSchema } from '../middleware/validateSchema';
import { registerSchema, loginSchema } from '../validators/authValidator';
import authMiddleware from '../middleware/authMiddleware';

const authRouter = Router();


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: "John Doe"
 *                 minLength: 2
 *               email:
 *                 type: string
 *                 description: Correo electrónica del usuario
 *                 example: "tUWd3@example.com"
 *                 format: email
 *                 minLength: 6
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */

authRouter.post('/register', validateSchema(registerSchema), async (req : any, res : any) => {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'user already exists' });

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
    const token = generateToken(user.id, "user");
    res.json({ message: "user created", token });
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     description: Autentica a un usuario con email y contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@email.com
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 example: 123456
 *                 format: password
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso, devuelve el token de autenticación
 *       401:
 *         description: Credenciales incorrectas
 */

authRouter.post('/login', validateSchema(loginSchema), async (req: any, res: any) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({message: "credentials invalid"});

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return res.status(400).json({message: "credentials invalid"});

    const token = generateToken (user.id,  user.role);
    res.json({message:"login successful", token});
});
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *       401:
 *         description: No autorizado - Token inválido o no proporcionado
 */
authRouter.get('/me', authMiddleware, async (req: any, res: any) => {

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    res.json(user);
})

export default authRouter;