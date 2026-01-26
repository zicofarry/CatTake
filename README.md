
# 🐾 CatTake - Platform Penyelamatan & Adopsi Kucing

![CatTake Logo](frontend/src/assets/img/cattake.png)

**CatTake** adalah platform terintegrasi (Web & Mobile) yang menghubungkan masyarakat (pecinta kucing), shelter, dan driver untuk menciptakan ekosistem penyelamatan kucing yang terintegrasi. Aplikasi ini memfasilitasi pelaporan kucing terlantar, proses adopsi yang terverifikasi, donasi transparan, serta sistem gamifikasi untuk meningkatkan partisipasi komunitas.

---

## 📋 Daftar Isi
- [🐾 CatTake - Platform Penyelamatan \& Adopsi Kucing](#-cattake---platform-penyelamatan--adopsi-kucing)
  - [📋 Daftar Isi](#-daftar-isi)
  - [🌟 Fitur Utama](#-fitur-utama)
    - [1. 🚑 Rescue \& Pelaporan](#1--rescue--pelaporan)
    - [2. 🏠 Adopsi \& Shelter](#2--adopsi--shelter)
    - [3. 💰 Donasi Transparan](#3--donasi-transparan)
    - [4. 🎮 Gamifikasi \& Komunitas](#4--gamifikasi--komunitas)
    - [5. 🚚 Manajemen Driver](#5--manajemen-driver)
  - [🛠 Teknologi yang Digunakan](#-teknologi-yang-digunakan)
    - [Database](#database)
    - [Backend](#backend)
    - [Frontend (Web)](#frontend-web)
    - [Mobile App](#mobile-app)
  - [💻 Prasyarat Sistem](#-prasyarat-sistem)
  - [🚀 Panduan Instalasi](#-panduan-instalasi)
    - [1. Instalasi Database (PostgreSQL)](#1-instalasi-database-postgresql)
    - [2. Instalasi Backend](#2-instalasi-backend)
    - [3. Instalasi Frontend](#3-instalasi-frontend)
    - [4. Setup Mobile App](#4-setup-mobile-app)
  - [▶️ Cara Menjalankan Aplikasi](#️-cara-menjalankan-aplikasi)
  - [🔄 Alur Kode \& Arsitektur](#-alur-kode--arsitektur)
  - [🗄️ Struktur Database](#️-struktur-database)
  - [🤝 Kontribusi](#-kontribusi)

---

## 🌟 Fitur Utama

### 1. 🚑 Rescue & Pelaporan
- **Lapor Kucing Liar/Hilang:** Pengguna dapat melaporkan lokasi penemuan kucing dengan integrasi peta (Leaflet).
- **Sistem Tracking Driver:** Pelacakan *real-time* posisi driver saat menjemput kucing menuju shelter.
- **Live Chat:** Komunikasi langsung antara pelapor dan driver.

### 2. 🏠 Adopsi & Shelter
- **Manajemen Kucing:** Shelter dapat mengelola data kucing (sehat, sakit, siap adopsi).
- **Proses Adopsi Terverifikasi:** Pengguna mengajukan adopsi dengan unggah KTP dan surat pernyataan; Shelter melakukan verifikasi (Approve/Reject).

### 3. 💰 Donasi Transparan
- **Donasi Uang:** Mendukung pembayaran via QRIS dan Transfer Bank.
- **Laporan Keuangan:** Shelter dapat melihat riwayat donasi masuk.

### 4. 🎮 Gamifikasi & Komunitas
- **Quest & Achievement:** Pengguna mendapatkan poin (XP) dan lencana untuk setiap aksi (lapor, adopsi, donasi).
- **Forum Komunitas:** Berbagi cerita, *likes*, dan komentar antar pengguna.
- **Leaderboard:** Peringkat pengguna teraktif.

### 5. 🚚 Manajemen Driver
- **Penugasan Otomatis/Manual:** Shelter dapat menugaskan driver untuk misi penyelamatan.
- **Dashboard Driver:** Antarmuka khusus untuk driver menerima tugas dan update status.

---

## 🛠 Teknologi yang Digunakan

### Database
- **RDBMS:** PostgreSQL

### Backend
- **Runtime:** Node.js
- **Framework:** Fastify
- **Database Driver:** `pg` (node-postgres)
- **Authentication:** JWT (JSON Web Token) & Google OAuth
  
### Frontend (Web)
- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Maps:** Leaflet.js
- **State/Network:** Axios, JWT Decode
  
### Mobile App
- **Framework:** React Native & Expo (SDK 54)
- **Routing:** Expo Router (File-based)
- **Styling:** NativeWind (Tailwind CSS for Mobile)
- **Maps:** React Native Maps & Google Maps SDK


---

## 💻 Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terinstal:

1.  **Node.js** (Versi 16.x atau lebih baru)
    * *Windows/Mac:* Unduh dari [nodejs.org](https://nodejs.org/).
    * *Linux:* Gunakan package manager (misal: `sudo apt install nodejs npm`).
2.  **PostgreSQL** (Versi 13.x atau lebih baru)
    * *Windows:* Gunakan installer resmi PostgreSQL.
    * *Mac:* Gunakan `brew install postgresql`.
    * *Linux:* `sudo apt install postgresql postgresql-contrib`.
3.  **Git** (Untuk kloning repositori).
4.  **Expo Go** (Untuk menjalankan aplikasi mobile di smartphone)
---

## 🚀 Panduan Instalasi

### 1. Instalasi Database (PostgreSQL)

Sebelum menjalankan aplikasi, kita perlu menyiapkan database.

1.  Buka terminal atau GUI PostgreSQL (pgAdmin).
2.  Buat database baru bernama `cattake`.
    ```bash
    # Contoh menggunakan terminal (pastikan postgres service berjalan)
    createdb -U postgres cattake
    ```
3.  Import skema dan data awal dari file SQL yang disediakan.
    ```bash
    # Arahkan ke folder root project
    psql -U postgres -d cattake -f backend/db/cattake.sql
    ```
    *(Catatan: Ganti `postgres` dengan username database Anda jika berbeda)*.

### 2. Instalasi Backend

1.  Masuk ke direktori backend:
    ```bash
    cd backend
    ```
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  **Konfigurasi Database:**
    Buka file `backend/config/db.js` dan sesuaikan kredensial database Anda:
    ```javascript
    const pool = new Pool({
        user: 'postgres',      // Username DB Anda
        host: 'localhost',
        database: 'cattake',
        password: 'password_anda', // Ganti dengan password DB Anda
        port: 5432,
    });
    ```

4.  **Konfigurasi Environment:**
    Buat file `.env` di dalam folder `backend/` dan isi sebagai berikut:
    ```properties
    CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
    CLOUDINARY_API_KEY=YOUR_API_KEY
    CLOUDINARY_API_SECRET=YOUR_API_SECRET
    GOOGLE_WEB_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
    JWT_SECRET=YOUR_SECRET_KEY
    ```

### 3. Instalasi Frontend

1.  Buka terminal baru, masuk ke direktori frontend:
    ```bash
    cd frontend
    ```
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  **Konfigurasi Environment:**
    Pastikan file `.env.development` (atau buat `.env`) berisi:
    ```properties
    VITE_API_BASE_URL="http://localhost:3000/api/v1"
    ```

### 4. Setup Mobile App

1.  Buka terminal baru, masuk ke direktori frontend:
    ```bash
    cd mobile
    ```
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  **Konfigurasi Environment:**
    Buat file `.env` di dalam folder `mobile/` dan isi sebagai berikut:
    ```properties
    # Gunakan IP Address laptop kamu agar bisa diakses dari HP (Expo Go)
    EXPO_PUBLIC_API_URL="http://192.168.x.x:3000/api/v1"

    # Google Maps Keys (Wajib untuk fitur peta)
    ANDROID_MAPS_API_KEY=isi_key_google_maps_kamu
    IOS_MAPS_API_KEY=isi_key_google_maps_kamu
    ```

---

## ▶️ Cara Menjalankan Aplikasi

Anda perlu menjalankan **dua terminal** secara bersamaan.

**Terminal 1 (Backend Server):**
```bash
cd backend
nodemon server.js
````

*Server akan berjalan di `http://localhost:3000`*

**Terminal 2 (Frontend Web):**

```bash
cd frontend
npm run dev
```

*Website akan dapat diakses di `http://localhost:5173` (atau port lain yang ditampilkan)*

**Terminal 3 (Mobile App):**

```bash
cd mobile
npx expo start
```

*Aplikasi akan dapat diakses di Expo Go melalui barcode yang discan atau melalui link yang diberikan*

-----

## 🔄 Alur Kode & Arsitektur

Proyek ini menggunakan arsitektur **MVC (Model-View-Controller)** yang dimodifikasi untuk API Service-based pattern.

1.  **Request (Frontend):**

      * User melakukan aksi di Vue.js.
      * `api/http.js` (Axios interceptor) mengirim request ke Backend dengan menyertakan Token JWT di header.

2.  **Routing (Backend - Fastify):**

      * `routes/*.js` menerima request.
      * Middleware `authentication.js` memverifikasi token.

3.  **Controller:**

      * `controllers/*.js` memparsing input (body/params/files).
      * Memanggil logika bisnis di Service.

4.  **Service (Business Logic):**

      * `services/*.js` menangani logika kompleks (misal: hitung poin gamifikasi, logika transaksi database).
      * Memanggil Model atau `db.query` langsung.

5.  **Database Access:**

      * Menggunakan Raw SQL Query via `pg` pool untuk performa dan kontrol penuh.

-----

## 🗄️ Struktur Database

Database `cattake` terdiri dari tabel-tabel utama berikut:

  * **`users`**: Tabel induk untuk autentikasi (email, password, role). Role: `individu`, `shelter`, `driver`, `admin`.
  * **`detail_user_individu` / `detail_user_shelter`**: Menyimpan profil detail berdasarkan role (One-to-One dengan `users`).
  * **`cats`**: Data kucing yang dikelola shelter (status: available, adopted).
  * **`lost_cats`**: Laporan kucing hilang dari pengguna umum.
  * **`reports`**: Laporan penemuan kucing liar (stray) atau hilang.
  * **`rescue_assignments`**: Tabel transaksi penugasan driver untuk menjemput kucing. Menghubungkan `reports`, `drivers`, dan `shelters`.
  * **`drivers`**: Profil khusus driver yang terikat dengan shelter.
  * **`adoptions`**: Mencatat pengajuan adopsi dari user ke shelter.
  * **`donations`**: Mencatat riwayat donasi.
  * **`quests` & `user_quest_progress`**: Menyimpan data misi dan progres gamifikasi user.

-----

## 🤝 Kontribusi

Kontribusi sangat diterima\! Jika Anda ingin berkontribusi:

1.  Fork repositori ini.
2.  Buat branch fitur baru (`git checkout -b fitur-keren`).
3.  Commit perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4.  Push ke branch (`git push origin fitur-keren`).
5.  Buat Pull Request.

-----

**Dibuat dengan ❤️ oleh Tim CatTake**