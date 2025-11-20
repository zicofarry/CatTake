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

        const result = await db.query(query, values);
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
                -- Ambil nama donatur (jika tidak anonim)
                CASE 
                    WHEN d.is_anonymus = true THEN 'Hamba Allah'
                    ELSE dui.full_name 
                END as "donorName",
                -- Ambil foto profil donatur (jika tidak anonim)
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
        return result.rows.map(row => ({
            id: row.id,
            amount: parseFloat(row.amount),
            donorName: row.donorName,
            profilePic: row.donorPhoto.startsWith('http') ? row.donorPhoto : `/img/${row.donorPhoto}`, // Sesuaikan path statis
            dateTime: new Date(row.donation_date).toLocaleString('id-ID'),
            paymentMethod: row.payment_method,
            proofFile: row.proof_file
        }));
    }
}

module.exports = DonationService;
