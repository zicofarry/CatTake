// backend/services/LostCatService.js
const db = require('../config/db');

class LostCatService {
    
    // Simpan Laporan Kucing Hilang (Pemilik lapor kucingnya hilang)
    static async createLostCatReport(data) {
        const query = `
            INSERT INTO lost_cats (
                owner_id, name, age, breed, color, 
                description, last_seen_address, 
                last_seen_lat, last_seen_long, 
                photo, reward_amount, status, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'searching', NOW())
            RETURNING id
        `;

        const values = [
            data.owner_id,
            data.name,
            data.age, // Integer (bulan)
            data.breed,
            data.color,
            data.description,
            data.last_seen_address,
            data.last_seen_lat,
            data.last_seen_long,
            data.photo,
            data.reward_amount || 0
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Ambil semua daftar kucing hilang (Untuk halaman list nanti)
    static async getAllLostCats() {
        const query = `
            SELECT 
                lc.*, 
                u.username as owner_name, 
                u.email as owner_contact 
            FROM lost_cats lc
            JOIN users u ON lc.owner_id = u.id
            WHERE lc.status = 'searching'
            ORDER BY lc.created_at DESC
        `;
        const result = await db.query(query);
        
        // Format URL gambar
        return result.rows.map(cat => ({
            ...cat,
            photo: cat.photo ? `/public/report_cat/${cat.photo}` : '/img/NULL.JPG'
        }));
    }

    static async searchLostCats(keyword) {
        const query = `
            SELECT 
                lc.id, 
                lc.name AS cat_name, 
                lc.photo,
                COALESCE(dui.full_name, u.username) AS owner_name
            FROM lost_cats lc
            JOIN users u ON lc.owner_id = u.id
            LEFT JOIN detail_user_individu dui ON u.id = dui.id
            WHERE lc.status = 'searching' 
            AND (lc.name ILIKE $1 OR dui.full_name ILIKE $1)
            LIMIT 5
        `;
        // ILIKE = Case insensitive search (PostgreSQL)
        const result = await db.query(query, [`%${keyword}%`]);
        
        return result.rows.map(row => ({
            id: row.id,
            cat_name: row.cat_name,
            owner_name: row.owner_name,
            photo: row.photo ? `/img/${row.photo}` : '/img/NULL.JPG'
        }));
    }
}

module.exports = LostCatService;
