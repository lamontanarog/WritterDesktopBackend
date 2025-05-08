import { Router } from "express";
import { prisma } from "../index";
import authMiddleware from "../middleware/authMiddleware";
import { textSchema } from "../validators/textValidator";
import { validateSchema } from "../middleware/validateSchema";

const textsRouter = Router();

/**
 * @swagger
 * /api/texts:
 *   get:
 *     summary: Obtener todos los textos del usuario autenticado
 *     tags: [Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: ideaId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de textos obtenida
 *       500:
 *         description: Error interno del servidor
 */
textsRouter.get('/', authMiddleware, async (req: any, res: any) => {
    try {
        const { page = 1, limit = 10, ideaId, startDate, endDate } = req.query;
        const userId = req.user.id;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = { userId };
        if (ideaId) where.ideaId = Number(ideaId);
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
            };
        }

        const texts = await prisma.text.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
        const total = await prisma.text.count({ where });

        res.json({ data: texts, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener textos" });
    }
});

/**
 * @swagger
 * /api/texts:
 *   post:
 *     summary: Crear un nuevo texto
 *     tags: [Texts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, time, ideaId]
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Contenido de mi idea"
 *               time:
 *                 type: number
 *               ideaId:
 *                 type: number
 *     responses:
 *       201:
 *         description: Texto creado con éxito
 *       500:
 *         description: Error interno del servidor
 */
textsRouter.post('/', authMiddleware, validateSchema(textSchema), async (req: any, res: any) => {
    try {
        const { content, time, ideaId } = req.body;
        const userId = req.user.id;

        const newText = await prisma.text.create({ data: { content, time, ideaId, userId } });
        res.status(201).json(newText);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear texto" });
    }
});

/**
 * @swagger
 * /api/texts/{id}:
 *   get:
 *     summary: Obtener un texto por ID (solo si es del usuario)
 *     tags: [Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Texto obtenido con éxito
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Texto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
textsRouter.get('/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const text = await prisma.text.findUnique({ where: { id: Number(id) }, include: { idea: true } });

        if (!text) return res.status(404).json({ message: 'Texto no encontrado' });
        if (text.userId !== userId) return res.status(403).json({ message: 'No autorizado' });

        res.json(text);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el texto" });
    }
});

/**
 * @swagger
 * /api/texts/{id}:
 *   put:
 *     summary: Actualizar un texto por ID (solo si es del usuario)
 *     tags: [Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, time, ideaId]
 *             properties:
 *               content:
 *                 type: string
 *               time:
 *                 type: number
 *               ideaId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Texto actualizado con éxito
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
textsRouter.put('/:id', authMiddleware, validateSchema(textSchema), async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { content, time, ideaId } = req.body;
        const userId = req.user.id;

        const updated = await prisma.text.updateMany({
            where: { id: Number(id), userId },
            data: { content, time, ideaId },
        });

        if (updated.count === 0) {
            return res.status(403).json({ message: 'No autorizado o texto inexistente' });
        }

        const updatedText = await prisma.text.findUnique({ where: { id: Number(id) } });
        res.json(updatedText);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el texto" });
    }
});

/**
 * @swagger
 * /api/texts/{id}:
 *   delete:
 *     summary: Eliminar un texto por ID (solo si es del usuario)
 *     tags: [Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Texto eliminado con éxito
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
textsRouter.delete('/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deleted = await prisma.text.deleteMany({
            where: { id: Number(id), userId },
        });

        if (deleted.count === 0) {
            return res.status(403).json({ message: 'No autorizado o texto inexistente' });
        }

        res.json({ message: 'Texto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el texto" });
    }
});

export default textsRouter;
