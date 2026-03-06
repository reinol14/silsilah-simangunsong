# Panduan Setup Admin

## 1. Jalankan Migrasi Database

Jalankan perintah berikut untuk membuat tabel Admin dan Session di database:

```bash
npx prisma migrate dev
```

atau jika sudah ada migrasi sebelumnya:

```bash
npx prisma db push
```

## 2. Buat Akun Admin Pertama

Jalankan script untuk membuat admin:

```bash
node scripts/create-admin.js
```

Script ini akan membuat akun admin dengan kredensial:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **PENTING**: Segera ganti password setelah login pertama!

## 3. Login Admin

1. Buka browser dan akses: `http://localhost:3000/login`
2. Masukkan kredensial admin yang telah dibuat
3. Anda akan diarahkan ke dashboard admin
4. Dari dashboard, Anda bisa mengakses menu "Tambah Anggota"

## 4. Fitur Admin

Setelah login, Anda dapat:
- Menambah anggota baru melalui `/tambah`
- Melihat statistik di dashboard
- Mengelola data silsilah

## 5. Keamanan (Production)

Untuk production, pastikan:
1. Ganti password default
2. Gunakan bcrypt untuk hash password (install: `npm install bcrypt`)
3. Update `src/app/api/auth/login/route.ts` untuk menggunakan bcrypt
4. Gunakan environment variables untuk secret keys
5. Aktifkan HTTPS

## 6. Logout

Untuk keluar dari admin, klik tombol "Keluar" di navbar dashboard admin.

---

*Catatan: Saat ini password disimpan dalam plain text untuk kemudahan development. Dalam production, HARUS menggunakan password hashing seperti bcrypt!*
