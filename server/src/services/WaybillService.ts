import { query } from '../config/db';
import { TrackingService } from './TrackingService';

export interface Waybill {
  id: number;
  user_id: string;
  awb: string;
  courier: string;
  phone_number: string | null;
  polling_enabled: boolean;
  polling_interval_hours: number;
  last_checked_at: Date | null;
  last_status: string | null;
  status_detail: string | null;
  has_update: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TrackingHistory {
  id: number;
  waybill_id: number;
  status: string | null;
  location: string | null;
  description: string | null;
  event_date: Date | null;
  checked_at: Date;
}

export interface CreateWaybillInput {
  awb: string;
  courier: string;
  phoneNumber?: string;
  pollingEnabled?: boolean;
  pollingIntervalHours?: number;
}

export interface ImportWaybillInput {
  awb: string;
  courier: string;
  phoneNumber?: string;
}

export const WaybillService = {
  async findAllByUser(userId: string, pollingOnly = false): Promise<Waybill[]> {
    let sql = 'SELECT * FROM waybills WHERE user_id = ?';
    const params: unknown[] = [userId];

    if (pollingOnly) {
      sql += ' AND polling_enabled = TRUE';
    }
    sql += ' ORDER BY created_at DESC';

    return query<Waybill[]>(sql, params);
  },

  async findById(id: number, userId: string): Promise<Waybill | null> {
    const waybills = await query<Waybill[]>(
      'SELECT * FROM waybills WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return waybills[0] || null;
  },

  async create(userId: string, input: CreateWaybillInput): Promise<Waybill> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO waybills (user_id, awb, courier, phone_number, polling_enabled, polling_interval_hours)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        input.awb,
        input.courier,
        input.phoneNumber || null,
        input.pollingEnabled || false,
        input.pollingIntervalHours || 6,
      ]
    );
    return this.findById(result.insertId, userId) as Promise<Waybill>;
  },

  async update(id: number, userId: string, input: Partial<CreateWaybillInput>): Promise<Waybill | null> {
    const waybill = await this.findById(id, userId);
    if (!waybill) return null;

    await query(
      `UPDATE waybills SET 
        awb = ?, courier = ?, phone_number = ?, polling_enabled = ?, polling_interval_hours = ?
       WHERE id = ? AND user_id = ?`,
      [
        input.awb ?? waybill.awb,
        input.courier ?? waybill.courier,
        input.phoneNumber ?? waybill.phone_number,
        input.pollingEnabled ?? waybill.polling_enabled,
        input.pollingIntervalHours ?? waybill.polling_interval_hours,
        id,
        userId,
      ]
    );
    return this.findById(id, userId);
  },

  async delete(id: number, userId: string): Promise<boolean> {
    const result = await query<{ affectedRows: number }>(
      'DELETE FROM waybills WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  async togglePolling(id: number, userId: string): Promise<Waybill | null> {
    const waybill = await this.findById(id, userId);
    if (!waybill) return null;

    await query(
      'UPDATE waybills SET polling_enabled = ? WHERE id = ? AND user_id = ?',
      [!waybill.polling_enabled, id, userId]
    );
    return this.findById(id, userId);
  },

  async markAsRead(userId: string, waybillIds?: number[]): Promise<void> {
    if (waybillIds && waybillIds.length > 0) {
      const placeholders = waybillIds.map(() => '?').join(',');
      await query(
        `UPDATE waybills SET has_update = FALSE WHERE id IN (${placeholders}) AND user_id = ?`,
        [...waybillIds, userId]
      );
    } else {
      await query(
        'UPDATE waybills SET has_update = FALSE WHERE user_id = ?',
        [userId]
      );
    }
  },

  async checkWaybill(id: number, userId: string): Promise<{ waybill: Waybill; tracking: unknown } | null> {
    const waybill = await this.findById(id, userId);
    if (!waybill) return null;

    const trackingResult = await TrackingService.track(waybill.courier, waybill.awb, waybill.phone_number || undefined);
    const tracking = trackingResult.data;

    const currentStatus = tracking?.data?.summary?.status || null;
    const statusDetail = tracking ? JSON.stringify(tracking.data) : null;
    const hasUpdate = waybill.last_status !== currentStatus;

    await query(
      `UPDATE waybills SET 
        last_checked_at = NOW(), 
        last_status = ?, 
        status_detail = ?,
        has_update = ?
       WHERE id = ?`,
      [currentStatus, statusDetail, hasUpdate, id]
    );

    if (hasUpdate && tracking?.data?.history && tracking.data.history.length > 0) {
      const historyEntry = tracking.data.history[0];
      if (historyEntry) {
        await query(
          `INSERT INTO tracking_history (waybill_id, status, location, description, event_date)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            currentStatus,
            historyEntry.location || null,
            historyEntry.desc || null,
            historyEntry.date ? new Date(historyEntry.date) : null,
          ]
        );
      }
    }

    const updatedWaybill = await this.findById(id, userId);
    return { waybill: updatedWaybill!, tracking };
  },

  async getHistory(waybillId: number, userId: string): Promise<TrackingHistory[]> {
    const waybill = await this.findById(waybillId, userId);
    if (!waybill) return [];

    return query<TrackingHistory[]>(
      'SELECT * FROM tracking_history WHERE waybill_id = ? ORDER BY event_date DESC',
      [waybillId]
    );
  },

  async importFromLocalStorage(userId: string, waybills: ImportWaybillInput[]): Promise<number> {
    let imported = 0;
    for (const wb of waybills) {
      try {
        await query(
          `INSERT IGNORE INTO waybills (user_id, awb, courier, phone_number, polling_enabled)
           VALUES (?, ?, ?, ?, FALSE)`,
          [userId, wb.awb, wb.courier, wb.phoneNumber || null]
        );
        imported++;
      } catch {
        // Skip duplicates
      }
    }
    return imported;
  },

  async getPollingEnabled(): Promise<Waybill[]> {
    return query<Waybill[]>(
      `SELECT w.* FROM waybills w 
       WHERE w.polling_enabled = TRUE 
       AND NOT EXISTS (
         SELECT 1 FROM tracking_history th 
         WHERE th.waybill_id = w.id 
         AND th.status = 'DELIVERED'
       )`
    );
  },

  async processPolling(waybill: Waybill): Promise<void> {
    try {
      const trackingResult = await TrackingService.track(waybill.courier, waybill.awb, waybill.phone_number || undefined);
      const tracking = trackingResult.data;

      const currentStatus = tracking?.data?.summary?.status || null;
      const statusDetail = tracking ? JSON.stringify(tracking.data) : null;
      const hasUpdate = waybill.last_status !== currentStatus;

      await query(
        `UPDATE waybills SET 
          last_checked_at = NOW(), 
          last_status = ?, 
          status_detail = ?,
          has_update = ?
         WHERE id = ?`,
        [currentStatus, statusDetail, hasUpdate, waybill.id]
      );

      if (hasUpdate && tracking?.data?.history && tracking.data.history.length > 0) {
        const historyEntry = tracking.data.history[0];
        if (historyEntry) {
          await query(
            `INSERT INTO tracking_history (waybill_id, status, location, description, event_date)
             VALUES (?, ?, ?, ?, ?)`,
            [
              waybill.id,
              currentStatus,
              historyEntry.location || null,
              historyEntry.desc || null,
              historyEntry.date ? new Date(historyEntry.date) : null,
            ]
          );
        }
      }
    } catch (error) {
      console.error(`Polling error for waybill ${waybill.id}:`, error);
    }
  },
};
