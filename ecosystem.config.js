module.exports = {
  apps: [
    {
      name: "secure-crud-backend",
      script: "dist/server.js",
      cwd: "./backend",
      instances: "1",
      exec_mode: "cluster",
      node_args: "--max-old-space-size=512",

      // Environment: production
      env_production: {
        NODE_ENV: "production",
        PORT: 4002,
      },

      // Environment: development
      env_development: {
        NODE_ENV: "development",
        PORT: 4002,
      },

      // Logging
      out_file: "./logs/backend-out.log",
      error_file: "./logs/backend-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Restart policy
      watch: false,
      max_restarts: 10,
      min_uptime: "5s",
      restart_delay: 3000,
      autorestart: true,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};