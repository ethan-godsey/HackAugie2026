import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { checkRouter }  from './routes/check.js';
import { appealRouter } from './routes/appeal.js';
import { trackerRouter } from './routes/tracker.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/check',   checkRouter);
app.use('/api/appeal',  appealRouter);
app.use('/api/tracker', trackerRouter);
app.get('/health', (_, res) => res.json({ ok: true }));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server :${PORT}`));
