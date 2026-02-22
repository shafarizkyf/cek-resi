import mysql from 'mysql2/promise';
import { config } from './index';

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T>(sql: string, params?: unknown[]): Promise<T> {
  const [rows] = await pool.execute(sql, params as (string | number | null)[]);
  return rows as T;
}
