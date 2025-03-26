import {z} from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, "name must be at least 2 characters"),
    email: z.string().email("email is not valid"),
    password: z.string().min(6, "password must be at least 6 characters")
})


export const loginSchema = z.object({
    email: z.string().email("email is not valid"),
    password: z.string().min(6, "password must be at least 6 characters")
})