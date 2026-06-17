import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { comparePassword, hashPassword } from "../utils/password";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { auditLogRepository } from "../repositories/auditLog.repository";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { SafeUser, User } from "../types";

function toSafeUser(user: User): SafeUser {
  const { password_hash, failed_login_attempts, ...safe } = user;
  void password_hash;
  void failed_login_attempts;
  return safe;
}

function refreshExpiryDate(): Date {
  // Mirrors JWT_REFRESH_EXPIRES_IN (default 7d); used for DB-side revocation tracking.
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace(/\D/g, ""), 10) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

interface RequestContext {
  ip?: string | null;
  userAgent?: string | null;
}

export const authService = {
  async register(input: RegisterInput, ctx: RequestContext) {
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) throw ApiError.conflict("Email sudah terdaftar");

    const existingUsername = await userRepository.findByUsername(input.username);
    if (existingUsername) throw ApiError.conflict("Username sudah dipakai");

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      username: input.username,
      email: input.email,
      passwordHash,
    });

    auditLogRepository
      .record({ userId: user.id, action: "REGISTER", tableName: "users", recordId: user.id, ipAddress: ctx.ip, userAgent: ctx.userAgent })
      .catch((e) => logger.error("audit log failed", { e: String(e) }));

    return toSafeUser(user);
  },

  async login(input: LoginInput, ctx: RequestContext) {
    const user = await userRepository.findByEmail(input.email);

    // Generic message regardless of failure reason — avoids leaking
    // whether an email exists (user enumeration protection).
    const genericError = () => ApiError.unauthorized("Email atau password salah");

    if (!user) throw genericError();

    if (user.locked_until && user.locked_until.getTime() > Date.now()) {
      throw ApiError.tooManyRequests(
        "Akun terkunci sementara karena terlalu banyak percobaan gagal. Coba lagi nanti."
      );
    }

    if (!user.is_active) throw ApiError.forbidden("Akun ini dinonaktifkan");

    const valid = await comparePassword(input.password, user.password_hash);
    if (!valid) {
      const attempts = user.failed_login_attempts + 1;
      const shouldLock = attempts >= env.ACCOUNT_LOCK_THRESHOLD;
      const lockedUntil = shouldLock
        ? new Date(Date.now() + env.ACCOUNT_LOCK_MINUTES * 60 * 1000)
        : null;
      await userRepository.recordFailedLogin(user.id, attempts, lockedUntil);

      auditLogRepository
        .record({ userId: user.id, action: "LOGIN_FAILED", ipAddress: ctx.ip, userAgent: ctx.userAgent })
        .catch((e) => logger.error("audit log failed", { e: String(e) }));

      throw genericError();
    }

    await userRepository.recordSuccessfulLogin(user.id);

    const payload = { sub: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await refreshTokenRepository.store(user.id, hashToken(refreshToken), refreshExpiryDate());

    auditLogRepository
      .record({ userId: user.id, action: "LOGIN_SUCCESS", ipAddress: ctx.ip, userAgent: ctx.userAgent })
      .catch((e) => logger.error("audit log failed", { e: String(e) }));

    return { user: toSafeUser(user), accessToken, refreshToken };
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Refresh token tidak valid");
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findActive(tokenHash);
    if (!stored) throw ApiError.unauthorized("Refresh token sudah dicabut atau expired");

    const user = await userRepository.findById(payload.sub);
    if (!user || !user.is_active) throw ApiError.unauthorized("User tidak ditemukan atau nonaktif");

    // Rotate: revoke the old refresh token, issue a brand new pair.
    await refreshTokenRepository.revoke(tokenHash);
    const newPayload = { sub: user.id, role: user.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);
    await refreshTokenRepository.store(user.id, hashToken(newRefreshToken), refreshExpiryDate());

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: toSafeUser(user) };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    await refreshTokenRepository.revoke(hashToken(refreshToken));
  },
};
