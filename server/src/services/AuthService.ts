import admin from 'firebase-admin';
import { config } from '../config';
import { query } from '../config/db';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      privateKey: config.firebase.privateKey,
      clientEmail: config.firebase.clientEmail,
    }),
  });
}

export interface UserRecord {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export async function verifyToken(idToken: string): Promise<UserRecord> {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  return {
    uid: decodedToken.uid,
    email: decodedToken.email || null,
    displayName: decodedToken.name || null,
    photoURL: decodedToken.picture || null,
  };
}

export async function findOrCreateUser(firebaseUser: UserRecord): Promise<{ id: string; hasWaybills: boolean }> {
  const existingUser = await query<Array<{ id: string }>>(
    'SELECT id FROM users WHERE id = ?',
    [firebaseUser.uid]
  );

  if (existingUser.length > 0) {
    const waybills = await query<Array<{ id: number }>>(
      'SELECT id FROM waybills WHERE user_id = ? LIMIT 1',
      [firebaseUser.uid]
    );
    return {
      id: firebaseUser.uid,
      hasWaybills: waybills.length > 0,
    };
  }

  await query(
    'INSERT INTO users (id, email, display_name, photo_url) VALUES (?, ?, ?, ?)',
    [firebaseUser.uid, firebaseUser.email, firebaseUser.displayName, firebaseUser.photoURL]
  );

  return {
    id: firebaseUser.uid,
    hasWaybills: false,
  };
}

export async function getCurrentUser(userId: string) {
  const users = await query<Array<{
    id: string;
    email: string | null;
    display_name: string | null;
    photo_url: string | null;
    created_at: Date;
  }>>(
    'SELECT id, email, display_name, photo_url, created_at FROM users WHERE id = ?',
    [userId]
  );

  return users[0] || null;
}
