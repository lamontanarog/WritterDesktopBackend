import { z } from "zod";

export const textSchema = z.object({
    ideaId: z.number().positive("ideaId must be a positive number"),
    content: z.string().min(10, "content must be at least 10 characters"),
    time: z.number().positive("time must be declared")
})