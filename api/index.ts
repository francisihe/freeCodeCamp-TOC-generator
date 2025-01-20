import express from 'express';
import cors from 'cors';
import { NODE_ENV, PORT } from './config/constants';
import extractorRouter from './routes/extractor.route';
import browserStatusRouter from './routes/browserManager.route';

const app = express();
app.use(express.json());

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));

// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST'],
// }));

app.get('/', (req, res) => {
    res.json('freeCodeCamp TOC Generator API is running...');
});

app.use('/api/v1/extract-toc', extractorRouter)
app.use('/api/v1/status', browserStatusRouter)

app.listen(PORT, () => {
    console.info(`Server environment is ${NODE_ENV}`);
    console.info(`Server is running on http://localhost:${PORT}`);
});

export default app;
