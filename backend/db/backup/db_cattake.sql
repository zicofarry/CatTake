-- ===============================
-- 0. BUAT DATABASE
-- ===============================
-- Jalankan ini sekali saja
CREATE DATABASE db_cattake;

-- Pindah ke database
\c db_cattake;

-- ===============================
-- 1. PEMBERSIHAN (AMAN DIULANG)
-- ===============================
DROP TABLE IF EXISTS adoptions CASCADE;
DROP TABLE IF EXISTS cats CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS cat_gender CASCADE;
DROP TYPE IF EXISTS adoption_status_enum CASCADE;
DROP TYPE IF EXISTS health_status_enum CASCADE;
DROP TYPE IF EXISTS adoption_request_status CASCADE;

-- ===============================
-- 2. MEMBUAT ENUM TYPE
-- ===============================
CREATE TYPE user_role AS ENUM ('guest', 'user', 'shelter', 'admin');
CREATE TYPE cat_gender AS ENUM ('male', 'female');
CREATE TYPE adoption_status_enum AS ENUM ('available', 'pending', 'adopted');
CREATE TYPE health_status_enum AS ENUM ('healthy', 'vaccinated', 'sick');
CREATE TYPE adoption_request_status AS ENUM ('pending', 'approved', 'rejected');

-- ===============================
-- 3. MEMBUAT TABEL
-- ===============================

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    profile_picture VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    is_verified BOOLEAN DEFAULT false
);

-- CATS
CREATE TABLE cats (
    id SERIAL PRIMARY KEY,
    shelter_id INT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    age_in_months INT,
    gender cat_gender,
    breed VARCHAR(100),
    description TEXT,
    health_status health_status_enum,
    adoption_status adoption_status_enum DEFAULT 'available',
    photo VARCHAR(255)
);

-- ADOPTIONS
CREATE TABLE adoptions (
    id SERIAL PRIMARY KEY,
    cat_id INT REFERENCES cats(id) ON DELETE CASCADE,
    applicant_id INT REFERENCES users(id) ON DELETE CASCADE,
    verify_id INT REFERENCES users(id) ON DELETE SET NULL,
    status adoption_request_status DEFAULT 'pending',
    adopter_nik VARCHAR(50),
    adopter_phone VARCHAR(50),
    adopter_email VARCHAR(255),
    adopter_job VARCHAR(100),
    adopter_address TEXT,
    identity_photo_url VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- ===============================
-- 4. DUMMY DATA
-- ===============================

-- 4.1 SHELTER USERS
INSERT INTO users (username, email, password_hash, role, is_verified)
VALUES 
('CatHouse', 'admin@cathouse.com', 'dummy_hash_pass', 'shelter', true),
('PawCare', 'admin@pawcare.com', 'dummy_hash_pass', 'shelter', true);

-- 4.2 USER BIASA
INSERT INTO users (username, email, password_hash, role, profile_picture, contact_phone, address)
VALUES
('Diana', 'dianacantik@gmail.com', 'dummy_hash_pass', 'user', '/img/profileDiana.png', '08XXXXXXX1', 'Jl. Gegerkalong Girang No.116 Kota Bandung.'),
('Azmi', 'azmi@mail.com', 'dummy_hash_pass', 'user', '/img/profileAzmi.png', '08X-XXX-XXX', 'Jl. Asia Afrika No. 12, Bandung.');

-- 4.3 DATA KUCING
INSERT INTO cats (shelter_id, name, age_in_months, gender, breed, photo, adoption_status, health_status, description)
VALUES
(1, 'Oyen', 6, 'male', 'American Shorthair', 'oyencat.png', 'available', 'vaccinated', 'Suka mencari keributan di komplek. Sering terlihat mencuri ikan asin tetangga.'),
(2, 'Abul', 5, 'male', 'Domestik', 'minicat.png', 'available', 'healthy', 'Kucing pemalu tapi sangat manja jika sudah kenal.'),
(1, 'Simba', 24, 'male', 'Maine Coon', 'bradercat.png', 'available', 'vaccinated', 'Gagah dan berani, cocok untuk menjaga rumah dari tikus.'),
(1, 'Mueza', 8, 'female', 'Persia', 'mochacat.png', 'available', 'healthy', 'Manis, lembut, dan suka tidur di pangkuan.'),
(2, 'Kitty', 36, 'female', 'Anggora', 'kitty.png', 'adopted', 'vaccinated', 'Tenang dan penyayang, sudah diadopsi.');
