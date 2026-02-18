import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import couriersRouter from './routes/couriers';
import trackingRouter from './routes/tracking';

const app = express();

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { status: 429, message: 'Too many requests, please try again later.' },
});

app.use(limiter);
app.use(cors());
app.use(express.json());

app.use('/api/couriers', couriersRouter);
app.use('/api/track', trackingRouter);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
