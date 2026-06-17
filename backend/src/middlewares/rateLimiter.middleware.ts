import rateLimit from "express-rate-limit";

/** General API limiter: 100 requests / 15 min per IP. */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak request, coba lagi nanti." },
});

/**
 * Strict limiter for auth endpoints (login/register) to slow down
 * brute-force and credential-stuffing attempts: 10 requests / 15 min.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak percobaan login/register, coba lagi nanti.",
  },
});
