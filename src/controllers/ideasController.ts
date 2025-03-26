import { Router } from "express";
import prisma from "../index";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import { ideaSchema } from "../validators/ideaValidator";
import { validateSchema } from "../middleware/validateSchema";

const ideasRouter = Router();

ideasRouter.get('/random', authMiddleware, async (req: any, res: any) => {
    const idea = await prisma.idea.findFirst({
        orderBy: { id: 'asc' },
        skip: Math.floor(Math.random() * 10)
    });
    res.json(idea);
})

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

ideasRouter.post('/', adminMiddleware, validateSchema(ideaSchema), async (req: any, res: any) => {
    const { title, content } = req.body;
    const idea = await prisma.idea.create({ data: { title, content } });
    res.json(idea);
})

ideasRouter.delete('/:id', adminMiddleware,validateSchema(ideaSchema), async (req: any, res: any) => {
    const { id } = req.params;
    await prisma.idea.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'idea deleted' });
})

ideasRouter.get('/:id', authMiddleware, async (req: any, res: any) => {
    const { id } = req.params;
    const idea = await prisma.idea.findUnique({ where: { id: parseInt(id) } });
    if (!idea) return (res.status(400).json({ message: 'idea not found' }));
    res.json(idea);
})

ideasRouter.put('/:id', adminMiddleware,validateSchema(ideaSchema), async (req: any, res: any) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const idea = await prisma.idea.update({ where: { id: parseInt(id) }, data: { title, content } });
    res.json(idea);
})

export default ideasRouter;