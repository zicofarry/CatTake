const db = require('../config/db');

class CatService {
    // 1. Ambil semua kucing yang statusnya 'available' (Untuk User/Guest)
    static async getAvailableCats() {
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
                d.shelter_name AS shelter
            FROM cats c
            JOIN users u ON c.shelter_id = u.id
            JOIN detail_user_shelter d ON u.id = d.id
            WHERE c.adoption_status = 'available'
        `;
        const result = await db.query(query);
        
        // Format data agar sesuai dengan Frontend
        return result.rows.map(cat => ({
            ...cat,
            age: `${cat.age_months} Bulan`, // Format umur
            isFavorite: false // Default
        }));
    }

    // 2. (Opsional) Ambil detail satu kucing
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
}

module.exports = CatService;
