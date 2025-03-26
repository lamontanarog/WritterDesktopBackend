import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index';
import {PrismaClient} from '@prisma/client';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

const prisma = new PrismaClient();

app.use('/api', routes);
app.use(errorHandler);

// app.get('/', (req, res) => {
//     res.send('the api is running');
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});

export default prisma;