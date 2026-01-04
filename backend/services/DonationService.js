// backend/services/DonationService.js
const db = require('../config/db');

class DonationService {
    
    // 1. Simpan Data Donasi Baru
    static async createDonation(data) {
        const query = `
            INSERT INTO donations (
                donatur_id, shelter_id, amount, 
                donation_date, is_anonymus, 
                payment_method, proof_file
            ) 
            VALUES ($1, $2, $3, NOW(), $4, $5, $6)
            RETURNING id
        `;
        
        const values = [
            data.donatur_id, 
            data.shelter_id, 
            data.amount, // Pastikan dikirim sebagai angka/float
            data.is_anonymus,
            data.payment_method,
            data.proof_file // Hanya nama filenya saja, misal: 'bukti-123.jpg'
        ];

        // 1. Eksekusi Insert Donasi
        const result = await db.query(query, values);

        // 2. [TAMBAHAN] Update Counter di tabel detail user
        // Tambahkan 1 ke donasi_history_count milik user tersebut
        const updateCounterQuery = `
            UPDATE detail_user_individu
            SET donasi_history_count = donasi_history_count + 1
            WHERE id = $1
        `;
        await db.query(updateCounterQuery, [data.donatur_id]);
        return result.rows[0];
    }

    // 2. Ambil List Donasi Berdasarkan Shelter (Untuk Halaman Dashboard Shelter)
    static async getDonationsByShelter(shelterId) {
        const query = `
            SELECT 
                d.id,
                d.amount,
                d.donation_date,
                d.is_anonymus,
                d.payment_method,
                d.proof_file,
                CASE 
                    WHEN d.is_anonymus = true THEN 'Hamba Allah'
                    ELSE dui.full_name 
                END as "donorName",
                CASE 
                    WHEN d.is_anonymus = true THEN '/img/NULL.JPG'
                    ELSE COALESCE(dui.profile_picture, 'NULL.JPG')
                END as "donorPhoto"
            FROM donations d
            JOIN users u ON d.donatur_id = u.id
            LEFT JOIN detail_user_individu dui ON u.id = dui.id
            WHERE d.shelter_id = $1
            ORDER BY d.donation_date DESC
        `;

        const result = await db.query(query, [shelterId]);
        
        // Formatting untuk Frontend
        return result.rows.map(row => {
            let pic = row.donorPhoto;

            // LOGIKA BARU: Menentukan Path Gambar yang Benar
            // 1. Jika Anonymous atau string 'NULL.JPG', gunakan default frontend
            if (pic === '/img/NULL.JPG' || pic === 'NULL.JPG' || !pic) {
                pic = '/img/NULL.JPG'; 
            } 
            // 2. Jika URL Eksternal (Google Login, dll), biarkan
            else if (pic.startsWith('http')) {
                // pic tetap
            }
            // 3. Jika nama file biasa (upload user), arahkan ke folder public Backend
            //    Pastikan tidak double slash jika sudah ada prefix
            else {
                pic = `/public/img/profile/${pic}`;
            }

            return {
                id: row.id,
                amount: parseFloat(row.amount),
                donorName: row.donorName,
                profilePic: pic, // Path sudah diperbaiki
                dateTime: new Date(row.donation_date).toLocaleString('id-ID'),
                paymentMethod: row.payment_method,
                proofFile: row.proof_file
            };
        });
    }

    static async getUserDonations(userId) {
        const query = `
            SELECT 
                d.id,
                d.amount,
                d.donation_date,
                d.payment_method,
                COALESCE(dui.full_name, 'Shelter') as "shelterName"
            FROM donations d
            LEFT JOIN detail_user_individu dui ON d.shelter_id = dui.id
            WHERE d.donatur_id = $1
            ORDER BY d.donation_date DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }
}

module.exports = DonationService;
