import express from 'express';
import { NODE_ENV, PORT } from './config/constants';
import extractorRouter from './routes/extractor.route';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json('freeCodeCamp TOC Generator API is running...');
});

app.use('/api/v1/extract-toc', extractorRouter)

app.listen(PORT, () => {
    console.info(`Server environment is ${NODE_ENV}`);
    console.info(`Server is running on http://localhost:${PORT}`);
});

export default app;
