import { Router } from "express";
import prisma from "../index";
import authMiddleware from "../middleware/authMiddleware";
import { textSchema } from "../validators/textValidator";
import { validateSchema } from "../middleware/validateSchema";

const textsRouter = Router();

textsRouter.get('/', authMiddleware, async (req: any, res: any) => {
    try {

        const { page = 1, limit = 10, ideaId, startDate, endDate } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = { userId: Number(req.user.id) };
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
        res.status(500).json({ onmessage: "Error al obtener textos", error: console.error(error) });
    }
});

textsRouter.get('/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const text = await prisma.text.findUnique({ where: { id: Number(id) } });
        if (!text || text.userId !== userId) {
            return (res.status(400).json({ message: 'your not authorized to see this text' }))
        }
        const seeText = await prisma.text.findUnique({ where: { id: Number(id) }, include: { idea: true } });
        res.json(seeText);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener el texto" });
    }
})

textsRouter.post('/', authMiddleware, validateSchema(textSchema), async (req: any, res: any) => {
    try {
        const { content, time, ideaId } = req.body;
        const userId = req.user.id;
        console.log(userId)

        const newText = await prisma.text.create({
            data: { content, time, ideaId, userId },
        });

        res.status(201).json(newText);
    } catch (error) {
        res.status(500).json({ onmessage: "Error al obtener textos", error: console.error(error) });
    }
});

textsRouter.put('/:id', authMiddleware, validateSchema(textSchema), async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { content, time, ideaId } = req.body;
        const userId = req.user.id;

        const existingText = await prisma.text.findUnique({ where: { id: Number(id) } });
        if (!existingText || existingText.userId !== userId) {
            return (res.status(403).json({ message: 'your not authorized to update this text' }))
        }

        const updatedText = await prisma.text.update({ where: { id: Number(id) }, data: { content, time, ideaId } });
        res.json(updatedText);
    }
    catch (error) {
        res.status(500).json({ message: "Error al actualizar el texto" });
    }
})

textsRouter.delete('/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const existingText = await prisma.text.findUnique({ where: { id: Number(id) } });
        if (!existingText || existingText.userId !== userId) {
            return (res.status(403).json({ message: 'your not authorized to delete this text' }))
        }

        await prisma.text.delete({ where: { id: Number(id) } });
        res.json({ message: 'text deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: "Error al eliminar el texto" });
    }
}
);

export default textsRouter;