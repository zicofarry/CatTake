const db = require('../config/db'); // Sesuaikan path koneksi db kamu

class CatModel {
    static async create(data) {
        const query = `
            INSERT INTO cats (
                shelter_id, name, breed, age, gender, 
                health_status, description, adoption_status, photo
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            data.shelter_id,
            data.name,
            data.breed,
            data.age,
            data.gender,
            data.health_status,
            data.description,
            data.adoption_status,
            data.photo // Nama file gambar
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // --- QUERY UPDATE ---
    static async update(id, data) {
        // Logika: Jika data.photo (foto baru) ada, update kolom photo. 
        // Jika null, pakai COALESCE atau logika IF di SQL agar foto lama tidak hilang.
        // Di sini kita pakai logika JS sederhana: cek apakah photo ada.
        
        let query, values;

        if (data.photo) {
            // User upload foto baru
            query = `
                UPDATE cats 
                SET name=$1, breed=$2, age=$3, gender=$4, health_status=$5, description=$6, photo=$7
                WHERE id=$8
                RETURNING *
            `;
            values = [data.name, data.breed, data.age, data.gender, data.health_status, data.description, data.photo, id];
        } else {
            // Tidak upload foto baru (Photo tidak diupdate)
            query = `
                UPDATE cats 
                SET name=$1, breed=$2, age=$3, gender=$4, health_status=$5, description=$6
                WHERE id=$7
                RETURNING *
            `;
            values = [data.name, data.breed, data.age, data.gender, data.health_status, data.description, id];
        }

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // --- QUERY DELETE ---
    static async delete(id) {
        const query = `DELETE FROM cats WHERE id = $1 RETURNING id`;
        const result = await db.query(query, [id]);
        return result.rows.length > 0;
    }

    // --- METHOD BARU: GET BY SHELTER ID ---
    static async findByShelterId(shelterId) {
        const query = `
            SELECT * FROM cats 
            WHERE shelter_id = $1 
            ORDER BY 
            CASE 
                WHEN adoption_status = 'available' THEN 0
                ELSE 1
            END,
            id DESC;

        `;
        const result = await db.query(query, [shelterId]);
        return result.rows;
    }

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
                c.photo AS image,
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
