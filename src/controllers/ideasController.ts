import { Router } from "express";
import prisma from "../index";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import { ideaSchema } from "../validators/ideaValidator";
import { validateSchema } from "../middleware/validateSchema";

const ideasRouter = Router();

// ideasRouter.get('/random', async (req: any, res: any) => {
//     const count = await prisma.idea.count();
//     const skip = Math.floor(Math.random() * count);
//     const idea = await prisma.idea.findMany({ take: 1, skip });
//     res.json(idea);
// })

ideasRouter.get('/random', authMiddleware, async (req: any, res: any) => {
    const idea = await prisma.idea.findFirst({
        orderBy: { id: 'asc' },
        skip: Math.floor(Math.random() * 10)
    });
    res.json(idea);
})

ideasRouter.get('/', authMiddleware, async (req: any, res: any) => {
    const ideas = await prisma.idea.findMany();
    res.json(ideas);
})

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

export default ideasRouter;