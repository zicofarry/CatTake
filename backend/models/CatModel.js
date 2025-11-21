const db = require('../config/db'); // Sesuaikan path koneksi db kamu

class CatModel {

    // 1. FUNGSI TOGGLE (LIKE / UNLIKE)
    static async toggleFavorite(userId, catId) {
        // Cek dulu apakah sudah ada di tabel favorite_cats?
        const checkQuery = `SELECT 1 FROM favorite_cats WHERE user_id = $1 AND cat_id = $2`;
        const checkResult = await db.query(checkQuery, [userId, catId]);

        if (checkResult.rows.length > 0) {
            // Kalau ada -> HAPUS (Unlike)
            await db.query(`DELETE FROM favorite_cats WHERE user_id = $1 AND cat_id = $2`, [userId, catId]);
            return false; // Status sekarang: Tidak dilike
        } else {
            // Kalau belum ada -> TAMBAH (Like)
            // created_at diset NOW()
            await db.query(`INSERT INTO favorite_cats (user_id, cat_id, created_at) VALUES ($1, $2, NOW())`, [userId, catId]);
            return true; // Status sekarang: Dilike
        }
    }

    // 2. FUNGSI GET ALL CATS (Dengan status Favorite)
    // userId dibutuhkan untuk mengecek apakah user INI me-like kucing tersebut
    static async getAllCatsWithUserStatus(currentUserId) {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.age,
                c.gender,
                c.image_url,
                c.shelter_id,
                
                -- LOGIC PENTING: Cek status favorite
                CASE 
                    WHEN f.user_id IS NOT NULL THEN true 
                    ELSE false 
                END AS "isFavorited"

            FROM cats c
            -- Join ke tabel favorite_cats TAPI khusus untuk user yang sedang login ($1)
            LEFT JOIN favorite_cats f ON c.id = f.cat_id AND f.user_id = $1
            
            WHERE c.is_adopted = false
            ORDER BY c.created_at DESC
        `;

        // Jika user tidak login (currentUserId null), query tetap jalan tapi isFavorited false semua
        const result = await db.query(query, [currentUserId || null]);
        return result.rows;
    }
}

module.exports = CatModel;
