import express from 'express';
import { NODE_ENV, PORT } from './config/constants';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json('freeCodeCamp TOC Generator API is running...');
});

app.listen(PORT, () => {
    console.info(`Server environment is ${NODE_ENV}`);
    console.info(`Server is running on http://localhost:${PORT}`);
});

export default app;
