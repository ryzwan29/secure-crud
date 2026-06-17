export type UserRole = "admin" | "user";

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until: Date | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** User shape that is safe to ever send to the client (no password_hash). */
export type SafeUser = Omit<User, "password_hash" | "failed_login_attempts">;

export interface Product {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: string; // numeric comes back as string from pg
  stock: number;
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  sub: number; // user id
  role: UserRole;
}

export interface AuditLogEntry {
  userId: number | null;
  action: string;
  tableName?: string;
  recordId?: number;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
