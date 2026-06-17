import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(150),
    description: z.string().trim().max(2000).optional().nullable(),
    category: z.string().trim().max(80).optional().nullable(),
    price: z.coerce.number().nonnegative("Harga tidak boleh negatif"),
    stock: z.coerce.number().int().nonnegative("Stok tidak boleh negatif").default(0),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const listQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().trim().max(150).optional(),
    category: z.string().trim().max(80).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
