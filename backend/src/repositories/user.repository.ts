import { pool } from "../config/database";
import { User } from "../types";

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    return rows[0] ?? null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      "SELECT * FROM users WHERE username = $1 LIMIT 1",
      [username]
    );
    return rows[0] ?? null;
  },

  async findById(id: number): Promise<User | null> {
    const { rows } = await pool.query<User>(
      "SELECT * FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    return rows[0] ?? null;
  },

  async create(input: { username: string; email: string; passwordHash: string }): Promise<User> {
    const { rows } = await pool.query<User>(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.username, input.email, input.passwordHash]
    );
    return rows[0];
  },

  async listAll(): Promise<User[]> {
    const { rows } = await pool.query<User>(
      `SELECT * FROM users ORDER BY created_at DESC`
    );
    return rows;
  },

  async updateRole(id: number, role: "admin" | "user"): Promise<User | null> {
    const { rows } = await pool.query<User>(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING *`,
      [role, id]
    );
    return rows[0] ?? null;
  },

  async setActive(id: number, isActive: boolean): Promise<User | null> {
    const { rows } = await pool.query<User>(
      `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *`,
      [isActive, id]
    );
    return rows[0] ?? null;
  },

  async recordSuccessfulLogin(id: number): Promise<void> {
    await pool.query(
      `UPDATE users
       SET failed_login_attempts = 0, locked_until = NULL, last_login_at = now()
       WHERE id = $1`,
      [id]
    );
  },

  async recordFailedLogin(id: number, attempts: number, lockedUntil: Date | null): Promise<void> {
    await pool.query(
      `UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3`,
      [attempts, lockedUntil, id]
    );
  },
};
