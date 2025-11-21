-- === 1. DATABASE SETUP (PostgreSQL/MySQL Compatible) ===

-- Membuat Database
-- Perintah ini mungkin harus dijalankan di luar klien database saat ini (misalnya di command line)
-- atau jika Anda memiliki hak superuser.
CREATE DATABASE cattake;
\c cattake -- (Hanya untuk PostgreSQL)

-- DROP all tables in reverse order for clean run (optional, for testing)
/*
DROP TABLE IF EXISTS "chat_messages";
DROP TABLE IF EXISTS "driver_locations";
DROP TABLE IF EXISTS "drivers";
DROP TABLE IF EXISTS "events";
DROP TABLE IF EXISTS "cat_facts";
DROP TABLE IF EXISTS "verification_log";
DROP TABLE IF EXISTS "favorite_cats";
DROP TABLE IF EXISTS "faq";
DROP TABLE IF EXISTS "reply_comment";
DROP TABLE IF EXISTS "comment";
DROP TABLE IF EXISTS "community_post";
DROP TABLE IF EXISTS "adoptions";
DROP TABLE IF EXISTS "rescue_assignments";
DROP TABLE IF EXISTS "reports";
DROP TABLE IF EXISTS "donations";
DROP TABLE IF EXISTS "cats";
DROP TABLE IF EXISTS "detail_user_shelter";
DROP TABLE IF EXISTS "detail_user_individu";
DROP TABLE IF EXISTS "users";
*/


-- === 2. CORE TABLES (Sesuai Koreksi) ===

CREATE TABLE IF NOT EXISTS "users" (
	"id" INTEGER PRIMARY KEY,
	"username" VARCHAR(255) NOT NULL UNIQUE,
	"email" VARCHAR(255) NOT NULL UNIQUE,
	"password_hash" VARCHAR(255) NOT NULL,
	"role" VARCHAR(50) NOT NULL -- ENUM: shelter, individu, admin, driver
);

CREATE TABLE IF NOT EXISTS "detail_user_individu" (
	"id" INTEGER PRIMARY KEY, -- FK ke users.id
	"full_name" VARCHAR(255) NOT NULL,
	"birth_date" DATE,
	"gender" VARCHAR(50), -- ENUM: male, female
	"profile_picture" VARCHAR(255),
	"bio" TEXT,
	"contact_phone" VARCHAR(255),
	"address" TEXT,
	"job" VARCHAR(255),
	"nik" VARCHAR(255) UNIQUE,
	"ktp_file_path" VARCHAR(255),
	"is_verified" BOOLEAN DEFAULT FALSE,
	"is_adopter_ready" BOOLEAN DEFAULT FALSE,
	"donasi_history_count" INTEGER DEFAULT 0,
	
	-- ONE-TO-ONE RELATIONSHIP (detail -> users)
	FOREIGN KEY("id") REFERENCES "users"("id") 
);

CREATE TABLE IF NOT EXISTS "detail_user_shelter" (
	"id" INTEGER PRIMARY KEY, -- FK ke users.id
	"shelter_name" VARCHAR(255) NOT NULL,
	"established_date" DATE,
	"organization_type" VARCHAR(50) NOT NULL, -- ENUM: Yayasan, Komunitas, Pribadi
	"shelter_picture" VARCHAR(255),
	"bio" TEXT,
	"contact_phone" VARCHAR(255),
	"legal_certificate" VARCHAR(255),
	"donation_account_number" VARCHAR(255) UNIQUE,
	"pj_name" VARCHAR(255) NOT NULL, 
	"pj_nik" VARCHAR(255) UNIQUE, 
	"is_verified_shelter" BOOLEAN DEFAULT FALSE,
	"cat_capacity" INTEGER DEFAULT 0,

	-- ONE-TO-ONE RELATIONSHIP (detail -> users)
	FOREIGN KEY("id") REFERENCES "users"("id") 
);

-- === 3. DRIVER & LOCATION TRACKING ===

CREATE TABLE IF NOT EXISTS "drivers" (
	"id" VARCHAR(50) PRIMARY KEY, -- ID Unik Driver (VARCHAR)
	"user_id" INTEGER NOT NULL UNIQUE, -- FK ke users.id (One-to-One)
	"shelter_id" INTEGER NOT NULL, -- FK ke users.id (One-to-Many: Shelter -> Drivers)
	"is_available" BOOLEAN DEFAULT TRUE,
	"license_info" VARCHAR(255),
	"full_name" VARCHAR(255) NOT NULL,
	
	FOREIGN KEY("user_id") REFERENCES "users"("id"),
	FOREIGN KEY("shelter_id") REFERENCES "users"("id") 
);

CREATE TABLE IF NOT EXISTS "driver_locations" (
	"id" INTEGER PRIMARY KEY,
	"driver_id" VARCHAR(50) NOT NULL,
	"assignment_id" INTEGER NOT NULL,
	"latitude" DECIMAL(10,8),
	"longitude" DECIMAL(11,8),
	"timestamp" TIMESTAMP NOT NULL,
	
	FOREIGN KEY("driver_id") REFERENCES "drivers"("id"),
	FOREIGN KEY("assignment_id") REFERENCES "rescue_assignments"("id")
);

-- === 4. CATS & ADOPTIONS ===

CREATE TABLE IF NOT EXISTS "cats" (
	"id" INTEGER PRIMARY KEY,
	"shelter_id" INTEGER NOT NULL, 
	"name" VARCHAR(255) NOT NULL,
	"age" INTEGER,
	"gender" VARCHAR(50) NOT NULL, -- ENUM: male, female
	"breed" VARCHAR(255),
	"description" TEXT,
	"health_status" TEXT,
	"adoption_status" VARCHAR(50) NOT NULL, -- ENUM: available, pending, adopted
	"photo" VARCHAR(255),
	
	FOREIGN KEY("shelter_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "adoptions" (
	"id" INTEGER PRIMARY KEY,
	"cat_id" INTEGER NOT NULL,
	"applicant_id" INTEGER NOT NULL, 
	"statement_letter_path" VARCHAR(255),
	"status" VARCHAR(50) NOT NULL, -- ENUM: pending, approved, rejected, completed
	"applied_at" TIMESTAMP NOT NULL,
	"verified_at" TIMESTAMP,
	"updated_at" TIMESTAMP NOT NULL,
	
	FOREIGN KEY("cat_id") REFERENCES "cats"("id"),
	FOREIGN KEY("applicant_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "favorite_cats" (
	"user_id" INTEGER NOT NULL,
	"cat_id" INTEGER NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	
	PRIMARY KEY("user_id", "cat_id"),
	FOREIGN KEY("user_id") REFERENCES "users"("id"),
	FOREIGN KEY("cat_id") REFERENCES "cats"("id")
);

-- === 5. REPORTING & RESCUE ===

CREATE TABLE IF NOT EXISTS "reports" (
	"id" INTEGER PRIMARY KEY,
	"reporter_id" INTEGER NOT NULL,
	"report_type" VARCHAR(50) NOT NULL, -- ENUM: Missing, Injured, Abandoned, Abuse
	"shelter_assigned_id" INTEGER, 
	"location" VARCHAR(255) NOT NULL,
	"latitude" DECIMAL(10,8) NOT NULL,
	"longitude" DECIMAL(11,8) NOT NULL,
	"description" TEXT NOT NULL,
	"photo" VARCHAR(255) NOT NULL,
	"report_date" DATE NOT NULL,
	
	FOREIGN KEY("reporter_id") REFERENCES "users"("id"),
	FOREIGN KEY("shelter_assigned_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "rescue_assignments" (
	"id" INTEGER PRIMARY KEY,
	"report_id" INTEGER NOT NULL UNIQUE,
	"driver_id" VARCHAR(50) NOT NULL, -- FK ke drivers.id
	"shelter_id" INTEGER NOT NULL,
	"assignment_status" VARCHAR(50) NOT NULL, -- ENUM: assigned, in_transit, completed, cancelled
	"assigned_at" TIMESTAMP NOT NULL,
	"started_transit_at" TIMESTAMP,
	"completed_at" TIMESTAMP,
	"estimated_pickup_time" TIMESTAMP,
	"notes" TEXT,
	
	FOREIGN KEY("report_id") REFERENCES "reports"("id"),
	FOREIGN KEY("driver_id") REFERENCES "drivers"("id"),
	FOREIGN KEY("shelter_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" INTEGER PRIMARY KEY,
	"assignment_id" INTEGER NOT NULL,
	"sender_id" INTEGER NOT NULL,
	"message" TEXT NOT NULL,
	"sent_at" TIMESTAMP NOT NULL,
	
	FOREIGN KEY("assignment_id") REFERENCES "rescue_assignments"("id"),
	FOREIGN KEY("sender_id") REFERENCES "users"("id")
);

-- === 6. COMMUNITY & DONATIONS & LOGS ===

CREATE TABLE IF NOT EXISTS "community_post" (
	"id" INTEGER PRIMARY KEY,
	"author_id" INTEGER NOT NULL,
	"content" TEXT NOT NULL,
	"media_path" VARCHAR(255),
	"likes_count" INTEGER DEFAULT 0,
	"created_at" TIMESTAMP NOT NULL,
	"updated_at" TIMESTAMP NOT NULL,
	
	FOREIGN KEY("author_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "comment" (
	"id" INTEGER PRIMARY KEY,
	"user_id" INTEGER NOT NULL,
	"post_id" INTEGER NOT NULL,
	"content" TEXT NOT NULL,
	"likes_count" INTEGER DEFAULT 0,
	"created_at" TIMESTAMP NOT NULL,
	"updated_at" TIMESTAMP NOT NULL,
	
	FOREIGN KEY("user_id") REFERENCES "users"("id"),
	FOREIGN KEY("post_id") REFERENCES "community_post"("id")
);

CREATE TABLE IF NOT EXISTS "reply_comment" (
	"id" INTEGER PRIMARY KEY,
	"user_id" INTEGER NOT NULL,
	"comment_id" INTEGER NOT NULL,
	"parent_reply_id" INTEGER, 
	"content" TEXT NOT NULL,
	"likes_count" INTEGER DEFAULT 0,
	"created_at" TIMESTAMP NOT NULL,
	"updated_at" TIMESTAMP NOT NULL,
	
	FOREIGN KEY("user_id") REFERENCES "users"("id"),
	FOREIGN KEY("comment_id") REFERENCES "comment"("id"),
	FOREIGN KEY("parent_reply_id") REFERENCES "reply_comment"("id") 
);

CREATE TABLE IF NOT EXISTS "donations" (
	"id" INTEGER PRIMARY KEY,
	"donatur_id" INTEGER NOT NULL,
	"shelter_id" INTEGER NOT NULL,
	"amount" DECIMAL(10,2) NOT NULL,
	"donation_date" DATE NOT NULL,
	"is_anonymus" BOOLEAN DEFAULT FALSE,
	
	FOREIGN KEY("donatur_id") REFERENCES "users"("id"),
	FOREIGN KEY("shelter_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "verification_log" (
	"id" INTEGER PRIMARY KEY,
	"user_id" INTEGER NOT NULL,
	"verifier_id" INTEGER,
	"verification_type" VARCHAR(50) NOT NULL, 
	"status" VARCHAR(50) NOT NULL, 
	"notes" TEXT,
	"created_at" TIMESTAMP NOT NULL,
	
	FOREIGN KEY("user_id") REFERENCES "users"("id"),
	FOREIGN KEY("verifier_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "cat_facts" (
	"id" INTEGER PRIMARY KEY,
	"fact_text" TEXT NOT NULL,
	"source" VARCHAR(255),
	"image_path" VARCHAR(255),
	"is_verified" BOOLEAN DEFAULT FALSE,
	"created_at" TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "events" (
	"id" INTEGER PRIMARY KEY,
	"organizer_id" INTEGER NOT NULL,
	"title" VARCHAR(255) NOT NULL,
	"description" TEXT NOT NULL,
	"event_date" DATE NOT NULL,
	"start_time" TIME NOT NULL,
	"location_name" VARCHAR(255) NOT NULL,
	"location_address" TEXT NOT NULL,
	"registration_link" VARCHAR(255),
	"is_active" BOOLEAN DEFAULT TRUE,
	"created_at" TIMESTAMP NOT NULL,
	
	FOREIGN KEY("organizer_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "faq" (
	"id" INTEGER PRIMARY KEY,
	"question" TEXT NOT NULL,
	"answer" TEXT NOT NULL
);


-- === 7. CHECK CONSTRAINTS (ENUM Simulation) ===

ALTER TABLE "users"
ADD CONSTRAINT check_user_role CHECK ("role" IN ('shelter', 'individu', 'admin', 'driver'));

ALTER TABLE "cats"
ADD CONSTRAINT check_cat_gender CHECK ("gender" IN ('male', 'female'));
ALTER TABLE "cats"
ADD CONSTRAINT check_cat_adoption_status CHECK ("adoption_status" IN ('available', 'pending', 'adopted'));

ALTER TABLE "detail_user_individu"
ADD CONSTRAINT check_individu_gender CHECK ("gender" IN ('male', 'female'));

ALTER TABLE "detail_user_shelter"
ADD CONSTRAINT check_org_type CHECK ("organization_type" IN ('Yayasan', 'Komunitas', 'Pribadi'));

ALTER TABLE "adoptions"
ADD CONSTRAINT check_adoption_status CHECK ("status" IN ('pending', 'approved', 'rejected', 'completed'));

ALTER TABLE "reports"
ADD CONSTRAINT check_report_type CHECK ("report_type" IN ('Missing', 'Injured', 'Abandoned', 'Abuse'));

ALTER TABLE "rescue_assignments"
ADD CONSTRAINT check_assignment_status CHECK ("assignment_status" IN ('assigned', 'in_transit', 'completed', 'cancelled'));

ALTER TABLE "verification_log"
ADD CONSTRAINT check_verification_type CHECK ("verification_type" IN ('Adoption_Application', 'Initial_Data_Check', 'Follow_Up'));
ALTER TABLE "verification_log"
ADD CONSTRAINT check_verification_status CHECK ("status" IN ('approved', 'rejected'));


-- === 8. DUMMY DATA ===

-- 1. users
INSERT INTO "users" ("id", "username", "email", "password_hash", "role") VALUES
(1, 'admin_super', 'admin@cattake.id', 'hashed_admin_pw', 'admin'),
(10, 'shelter_bandung', 'shelter_bdg@mail.com', 'hashed_shelter_pw', 'shelter'),
(11, 'shelter_jakarta', 'shelter_jkt@mail.com', 'hashed_shelter_pw', 'shelter'),
(20, 'andi_adopter', 'andi@mail.com', 'hashed_andi_pw', 'individu'),
(21, 'budi_donatur', 'budi@mail.com', 'hashed_budi_pw', 'individu'),
(30, 'driver_budi', 'budi_drv@mail.com', 'hashed_driver_pw', 'driver'),
(31, 'driver_cecep', 'cecep_drv@mail.com', 'hashed_driver_pw', 'driver');

-- 2. detail_user_individu
INSERT INTO "detail_user_individu" ("id", "full_name", "birth_date", "gender", "contact_phone", "address", "job", "nik", "is_verified", "donasi_history_count") VALUES
(20, 'Andi Gunawan', '1995-05-10', 'male', '081234567890', 'Jl. Adopsi No. 5, Bandung', 'Software Engineer', '3273xxxxxxxxxxxx', TRUE, 3),
(21, 'Budi Santoso', '1990-01-20', 'male', '081234567891', 'Jl. Donasi No. 10, Jakarta', 'Pengusaha', '3174xxxxxxxxxxxx', TRUE, 10);

-- 3. detail_user_shelter
INSERT INTO "detail_user_shelter" ("id", "shelter_name", "established_date", "organization_type", "contact_phone", "donation_account_number", "pj_name", "pj_nik", "is_verified_shelter", "cat_capacity") VALUES
(10, 'Rumah Kucing Bandung', '2015-08-17', 'Komunitas', '0227654321', '1234567890', 'Rina Anggraini', '3273zzzzzzzzzzzz', TRUE, 50),
(11, 'Panti Cat Sejahtera', '2010-02-28', 'Yayasan', '0219876543', '0987654321', 'Joko Susilo', '3174yyyyyyyyyyyy', TRUE, 100);

-- 4. drivers
INSERT INTO "drivers" ("id", "user_id", "shelter_id", "full_name", "is_available", "license_info") VALUES
('DRV-BDG-001', 30, 10, 'Budi Kurniawan', TRUE, 'SIM C-2027'),
('DRV-BDG-002', 31, 10, 'Cecep Supriadi', TRUE, 'SIM C-2026');

-- 5. cats
INSERT INTO "cats" ("id", "shelter_id", "name", "age", "gender", "breed", "description", "health_status", "adoption_status", "photo") VALUES
(1, 10, 'Oyen', 6, 'male', 'American Shorthair', 'Suka mencari keributan di komplek. Sering terlihat mencuri ikan asin tetangga.', 'vaccinated', 'available', 'oyencat.png'),
(2, 10, 'Abul', 5, 'male', 'Domestik', 'Kucing pemalu tapi sangat manja jika sudah kenal.', 'healthy', 'available', 'minicat.png'),
(3, 11, 'Simba', 23, 'male', 'Maine Coon', 'Gagah dan berani, cocok untuk menjaga rumah dari tikus.', 'vaccinated', 'available', 'bradercat.png'),
(4, 10, 'Mueza', 8, 'female', 'Persia', 'Manis, lembut, dan suka tidur di pangkuan.', 'healthy', 'available', 'mochacat.png'),
(5, 11, 'Kitty', 36, 'female', 'Anggora', 'Tenang dan penyayang, sudah diadopsi.', 'vaccinated', 'adopted', 'kitty.png');

-- 6. favorite_cats
INSERT INTO "favorite_cats" ("user_id", "cat_id", "created_at") VALUES
(20, 2, '2025-11-10 10:00:00'), -- Andi suka Si Putih
(21, 1, '2025-11-11 11:00:00'), -- Budi suka Si Oyen
(20, 3, '2025-11-12 12:00:00'); -- Andi suka Blackie

-- 7. reports
INSERT INTO "reports" ("id", "reporter_id", "report_type", "shelter_assigned_id", "location", "latitude", "longitude", "description", "photo", "report_date") VALUES
(1, 20, 'Injured', 10, 'Jl. Kebon Jati, Bandung', -6.9147, 107.6098, 'Kucing tertabrak, kaki belakang luka parah.', 'photo_report_1.jpg', '2025-11-18'),
(2, 21, 'Abandoned', 11, 'Jl. Thamrin, Jakarta', -6.1754, 106.8272, 'Ditinggalkan di depan ruko, sangat kurus.', 'photo_report_2.jpg', '2025-11-17');

-- 8. rescue_assignments
INSERT INTO "rescue_assignments" ("id", "report_id", "driver_id", "shelter_id", "assignment_status", "assigned_at", "estimated_pickup_time") VALUES
(1, 1, 'DRV-BDG-001', 10, 'in_transit', '2025-11-18 10:30:00', '2025-11-18 11:30:00');

-- 9. chat_messages
INSERT INTO "chat_messages" ("id", "assignment_id", "sender_id", "message", "sent_at") VALUES
(1, 1, 30, 'Halo, saya driver Budi, sudah di jalan menuju lokasi Anda.', '2025-11-18 10:35:00'),
(2, 1, 20, 'Baik, Pak Budi. Hati-hati ya!', '2025-11-18 10:36:00');

-- 10. driver_locations
INSERT INTO "driver_locations" ("id", "driver_id", "assignment_id", "latitude", "longitude", "timestamp") VALUES
(1, 'DRV-BDG-001', 1, -6.9140, 107.6080, '2025-11-18 10:45:00'),
(2, 'DRV-BDG-001', 1, -6.9145, 107.6090, '2025-11-18 10:46:00');

-- 11. adoptions
INSERT INTO "adoptions" ("id", "cat_id", "applicant_id", "statement_letter_path", "status", "applied_at", "updated_at") VALUES
(1, 3, 20, '/docs/stmt_andi_1.pdf', 'pending', '2025-11-15 15:00:00', '2025-11-15 15:00:00');

-- 12. verification_log
INSERT INTO "verification_log" ("id", "user_id", "verifier_id", "verification_type", "status", "notes", "created_at") VALUES
(1, 20, 1, 'Initial_Data_Check', 'approved', 'Data NIK dan Alamat valid.', '2025-01-01 09:00:00'),
(2, 20, 10, 'Adoption_Application', 'pending', 'Menunggu wawancara pemohon adopsi Si Oyen.', '2025-11-15 16:00:00');

-- 13. donations
INSERT INTO "donations" ("id", "donatur_id", "shelter_id", "amount", "donation_date", "is_anonymus") VALUES
(1, 21, 10, 50000.00, '2025-11-16', FALSE),
(2, 20, 10, 100000.00, '2025-11-16', FALSE),
(3, 21, 11, 20000.00, '2025-11-17', TRUE);

-- 14. community_post
INSERT INTO "community_post" ("id", "author_id", "content", "created_at", "updated_at") VALUES
(1, 20, 'Kucing saya Si Putih suka makan daun, apakah normal?', '2025-11-17 09:00:00', '2025-11-17 09:00:00'),
(2, 10, 'Kami membuka kuota sterilisasi gratis bulan ini!', '2025-11-18 10:00:00', '2025-11-18 10:00:00');

-- 15. comment
INSERT INTO "comment" ("id", "user_id", "post_id", "content", "created_at", "updated_at") VALUES
(1, 21, 1, 'Mungkin dia kekurangan serat, coba berikan rumput gandum khusus.', '2025-11-17 10:00:00', '2025-11-17 10:00:00'),
(2, 10, 1, 'Pastikan daunnya bukan tanaman beracun ya!', '2025-11-17 10:15:00', '2025-11-17 10:15:00');

-- 16. reply_comment
INSERT INTO "reply_comment" ("id", "user_id", "comment_id", "parent_reply_id", "content", "created_at", "updated_at") VALUES
(1, 20, 1, NULL, 'Terima kasih sarannya Budi!', '2025-11-17 10:30:00', '2025-11-17 10:30:00');

-- 17. events
INSERT INTO "events" ("id", "organizer_id", "title", "description", "event_date", "start_time", "location_name", "location_address", "is_active", "created_at") VALUES
(1, 10, 'Bazar Adopsi Massal', 'Datang dan adopsi kucing lucu!', '2025-12-05', '10:00:00', 'Parkir Timur', 'Jl. Sukarno Hatta No. 100', TRUE, '2025-11-10 10:00:00');

-- 18. cat_facts
INSERT INTO "cat_facts" ("id", "fact_text", "is_verified", "created_at") VALUES
(1, 'Kucing menghabiskan 70% hidupnya untuk tidur.', TRUE, '2025-01-01 00:00:00'),
(2, 'Grup kucing disebut clowder.', TRUE, '2025-01-01 00:00:00');

-- 19. faq
INSERT INTO "faq" ("id", "question", "answer") VALUES
(1, 'Bagaimana cara adopsi?', 'Anda harus mengisi formulir adopsi, wawancara, dan survei rumah.'),
(2, 'Apa itu kucing steril?', 'Kucing steril adalah kucing yang sudah diangkat indung telur/testisnya.');