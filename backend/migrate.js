require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./config/db'); // Pastikan path ke config db benar
const { uploadToCloudinary } = require('./config/cloudinary');

const migrationConfig = [
    {
        table: 'cats',
        column: 'photo',
        localDir: 'public/img/cats',
        cloudinaryFolder: 'cattake/cats'
    },
    {
        table: 'detail_user_individu',
        column: 'profile_picture',
        localDir: 'public/img/profile',
        cloudinaryFolder: 'cattake/profiles'
    },
    {
        table: 'detail_user_shelter',
        column: 'shelter_picture',
        localDir: 'public/img/profile',
        cloudinaryFolder: 'cattake/profiles'
    },
    {
        table: 'detail_user_shelter',
        column: 'qr_img',
        localDir: 'public/img/qr_img',
        cloudinaryFolder: 'cattake/payments'
    },
    {
        table: 'donations',
        column: 'proof_file',
        localDir: 'public/img/proof_payment',
        cloudinaryFolder: 'cattake/payments'
    },
    {
        table: 'lost_cats',
        column: 'photo',
        localDir: 'public/img/lost_cat',
        cloudinaryFolder: 'cattake/lost_cats'
    },
    {
        table: 'community_post', // SEBELUMNYA: 'posts'
        column: 'media_path',
        localDir: 'public/img/post',
        cloudinaryFolder: 'cattake/posts'
    },
    {
        table: 'detail_user_individu',
        column: 'ktp_file_path',
        localDir: 'public/img/identity',
        cloudinaryFolder: 'cattake/legal'
    },
    {
        table: 'adoptions',
        column: 'statement_letter_path',
        localDir: 'public/docs/stmt',
        cloudinaryFolder: 'cattake/statements'
    },
    {
        table: 'reports',
        column: 'photo',
        localDir: 'public/img/report_cat',
        cloudinaryFolder: 'cattake/reports'
    },
    {
        table: 'rescue_assignments',
        column: 'pickup_photo',
        localDir: 'public/img/rescue_proof',
        cloudinaryFolder: 'cattake/rescue'
    },
    {
        table: 'rescue_assignments',
        column: 'dropoff_photo',
        localDir: 'public/img/rescue_proof',
        cloudinaryFolder: 'cattake/rescue'
    }
];

async function migrate() {
    console.log("🚀 Memulai Migrasi Data ke Cloudinary...");

    for (const cfg of migrationConfig) {
        console.log(`\n--- Mengolah Tabel: ${cfg.table} (${cfg.column}) ---`);
        
        try {
            // 1. Ambil data yang belum migrasi (yang belum punya prefix http)
            const { rows } = await db.query(
                `SELECT id, ${cfg.column} FROM ${cfg.table} WHERE ${cfg.column} IS NOT NULL AND ${cfg.column} NOT LIKE 'http%'`
            );

            console.log(`Ditemukan ${rows.length} data yang perlu dimigrasi.`);

            for (const row of rows) {
                const fileName = row[cfg.column];
                const localFilePath = path.join(__dirname, cfg.localDir, fileName);

                if (fs.existsSync(localFilePath)) {
                    try {
                        console.log(`Mengupload: ${fileName}...`);
                        const buffer = fs.readFileSync(localFilePath);
                        
                        // 2. Upload ke Cloudinary
                        const result = await uploadToCloudinary(buffer, cfg.cloudinaryFolder);
                        const newUrl = result.secure_url;

                        // 3. Update Database
                        await db.query(
                            `UPDATE ${cfg.table} SET ${cfg.column} = $1 WHERE id = $2`,
                            [newUrl, row.id]
                        );
                        console.log(`✅ Sukses: ${row.id} -> ${newUrl}`);
                    } catch (uploadErr) {
                        console.error(`❌ Gagal upload ${fileName}:`, uploadErr.message);
                    }
                } else {
                    console.warn(`⚠️ File tidak ditemukan di lokal: ${localFilePath}`);
                }
            }
        } catch (dbErr) {
            console.error(`❌ Error pada tabel ${cfg.table}:`, dbErr.message);
        }
    }

    console.log("\n✨ Migrasi Selesai!");
    process.exit();
}

migrate();
