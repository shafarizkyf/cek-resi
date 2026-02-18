import { Router, Request, Response } from 'express';
import { WaybillService } from '../services/WaybillService';
import { verifyToken } from '../services/AuthService';

const router = Router();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

async function authenticate(req: AuthenticatedRequest, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 401, message: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.substring(7);
    const firebaseUser = await verifyToken(idToken);
    req.userId = firebaseUser.uid;
    next();
  } catch (error) {
    res.status(401).json({ status: 401, message: 'Invalid token' });
  }
}

router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pollingOnly = req.query.polling === 'true';
    const waybills = await WaybillService.findAllByUser(req.userId!, pollingOnly);

    res.json({
      status: 200,
      data: waybills,
    });
  } catch (error) {
    console.error('Get waybills error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ status: 400, message: 'Invalid waybill ID' });
      return;
    }

    const waybill = await WaybillService.findById(id, req.userId!);
    if (!waybill) {
      res.status(404).json({ status: 404, message: 'Waybill not found' });
      return;
    }

    res.json({
      status: 200,
      data: waybill,
    });
  } catch (error) {
    console.error('Get waybill error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { awb, courier, phoneNumber, pollingEnabled, pollingIntervalHours } = req.body;

    if (!awb || !courier) {
      res.status(400).json({ status: 400, message: 'Missing awb or courier' });
      return;
    }

    const waybill = await WaybillService.create(req.userId!, {
      awb,
      courier,
      phoneNumber,
      pollingEnabled,
      pollingIntervalHours,
    });

    res.status(201).json({
      status: 201,
      data: waybill,
    });
  } catch (error: unknown) {
    console.error('Create waybill error:', error);
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      res.status(409).json({ status: 409, message: 'Waybill already exists' });
      return;
    }
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ status: 400, message: 'Invalid waybill ID' });
      return;
    }

    const { awb, courier, phoneNumber, pollingEnabled, pollingIntervalHours } = req.body;

    const waybill = await WaybillService.update(id, req.userId!, {
      awb,
      courier,
      phoneNumber,
      pollingEnabled,
      pollingIntervalHours,
    });

    if (!waybill) {
      res.status(404).json({ status: 404, message: 'Waybill not found' });
      return;
    }

    res.json({
      status: 200,
      data: waybill,
    });
  } catch (error) {
    console.error('Update waybill error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ status: 400, message: 'Invalid waybill ID' });
      return;
    }

    const deleted = await WaybillService.delete(id, req.userId!);
    if (!deleted) {
      res.status(404).json({ status: 404, message: 'Waybill not found' });
      return;
    }

    res.json({
      status: 200,
      message: 'Waybill deleted',
    });
  } catch (error) {
    console.error('Delete waybill error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

router.post('/:id/toggle-polling', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ status: 400, message: 'Invalid waybill ID' });
      return;
    }

    const waybill = await WaybillService.togglePolling(id, req.userId!);
    if (!waybill) {
      res.status(404).json({ status: 404, message: 'Waybill not found' });
      return;
    }

    res.json({
      status: 200,
      data: waybill,
    });
  } catch (error) {
    console.error('Toggle polling error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

router.post('/:id/check', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ status: 400, message: 'Invalid waybill ID' });
      return;
    }

    const result = await WaybillService.checkWaybill(id, req.userId!);
    if (!result) {
      res.status(404).json({ status: 404, message: 'Waybill not found' });
      return;
    }

    res.json({
      status: 200,
      data: result.tracking,
    });
  } catch (error) {
    console.error('Check waybill error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

router.get('/:id/history', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ status: 400, message: 'Invalid waybill ID' });
      return;
    }

    const history = await WaybillService.getHistory(id, req.userId!);

    res.json({
      status: 200,
      data: history,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

router.post('/mark-read', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { waybillIds } = req.body;
    await WaybillService.markAsRead(req.userId!, waybillIds);

    res.json({
      status: 200,
      message: 'Marked as read',
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

router.post('/import', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { waybills } = req.body;

    if (!Array.isArray(waybills) || waybills.length === 0) {
      res.status(400).json({ status: 400, message: 'No waybills to import' });
      return;
    }

    const imported = await WaybillService.importFromLocalStorage(req.userId!, waybills);

    res.json({
      status: 200,
      data: { imported },
    });
  } catch (error) {
    console.error('Import waybills error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

export default router;
