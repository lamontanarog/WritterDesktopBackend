import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index';
import {PrismaClient} from '@prisma/client';
import errorHandler from './middleware/errorHandler';
import { setupSwagger } from './swagger';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin:'*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(helmet());

export const prisma = new PrismaClient();

app.use('/api', routes);
app.use(errorHandler);
setupSwagger(app);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    console.log(`Documentacion de la Api: http://localhost:${PORT}/api-docs`);
});

export default app;