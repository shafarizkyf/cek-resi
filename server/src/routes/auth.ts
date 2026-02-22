import { Router, Request, Response } from 'express';
import { verifyToken, findOrCreateUser, getCurrentUser } from '../services/AuthService';

const router = Router();

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ status: 400, message: 'Missing idToken' });
      return;
    }

    const firebaseUser = await verifyToken(idToken);
    const user = await findOrCreateUser(firebaseUser);

    res.json({
      status: 200,
      data: {
        uid: user.id,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        hasWaybills: user.hasWaybills,
      },
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    res.status(401).json({ status: 401, message: 'Invalid token' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 401, message: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.substring(7);
    const firebaseUser = await verifyToken(idToken);
    const user = await getCurrentUser(firebaseUser.uid);

    if (!user) {
      res.status(404).json({ status: 404, message: 'User not found' });
      return;
    }

    res.json({
      status: 200,
      data: user,
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(401).json({ status: 401, message: 'Invalid token' });
  }
});

export default router;
