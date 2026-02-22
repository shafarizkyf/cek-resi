import { Router, Request, Response } from 'express';
import { EmailService } from '../services/EmailService';
import { WaybillService } from '../services/WaybillService';
import { TrackingService } from '../services/TrackingService';

const router = Router();

router.post('/test', async (req: Request, res: Response) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      res.status(400).json({ status: 400, message: 'Missing to, subject, or html' });
      return;
    }

    await EmailService.send({ to, subject, html });

    res.json({
      status: 200,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

router.post('/test-waybill/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ status: 400, message: 'Invalid waybill ID' });
      return;
    }

    const waybill = await WaybillService.findByIdForEmail(id);
    if (!waybill) {
      res.status(404).json({ status: 404, message: 'Waybill not found' });
      return;
    }

    const userEmail = await WaybillService.getUserEmail(waybill.user_id);
    if (!userEmail) {
      res.status(400).json({ status: 400, message: 'User email not found' });
      return;
    }

    const trackingResult = await TrackingService.track(waybill.courier, waybill.awb, waybill.phone_number || undefined);
    const tracking = trackingResult.data as {
      data?: {
        summary?: { status?: string };
        history?: Array<{ date: string; location: string; desc: string }>;
      };
    };

    if (!tracking?.data?.history || tracking.data.history.length === 0) {
      res.status(400).json({ status: 400, message: 'No tracking history found' });
      return;
    }

    const history = tracking.data.history.map(h => ({
      date: h.date,
      location: h.location,
      description: h.desc,
    }));

    await EmailService.sendTrackingUpdate({
      to: userEmail,
      awb: waybill.awb,
      courier: waybill.courier,
      latestStatus: tracking.data.summary?.status || 'Unknown',
      history,
    });

    res.json({
      status: 200,
      message: 'Email sent successfully',
      data: {
        to: userEmail,
        awb: waybill.awb,
        courier: waybill.courier,
      },
    });
  } catch (error) {
    console.error('Test waybill email error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

export default router;
