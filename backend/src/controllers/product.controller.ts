import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { productService } from "../services/product.service";

function getContext(req: Request) {
  return { ip: req.ip, userAgent: req.headers["user-agent"] ?? null };
}

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, category } = req.query as unknown as {
      page: number;
      limit: number;
      search?: string;
      category?: string;
    };
    const result = await productService.list({ page, limit, search, category });
    res.status(200).json({ success: true, data: result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const product = await productService.getById(id);
    res.status(200).json({ success: true, data: product });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body, req.user!, getContext(req));
    res.status(201).json({ success: true, data: product });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const product = await productService.update(id, req.body, req.user!, getContext(req));
    res.status(200).json({ success: true, data: product });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await productService.remove(id, req.user!, getContext(req));
    res.status(204).send();
  }),
};
