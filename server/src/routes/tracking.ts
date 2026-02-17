import { Router } from 'express';
import { TrackingService } from '../services/TrackingService';

const router = Router();

router.get('/', async (req, res) => {
  const { courier, awb, number } = req.query;

  if (!courier || !awb) {
    res.status(400).json({ status: 400, message: 'Missing courier or awb parameter' });
    return;
  }

  const result = await TrackingService.track(courier as string, awb as string, number as string | undefined);

  if (result.error) {
    res.status(result.error.status as number).json({
      status: result.error.status,
      message: result.error.message,
      data: null,
    });
    return;
  }

  res.json(result.data);
});

export default router;
