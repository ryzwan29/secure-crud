# Secure CRUD App

Aplikasi CRUD full-stack untuk tugas **Database Server & CRUD Security** — TypeScript + React + Node.js (Express) + PostgreSQL.

Demo case: sistem manajemen **Produk** dengan autentikasi user, role-based access control (admin/user), dan audit log — supaya security concept-nya kelihatan jelas, bukan cuma CRUD polos.

## Struktur Folder

```
secure-crud-app/
├── backend/                  # REST API (Express + TypeScript)
│   ├── src/
│   │   ├── config/           # env loader, koneksi database
│   │   ├── controllers/      # HTTP layer (request/response)
│   │   ├── services/         # business logic + authorization rules
│   │   ├── repositories/     # query SQL ter-parameterisasi
│   │   ├── middlewares/      # auth, validate, rate-limit, error handler
│   │   ├── validators/       # Zod schema
│   │   ├── routes/
│   │   ├── utils/            # jwt, password hashing, logger, ApiError
│   │   ├── types/
│   │   ├── database/
│   │   │   └── schema.sql    # DDL + seed admin user
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
├── frontend/                 # React SPA (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── api/              # axios client + endpoint wrappers
│   │   ├── components/       # ui primitives, layout, route guard
│   │   ├── context/          # AuthContext
│   │   ├── hooks/
│   │   ├── pages/             # Login, Register, Dashboard, Products, Users
│   │   ├── router/
│   │   └── types/
│   └── package.json
└── docker-compose.yml         # PostgreSQL lokal, auto-init schema.sql
```

## Cara Jalanin

### 1. Database

```bash
docker compose up -d
```

Ini bakal jalanin PostgreSQL di `localhost:5432` dan otomatis menjalankan `backend/src/database/schema.sql` (bikin tabel + seed admin user) saat container pertama kali dibuat.

> Kalau nggak pakai Docker, jalankan isi `schema.sql` manual lewat `psql` ke database kamu sendiri.

### 2. Backend

```bash
cd backend
cp .env.example .env     # sesuaikan DATABASE_URL, JWT secrets, dst
npm install
npm run dev               # http://localhost:4000
```

**Wajib diganti sebelum production:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (generate random string panjang, jangan dipakai bareng), dan password database di `docker-compose.yml`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Vite dev server sudah di-proxy ke `/api` → `localhost:4000`, jadi nggak perlu setup CORS tambahan saat development.

### Login default

| Email | Password | Role |
|---|---|---|
| admin@example.com | Admin123! | admin |

**Ganti password ini di luar environment development.**

## Fitur Security yang Diimplementasikan

- **Password hashing** — bcrypt (cost factor 12), baik di Node (`bcryptjs`) maupun saat seed lewat `pgcrypto` di database.
- **JWT auth dua-token** — access token (short-lived, in-memory di client, tidak pernah disimpan ke localStorage) + refresh token (httpOnly, `SameSite=Strict` cookie, disimpan hash-nya di tabel `refresh_tokens` supaya bisa di-revoke kapan saja, dengan token rotation tiap refresh).
- **Role-based + ownership authorization** — admin bisa akses semua data, user biasa cuma bisa ubah/hapus produk miliknya sendiri (dicek di service layer, bukan cuma UI).
- **Input validation** — semua request body/query/params divalidasi & disanitasi pakai Zod sebelum masuk ke business logic.
- **SQL injection prevention** — semua query database pakai parameterized statement (`$1, $2, ...`), nggak ada string concatenation ke SQL.
- **Account lockout** — akun terkunci otomatis 15 menit setelah 5x percobaan login gagal beruntun.
- **Rate limiting** — endpoint auth dibatasi lebih ketat (10 req/15 menit) dibanding endpoint umum (100 req/15 menit), buat mitigasi brute-force.
- **Generic auth error message** — pesan "email atau password salah" disamakan untuk semua kasus gagal login, supaya nggak bisa dipakai buat enumerasi akun yang terdaftar.
- **Audit log** — setiap login, register, create/update/delete produk dicatat ke tabel `audit_logs` (siapa, kapan, dari IP mana).
- **Security headers** — `helmet` buat header HTTP standar, `cors` dibatasi ke origin frontend saja, body size limit 10kb buat mitigasi DoS sederhana.
- **No stack trace leak** — error handler terpusat, detail error teknis cuma dilog di server, response ke client selalu pesan generik di mode production.

## API Endpoints (ringkas)

| Method | Path | Akses |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public (butuh cookie) |
| POST | `/api/auth/logout` | Public |
| GET/POST | `/api/products` | Authenticated |
| PUT/DELETE | `/api/products/:id` | Authenticated (owner/admin) |
| GET | `/api/users` | Admin only |
| PATCH | `/api/users/:id/role` | Admin only |
| PATCH | `/api/users/:id/active` | Admin only |

## Ide Pengembangan Lanjutan

- Tambah 2FA (TOTP) untuk akun admin.
- HTTPS + secure cookie wajib aktif di production (`NODE_ENV=production`).
- Export audit log ke CSV buat keperluan laporan.
- Soft-delete produk (kolom `deleted_at`) daripada hard delete, biar audit trail tetap utuh.
