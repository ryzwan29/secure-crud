export type UserRole = "admin" | "user";

export interface SafeUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  locked_until: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: string;
  stock: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
}
