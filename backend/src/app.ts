import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import routes from "./routes";
import { generalLimiter } from "./middlewares/rateLimiter.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.middleware";

export function createApp(): Express {
  const app = express();

  // Behind a reverse proxy (nginx, etc.) so req.ip reflects the real client.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true, // required so the httpOnly refresh cookie is sent/received
    })
  );
  app.use(express.json({ limit: "10kb" })); // small limit mitigates body-based DoS
  app.use(cookieParser());
  app.use(generalLimiter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, status: "ok" });
  });

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
