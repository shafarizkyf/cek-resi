import { Router } from 'express';
import { CourierService } from '../services/CourierService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const couriers = await CourierService.getCouriers();
    res.json(couriers);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
