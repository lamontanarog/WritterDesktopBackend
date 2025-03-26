import { Router } from "express";
import prisma from "../index";
import authMiddleware from "../middleware/authMiddleware";
import { textSchema } from "../validators/textValidator";
import { validateSchema } from "../middleware/validateSchema";

const textsRouter = Router();

textsRouter.get('/', async (req: any, res: any) => {
    try {
        const { page = 1, limit = 10, ideaId, startDate, endDate } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = {};
        if (ideaId) where.ideaId = Number(ideaId);
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
            };
        }

        const texts = await prisma.text.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.text.count({ where });

        res.json({
            data: texts,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener textos' });
    }
});

textsRouter.get('/:id', authMiddleware, async (req: any, res: any) => {
    const { id } = req.params;
    const text = await prisma.text.findUnique({ where: { id: parseInt(id) } });
    if (!text || text.userId !== req.user.id) return (res.status(400).json({ message: 'text not found' }));
    res.json(text);
})

textsRouter.post('/', authMiddleware, validateSchema(textSchema), async (req: any, res: any) => {
    const { ideaId, content, time } = req.body;
    const newText = await prisma.text.create({ data: { userId: req.user.id, ideaId, content, time } });
    res.json(newText);
})

textsRouter.put('/:id', authMiddleware, validateSchema(textSchema), async (req: any, res: any) => {
    const { id } = req.params;
    const { content, time } = req.body;
    const text = await prisma.text.findUnique({ where: { id: parseInt(id) } });
    if (!text || text.userId !== req.user.id) return (res.status(400).json({ message: 'text not found' }));

    const updatedText = await prisma.text.update({ where: { id: parseInt(id) }, data: { content, time } });
    res.json(updatedText);
})

textsRouter.delete('/:id', authMiddleware, async (req: any, res: any) => {
    const { id } = req.params;

    const text = await prisma.text.findUnique({ where: { id: parseInt(id) } });
    if (!text || text.userId !== req.user.id) return (res.status(400).json({ message: 'your not authorized to delete this text' }));
    await prisma.text.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'text deleted' });
}
);

export default textsRouter;