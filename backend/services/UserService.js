const db = require('../config/db');

class UserService {
    static async getProfile(userId, role) {
        let query;

        if (role === 'individu') {
            query = `
                SELECT 
                    u.id AS id,
                    u.email,
                    d.full_name AS name,
                    d.profile_picture AS photo,
                    d.contact_phone,
                    d.address,
                    d.bio,
                    d.birth_date,
                    d.gender
                FROM users u
                JOIN detail_user_individu d ON u.id = d.id
                WHERE u.id = $1
            `;
        } else if (role === 'shelter') {
            query = `
                SELECT
                    u.id AS id,
                    u.email,
                    d.shelter_name AS name,
                    d.shelter_picture AS photo,
                    d.contact_phone
                FROM users u
                JOIN detail_user_shelter d ON u.id = d.id
                WHERE u.id = $1
            `;
        } else {
            // Untuk Admin/Driver/guest, hanya kembalikan ID dan role
            return { id: userId, role };
        }

        const result = await db.query(query, [userId]);
        if (result.rows.length === 0) {
            throw new Error('Profile not found.');
        }
        let profileData = result.rows[0]; // Ambil data mentah dari DB

        // 🛑 KOREKSI LOGIKA PATH GAMBAR DI SINI
        const BASE_IMAGE_URL = '/img/';
        
        if (profileData.photo) {
            // Menggabungkan path file dari DB dengan BASE_IMAGE_URL
            profileData.photo = `${BASE_IMAGE_URL}${profileData.photo}`;
        }
        // Jika profileData.photo adalah NULL atau string kosong, kita biarkan saja.
        // Frontend akan menggunakan fallback 'diana.png'.
        // ------------------------------------

        // Gabungkan hasil query dengan role dari JWT
        return { ...profileData, role };
    }

    static async updateProfile(userId, role, data) {
        if (role === 'guest') {
            throw new Error('Unauthorized.');
        }

        let tableName;
        let fields = [];
        let values = [];
        let i = 1;

        if (role === 'individu') {
            tableName = 'detail_user_individu';
            
            // PERBAIKAN: Gunakan (!== undefined) agar perubahan terbaca meski string kosong
            if (data.full_name !== undefined) { fields.push(`full_name = $${i++}`); values.push(data.full_name); }
            if (data.birth_date !== undefined) { fields.push(`birth_date = $${i++}`); values.push(data.birth_date); }
            if (data.gender !== undefined) { fields.push(`gender = $${i++}`); values.push(data.gender); }
            if (data.bio !== undefined) { fields.push(`bio = $${i++}`); values.push(data.bio); }
            
        } else if (role === 'shelter') {
            tableName = 'detail_user_shelter';
            
            if (data.full_name !== undefined) { fields.push(`shelter_name = $${i++}`); values.push(data.full_name); }
            if (data.bio !== undefined) { fields.push(`bio = $${i++}`); values.push(data.bio); }
            if (data.contact_phone !== undefined) { fields.push(`contact_phone = $${i++}`); values.push(data.contact_phone); }
        }

        if (fields.length === 0) {
            return { message: 'No data to update.' };
        }

        values.push(userId); 

        const updateQuery = `
            UPDATE ${tableName} 
            SET ${fields.join(', ')} 
            WHERE id = $${i} 
            RETURNING *;
        `;

        const result = await db.query(updateQuery, values);

        if (result.rowCount === 0) {
            throw new Error(`User detail for ID ${userId} not found.`);
        }

        return result.rows[0];
    }

    static async getAllShelters() {
        // Ambil ID dan Nama Shelter dari tabel detail_user_shelter
        const query = `
            SELECT id, shelter_name 
            FROM detail_user_shelter
            ORDER BY shelter_name ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = UserService;
