import express from 'express';
import { NODE_ENV, PORT } from './config/constants';
import extractorRouter from './routes/extractor.route';
import browserStatusRouter from './routes/browserManager.route';
import healthRouter from './routes/health.route';

import { corsMiddleware, corsErrorHandler } from './middleware/corsErrorHandler';

const app = express();
app.use(express.json());

app.use('/health', healthRouter);

app.use(corsMiddleware);
app.use(corsErrorHandler);

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
