import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import couriersRouter from './routes/couriers';
import trackingRouter from './routes/tracking';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/couriers', couriersRouter);
app.use('/api/track', trackingRouter);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
