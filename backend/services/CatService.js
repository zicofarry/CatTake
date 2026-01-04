const db = require('../config/db');

class CatService {
    // 1. Ambil semua kucing available (Dengan status isFavorited)
    static async getAvailableCats(currentUserId) {
        const query = `
            SELECT 
                c.id, 
                c.name, 
                c.age AS age_months,
                c.gender, 
                c.breed,
                c.photo AS image,
                c.description,
                c.adoption_status,
                d.is_verified_shelter,
                d.shelter_name AS shelter,
                
                -- LOGIKA BARU: Cek apakah user ini sudah me-like kucing ini?
                CASE 
                    WHEN f.user_id IS NOT NULL THEN true 
                    ELSE false 
                END AS "isFavorited"

            FROM cats c
            JOIN users u ON c.shelter_id = u.id
            JOIN detail_user_shelter d ON u.id = d.id
            
            -- JOIN ke tabel favorite_cats khusus untuk user yang sedang login ($1)
            LEFT JOIN favorite_cats f ON c.id = f.cat_id AND f.user_id = $1
            
            WHERE c.adoption_status = 'available'
            ORDER BY c.id DESC
        `;
        
        // Masukkan parameter currentUserId (bisa null jika user belum login)
        const result = await db.query(query, [currentUserId || null]);
        
        // Format data agar sesuai dengan Frontend
        return result.rows.map(cat => ({
            ...cat,
            age: `${cat.age_months} Bulan`, // Format umur string
            // isFavorited sudah otomatis boolean (true/false) dari query di atas
        }));
    }

    // 2. Ambil detail satu kucing (Opsional, sesuaikan jika perlu)
    static async getCatById(id) {
        const query = `
            SELECT c.*, d.shelter_name 
            FROM cats c
            JOIN detail_user_shelter d ON c.shelter_id = d.id
            WHERE c.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    // 3. Ambil daftar kucing yang sudah diadopsi (Untuk Hall of Fame Homepage)
    static async getAdoptedCats() {
        const query = `
            SELECT * FROM (
                SELECT DISTINCT ON (c.id)
                    c.id, 
                    c.name, 
                    c.breed, 
                    c.photo,
                    COALESCE(dui.full_name, u.username) AS adopter_name,
                    a.updated_at
                FROM cats c
                JOIN adoptions a ON c.id = a.cat_id
                JOIN users u ON a.applicant_id = u.id
                LEFT JOIN detail_user_individu dui ON u.id = dui.id
                WHERE c.adoption_status = 'adopted' 
                AND a.status IN ('approved', 'completed')
                ORDER BY c.id, a.updated_at DESC
            ) AS unique_cats
            ORDER BY updated_at DESC
        `;

        const result = await db.query(query);
        
        return result.rows.map(cat => ({
            id: cat.id,
            name: cat.name,
            breed: cat.breed || 'Domestik',
            adopter: cat.adopter_name,
            photo: cat.photo || null 
        }));
    }
}

module.exports = CatService;