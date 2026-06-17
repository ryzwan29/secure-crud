import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { userService } from "../services/user.service";

export const userController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const users = await userService.listAll();
    res.status(200).json({ success: true, data: users });
  }),

  updateRole: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updated = await userService.updateRole(id, req.body.role, req.user!.sub);
    res.status(200).json({ success: true, data: updated });
  }),

  setActive: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updated = await userService.setActive(id, req.body.isActive, req.user!.sub);
    res.status(200).json({ success: true, data: updated });
  }),
};
