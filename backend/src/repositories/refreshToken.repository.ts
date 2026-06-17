import { pool } from "../config/database";

export const refreshTokenRepository = {
  async store(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  },

  async findActive(tokenHash: string): Promise<{ id: number; user_id: number } | null> {
    const { rows } = await pool.query<{ id: number; user_id: number }>(
      `SELECT id, user_id FROM refresh_tokens
       WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
       LIMIT 1`,
      [tokenHash]
    );
    return rows[0] ?? null;
  },

  async revoke(tokenHash: string): Promise<void> {
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`,
      [tokenHash]
    );
  },

  async revokeAllForUser(userId: number): Promise<void> {
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  },
};
