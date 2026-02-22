import { Router, Request, Response } from 'express';
import { EmailService } from '../services/EmailService';

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

export default router;
