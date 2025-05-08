import { Router } from "express";
import { prisma } from "../index";
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
 *       404:
 *         description: No hay ideas disponibles
 *       500:
 *         description: Error interno del servidor
 */
ideasRouter.get('/random', authMiddleware, async (req:any, res:any) => {
  try {
    const count = await prisma.idea.count();
    if (count === 0) return res.status(404).json({ message: "No hay ideas disponibles" });

    const skip = Math.floor(Math.random() * count);
    const idea = await prisma.idea.findFirst({ skip });

    res.json(idea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener idea aleatoria" });
  }
});

/**
 * @swagger
 * /api/ideas:
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de ideas obtenida
 *       500:
 *         description: Error interno del servidor
 */
ideasRouter.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (search) {
      where.content = {
        contains: String(search),
        mode: 'insensitive',
      };
    }

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({ where, skip, take, orderBy: { id: 'asc' } }),
      prisma.idea.count({ where }),
    ]);

    res.json({
      data: ideas,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener ideas" });
  }
});

/**
 * @swagger
 * /api/ideas:
 *   post:
 *     summary: Crear una nueva idea
 *     tags: [Ideas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Idea'
 *     responses:
 *       201:
 *         description: Idea creada con éxito
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
ideasRouter.post('/', adminMiddleware, validateSchema(ideaSchema), async (req, res) => {
  try {
    const { title, content } = req.body;
    const idea = await prisma.idea.create({ data: { title, content } });
    res.status(201).json(idea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la idea" });
  }
});

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
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Idea eliminada correctamente
 *       400:
 *         description: No se puede eliminar (dependencias)
 *       404:
 *         description: Idea no encontrada
 *       500:
 *         description: Error interno del servidor
 */
ideasRouter.delete('/:id', adminMiddleware, async (req:any, res:any) => {
  const { id } = req.params;
  try {
    await prisma.idea.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Idea eliminada correctamente" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Idea no encontrada" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({
        message: "No se puede eliminar la idea porque hay textos asociados.",
      });
    }
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la idea" });
  }
});

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
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Idea encontrada
 *       404:
 *         description: Idea no encontrada
 */
ideasRouter.get('/:id', authMiddleware, async (req:any, res:any) => {
  const { id } = req.params;
  try {
    const idea = await prisma.idea.findUnique({ where: { id: parseInt(id) } });
    if (!idea) return res.status(404).json({ message: "Idea no encontrada" });
    res.json(idea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la idea" });
  }
});

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
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Idea'
 *     responses:
 *       200:
 *         description: Idea actualizada
 *       404:
 *         description: Idea no encontrada
 *       500:
 *         description: Error interno del servidor
 */
ideasRouter.put('/:id', adminMiddleware, validateSchema(ideaSchema), async (req:any, res:any) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const updated = await prisma.idea.update({
      where: { id: parseInt(id) },
      data: { title, content },
    });
    res.json(updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Idea no encontrada" });
    }
    console.error(error);
    res.status(500).json({ message: "Error al editar la idea" });
  }
});

export default ideasRouter;
