import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { productRepository } from "../repositories/product.repository";
import { auditLogRepository } from "../repositories/auditLog.repository";
import { CreateProductInput, UpdateProductInput } from "../validators/product.validator";
import { JwtPayload } from "../types";

interface RequestContext {
  ip?: string | null;
  userAgent?: string | null;
}

export const productService = {
  async list(params: { page: number; limit: number; search?: string; category?: string }) {
    return productRepository.list(params);
  },

  async getById(id: number) {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound("Produk tidak ditemukan");
    return product;
  },

  async create(input: CreateProductInput, actor: JwtPayload, ctx: RequestContext) {
    const product = await productRepository.create(input, actor.sub);
    auditLogRepository
      .record({ userId: actor.sub, action: "CREATE", tableName: "products", recordId: product.id, ipAddress: ctx.ip, userAgent: ctx.userAgent })
      .catch((e) => logger.error("audit log failed", { e: String(e) }));
    return product;
  },

  async update(id: number, input: UpdateProductInput, actor: JwtPayload, ctx: RequestContext) {
    const existing = await productRepository.findById(id);
    if (!existing) throw ApiError.notFound("Produk tidak ditemukan");

    // Authorization rule: admin can edit anything, regular users only their own records.
    if (actor.role !== "admin" && existing.created_by !== actor.sub) {
      throw ApiError.forbidden("Kamu hanya bisa mengubah produk milikmu sendiri");
    }

    const updated = await productRepository.update(id, input);
    auditLogRepository
      .record({ userId: actor.sub, action: "UPDATE", tableName: "products", recordId: id, details: input, ipAddress: ctx.ip, userAgent: ctx.userAgent })
      .catch((e) => logger.error("audit log failed", { e: String(e) }));
    return updated;
  },

  async remove(id: number, actor: JwtPayload, ctx: RequestContext) {
    const existing = await productRepository.findById(id);
    if (!existing) throw ApiError.notFound("Produk tidak ditemukan");

    if (actor.role !== "admin" && existing.created_by !== actor.sub) {
      throw ApiError.forbidden("Kamu hanya bisa menghapus produk milikmu sendiri");
    }

    await productRepository.remove(id);
    auditLogRepository
      .record({ userId: actor.sub, action: "DELETE", tableName: "products", recordId: id, ipAddress: ctx.ip, userAgent: ctx.userAgent })
      .catch((e) => logger.error("audit log failed", { e: String(e) }));
  },
};
