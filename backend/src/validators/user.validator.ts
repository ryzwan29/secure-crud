import { z } from "zod";

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(["admin", "user"]),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const setUserActiveSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
