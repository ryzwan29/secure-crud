import { pool } from "../config/database";
import { AuditLogEntry } from "../types";

export const auditLogRepository = {
  async record(entry: AuditLogEntry): Promise<void> {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.userId,
        entry.action,
        entry.tableName ?? null,
        entry.recordId ?? null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ipAddress ?? null,
        entry.userAgent ?? null,
      ]
    );
  },

  async listRecent(limit = 100): Promise<unknown[]> {
    const { rows } = await pool.query(
      `SELECT al.*, u.username
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },
};
