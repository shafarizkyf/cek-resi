import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { config } from './config';
import couriersRouter from './routes/couriers';
import trackingRouter from './routes/tracking';
import authRouter from './routes/auth';
import waybillsRouter from './routes/waybills';
import emailRouter from './routes/email';
import { WaybillService } from './services/WaybillService';

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
app.use('/api/auth', authRouter);
app.use('/api/waybills', waybillsRouter);
app.use('/api/email', emailRouter);

cron.schedule('0 * * * *', async () => {
  console.log('Running background polling...');
  try {
    const waybills = await WaybillService.getPollingEnabled();
    console.log(`Found ${waybills.length} waybills with polling enabled`);

    for (const waybill of waybills) {
      await WaybillService.processPolling(waybill);
    }
  } catch (error) {
    console.error('Polling error:', error);
  }
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
