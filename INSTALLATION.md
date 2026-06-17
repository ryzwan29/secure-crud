# INSTALLATION — PostgreSQL Setup (Ubuntu 24.04)

Panduan instalasi PostgreSQL, pembuatan user, dan database untuk project **Secure CRUD App**.

---

## 1. Install PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

Verifikasi service berjalan:

```bash
sudo systemctl status postgresql
```

Jika belum aktif, jalankan:

```bash
sudo systemctl enable --now postgresql
```

---

## 2. Masuk ke PostgreSQL Shell

```bash
sudo -u postgres psql
```

---

## 3. Buat User (Role)

Di dalam `psql`, jalankan perintah berikut. Ganti `change_me_strong_password` dengan password yang kuat:

```sql
CREATE USER crud_user WITH PASSWORD 'change_me_strong_password';
```

---

## 4. Buat Database

```sql
CREATE DATABASE secure_crud_db OWNER crud_user;
```

Berikan privilege penuh ke user tersebut:

```sql
GRANT ALL PRIVILEGES ON DATABASE secure_crud_db TO crud_user;
```

Keluar dari psql:

```sql
\q
```

---

## 5. Jalankan Schema SQL

Dari root folder project, jalankan schema untuk membuat semua tabel, index, trigger, dan seed data admin:

```bash
psql -U crud_user -d secure_crud_db -h localhost -f backend/src/database/schema.sql
```

> Jika diminta password, masukkan password yang dibuat di langkah 3.

---

## 6. Konfigurasi Environment

Copy file `.env.example` dan sesuaikan isinya:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`, pastikan `DATABASE_URL` sesuai:

```env
DATABASE_URL=postgresql://crud_user:change_me_strong_password@localhost:5432/secure_crud_db
```

Ganti `change_me_strong_password` dengan password yang sama seperti langkah 3.

---

## 7. Verifikasi Koneksi

Test koneksi ke database:

```bash
psql -U crud_user -d secure_crud_db -h localhost -c "\dt"
```

Output yang diharapkan adalah daftar tabel: `users`, `products`, `refresh_tokens`, `audit_logs`.

---

## Default Admin Account

Setelah schema dijalankan, akun admin sudah tersedia:

| Field    | Value               |
|----------|---------------------|
| Email    | admin@example.com   |
| Password | Admin123!           |

> ⚠️ **Ganti password admin segera** setelah pertama kali login di production.

---

## Ringkasan Perintah Cepat

```bash
# Install PostgreSQL
sudo apt update && sudo apt install -y postgresql postgresql-contrib

# Buat user & database
sudo -u postgres psql <<EOF
CREATE USER crud_user WITH PASSWORD 'change_me_strong_password';
CREATE DATABASE secure_crud_db OWNER crud_user;
GRANT ALL PRIVILEGES ON DATABASE secure_crud_db TO crud_user;
EOF

# Jalankan schema
psql -U crud_user -d secure_crud_db -h localhost -f backend/src/database/schema.sql
```