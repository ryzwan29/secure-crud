import bcrypt from "bcryptjs";
import { env } from "../config/env";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Enforced server-side regardless of what the client validates,
 * since client-side checks can always be bypassed.
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,72}$/;

export const PASSWORD_RULE_HINT =
  "Minimal 8 karakter, harus ada huruf besar, huruf kecil, angka, dan simbol.";
