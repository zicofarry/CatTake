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
            data.amount, 
            data.is_anonymus,
            data.payment_method,
            data.proof_file 
        ];

        const result = await db.query(query, values);

        const updateCounterQuery = `
            UPDATE detail_user_individu
            SET donasi_history_count = donasi_history_count + 1
            WHERE id = $1
        `;
        await db.query(updateCounterQuery, [data.donatur_id]);
        return result.rows[0];
    }

    // [PERBAIKAN] Fungsi untuk mengambil riwayat donasi milik user login
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

    // 2. Ambil List Donasi Berdasarkan Shelter
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
        
        return result.rows.map(row => {
            let pic = row.donorPhoto;
            if (pic === '/img/NULL.JPG' || pic === 'NULL.JPG' || !pic) {
                pic = '/img/NULL.JPG'; 
            } else if (pic.startsWith('http')) {
                // pic tetap
            } else {
                pic = `/public/img/profile/${pic}`;
            }

            return {
                id: row.id,
                amount: parseFloat(row.amount),
                donorName: row.donorName,
                profilePic: pic,
                dateTime: new Date(row.donation_date).toLocaleString('id-ID'),
                paymentMethod: row.payment_method,
                proofFile: row.proof_file
            };
        });
    }
}

module.exports = DonationService;