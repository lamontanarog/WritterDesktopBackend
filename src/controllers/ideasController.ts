import { Router } from "express";
import {prisma} from "../index";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import { ideaSchema } from "../validators/ideaValidator";
import { validateSchema } from "../middleware/validateSchema";

const ideasRouter = Router();

/**
 * @swagger
 * /api/ideas/random:
 *   get:
 *     summary: Obtener una idea aleatoria
 *     tags: [Ideas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Idea aleatoria obtenida
 *       500:
 *         description: Error interno del servidor
 */
ideasRouter.get('/random', authMiddleware, async (req: any, res: any) => {
    const idea = await prisma.idea.findFirst({
        orderBy: { id: 'asc' },
        skip: Math.floor(Math.random() * 10)
    });
    res.json(idea);
})

/**
 * @swagger
 * /api/ideas/:
 *   get:
 *     summary: Obtener una lista de ideas
 *     tags: [Ideas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de ideas por página
 *     responses:
 *       200:
 *         description: lista de ideas obtenida
 *       500:
 *         description: Error interno del servidor
 */
ideasRouter.get('/', authMiddleware, async (req: any, res: any) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = {};
        if (search) {
            where.content = {
                contains: search as string,
                mode: 'insensitive', // Búsqueda sin distinción de mayúsculas/minúsculas
            };
        }

        const ideas = await prisma.idea.findMany({
            where,
            skip,
            take,
            orderBy: { id: 'asc' },
        });

        const total = await prisma.idea.count({ where });

        res.json({
            data: ideas,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ideas' });
    }
});

/**
 * @swagger
 * /api/ideas:
 *   post:
 *     summary: Crear una nueva idea
 *     tags: [Ideas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 example: "Mi idea"
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 example: "Contenido de mi idea"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Idea creada con éxito
 */
ideasRouter.post('/', adminMiddleware, validateSchema(ideaSchema), async (req: any, res: any) => {
    const { title, content } = req.body;
    const idea = await prisma.idea.create({ data: { title, content } });
    res.json(idea);
})

/**
 * @swagger
 * /api/ideas/{id}:
 *   delete:
 *     summary: Eliminar una idea
 *     tags: [Ideas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la idea a eliminar
 *     responses:
 *       200:
 *         description: Idea eliminada correctamente
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Idea no encontrada
 *       500:
 *         description: Error interno del servidor
 */
ideasRouter.delete('/:id', adminMiddleware, validateSchema(ideaSchema), async (req: any, res: any) => {
    const { id } = req.params;
    await prisma.idea.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'idea deleted' });
})
/**
 * @swagger
 * /api/ideas/{id}:
 *   get:
 *     summary: Obtener una idea específica
 *     tags: [Ideas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Idea obtenida correctamente
 *       404:
 *         description: Idea no encontrada
 */
ideasRouter.get('/:id', authMiddleware, async (req: any, res: any) => {
    const { id } = req.params;
    const idea = await prisma.idea.findUnique({ where: { id: parseInt(id) } });
    if (!idea) return (res.status(400).json({ message: 'idea not found' }));
    res.json(idea);
})
/**
 * @swagger
 * /api/ideas/{id}:
 *   put:
 *     summary: Editar una idea
 *     tags: [Ideas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la idea a editar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 example: "Mi idea"
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 example: "Contenido de mi idea"
 *     responses:
 *       200:
 *         description: Idea editada correctamente
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Idea no encontrada
 *       500:
 *         description: Error interno del servidor
 */
ideasRouter.put('/:id', adminMiddleware, validateSchema(ideaSchema), async (req: any, res: any) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const idea = await prisma.idea.update({ where: { id: parseInt(id) }, data: { title, content } });
    res.json(idea);
})

export default ideasRouter;