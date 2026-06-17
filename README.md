# Secure CRUD App

A full-stack CRUD application for the **Database Server & CRUD Security** assignment — TypeScript + React + Node.js (Express) + PostgreSQL.

Demo case: a **Product** management system with user authentication, role-based access control (admin/user), and an audit log — so the security concepts are visible and concrete, not just plain CRUD.

## Folder Structure

```
secure-crud-app/
├── backend/                  # REST API (Express + TypeScript)
│   ├── src/
│   │   ├── config/           # env loader, database connection
│   │   ├── controllers/      # HTTP layer (request/response)
│   │   ├── services/         # business logic + authorization rules
│   │   ├── repositories/     # parameterized SQL queries
│   │   ├── middlewares/      # auth, validate, rate-limit, error handler
│   │   ├── validators/       # Zod schemas
│   │   ├── routes/
│   │   ├── utils/            # jwt, password hashing, logger, ApiError
│   │   ├── types/
│   │   ├── database/
│   │   │   └── schema.sql    # DDL (tables, indexes, triggers) — no seed
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
├── frontend/                 # React SPA (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── api/              # axios client + endpoint wrappers
│   │   ├── components/       # ui primitives, layout, modal, route guard
│   │   ├── context/          # AuthContext
│   │   ├── hooks/
│   │   ├── pages/            # Setup, Login, Register, Dashboard, Products, Users
│   │   ├── router/
│   │   └── types/
│   └── package.json
└── docker-compose.yml        # Local PostgreSQL, auto-init schema.sql
```

## Getting Started

### 1. Database

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` and automatically runs `backend/src/database/schema.sql` (creates tables, indexes, and triggers) on first boot.

> Without Docker, run `schema.sql` manually via `psql` against your own database. See [INSTALLATION.md](./INSTALLATION.md) for a full Ubuntu 24.04 setup guide.

### 2. Backend

```bash
cd backend
cp .env.example .env     # set DATABASE_URL, JWT secrets, etc.
npm install
npm run dev               # http://localhost:4002
```

**Required before production:** change `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (use long random strings, never reuse between environments), and the database password in `docker-compose.yml`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server already proxies `/api` → `localhost:4000`, so no extra CORS configuration is needed during development.

### 4. First-Run Setup

There is no pre-seeded admin account. On first visit, the app detects that no admin exists and automatically redirects to `/setup`, where you create the first admin account. After that, the setup page is permanently disabled.

If you prefer to skip the web UI, you can create an admin directly via the API:

```bash
curl -X POST http://localhost:4002/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"Admin123!!"}'
```

## Implemented Security Features

- **Password hashing** — bcrypt (cost factor 12) via `bcryptjs` in Node; the same `pgcrypto` extension is available in the database if you need in-DB hashing.
- **Dual-token JWT auth** — short-lived access token (kept in memory on the client, never written to localStorage) + refresh token (httpOnly, `SameSite=Strict` cookie, stored as a hash in `refresh_tokens` for server-side revocation, rotated on every refresh).
- **Role-based + ownership authorization** — admins can access all data; regular users can only update/delete their own products (enforced in the service layer, not just the UI).
- **Input validation** — all request body/query/params are validated and sanitized with Zod before reaching business logic.
- **SQL injection prevention** — all database queries use parameterized statements (`$1, $2, ...`), no string concatenation into SQL.
- **Account lockout** — account is automatically locked for 15 minutes after 5 consecutive failed login attempts.
- **Rate limiting** — auth endpoints are limited more aggressively (10 req/15 min) than general endpoints (100 req/15 min) to mitigate brute-force attacks.
- **Generic auth error messages** — login failures always return the same message regardless of whether email or password was wrong, preventing account enumeration.
- **Audit log** — every login, register, and product create/update/delete is recorded in `audit_logs` (who, when, from which IP).
- **Security headers** — `helmet` sets standard HTTP security headers; `cors` is scoped to the frontend origin only; request body size is capped at 10 KB as a basic DoS mitigation.
- **No stack trace leakage** — a centralized error handler logs technical details server-side only; responses to clients always contain a generic message in production mode.
- **First-run setup protection** — the `POST /api/auth/setup` endpoint can only be called once (when zero users exist) and is rejected afterwards.

## API Endpoints

| Method | Path | Access |
|---|---|---|
| GET | `/api/auth/setup` | Public — returns `{ setupRequired: true/false }` |
| POST | `/api/auth/setup` | Public — one-time admin account creation |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public (requires cookie) |
| POST | `/api/auth/logout` | Public |
| GET | `/api/products` | Authenticated |
| POST | `/api/products` | Authenticated |
| GET | `/api/products/:id` | Authenticated |
| PUT | `/api/products/:id` | Authenticated (owner or admin) |
| DELETE | `/api/products/:id` | Authenticated (owner or admin) |
| GET | `/api/users` | Admin only |
| PATCH | `/api/users/:id/role` | Admin only |
| PATCH | `/api/users/:id/active` | Admin only |