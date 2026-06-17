import { z } from "zod";
import { PASSWORD_REGEX, PASSWORD_RULE_HINT } from "../utils/password";

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, "Username minimal 3 karakter")
      .max(30, "Username maksimal 30 karakter")
      .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, underscore"),
    email: z.string().trim().email("Email tidak valid").max(255),
    password: z.string().regex(PASSWORD_REGEX, PASSWORD_RULE_HINT),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Email tidak valid"),
    password: z.string().min(1, "Password wajib diisi"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
