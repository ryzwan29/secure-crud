import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/auth.service";
import { isProd } from "../config/env";

const REFRESH_COOKIE_NAME = "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict" as const,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function getContext(req: Request) {
  return { ip: req.ip, userAgent: req.headers["user-agent"] ?? null };
}

export const authController = {
  checkSetup: asyncHandler(async (_req: Request, res: Response) => {
    const required = await authService.isSetupRequired();
    res.status(200).json({ success: true, data: { setupRequired: required } });
  }),

  setup: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.setup(req.body, getContext(req));
    res.status(201).json({ success: true, data: user });
  }),

  register: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body, getContext(req));
    res.status(201).json({ success: true, data: user });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body, getContext(req));
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
    res.status(200).json({ success: true, data: { user, accessToken } });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      res.status(401).json({ success: false, message: "Refresh token tidak ditemukan" });
      return;
    }
    const result = await authService.refresh(token);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, cookieOptions);
    res.status(200).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    res.status(200).json({ success: true, message: "Logout berhasil" });
  }),
};