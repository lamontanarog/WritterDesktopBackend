import {z} from 'zod';

export const ideaSchema = z.object({
    title: z.string().min(2, "title must be at least 2 characters"),
    content: z.string().min(2, "content must be at least 2 characters")
})