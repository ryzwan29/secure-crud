import { createApp } from "./app";
import { env } from "./config/env";
import { checkDatabaseConnection } from "./config/database";
import { logger } from "./utils/logger";

async function main() {
  await checkDatabaseConnection();
  logger.info("Database connection established");

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((err) => {
  logger.error("Failed to start server", { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
