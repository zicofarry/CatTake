const db = require('../config/db');

class UserService {
    static async getProfile(userId, role) {
        let query;

        if (role === 'individu') {
            query = `
                SELECT 
                    u.email,
                    d.full_name AS name,
                    d.profile_picture AS photo,
                    d.contact_phone,
                    d.address
                FROM users u
                JOIN detail_user_individu d ON u.id = d.id
                WHERE u.id = $1
            `;
        } else if (role === 'shelter') {
            query = `
                SELECT 
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

        // Tentukan tabel dan kolom yang akan di-update
        let tableName;
        let fields = [];
        let values = [];
        let i = 1;

        // Tambahkan UPDATE ke tabel detail (detail_user_individu/shelter)
        if (role === 'individu') {
            tableName = 'detail_user_individu';
            
            // Cek dan masukkan field individu
            if (data.full_name) { fields.push(`full_name = $${i++}`); values.push(data.full_name); }
            if (data.birth_date) { fields.push(`birth_date = $${i++}`); values.push(data.birth_date); }
            if (data.gender) { fields.push(`gender = $${i++}`); values.push(data.gender); }
            if (data.bio) { fields.push(`bio = $${i++}`); values.push(data.bio); }
            // Note: Field profile_picture (photo upload) perlu penanganan multipart/form-data terpisah
        } 
        // ELSE IF (role === 'shelter') { ... update detail_user_shelter }
        // ...

        if (fields.length === 0) {
            return { message: 'No data to update.' };
        }

        // Tambahkan userId ke array values untuk klausa WHERE
        values.push(userId); 

        // Buat query UPDATE dinamis
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

        // Jika full_name diubah, update juga di tabel users (untuk username/nama tampilan utama jika diperlukan)
        // const updateUsersTable = await db.query('UPDATE users SET username = $1 WHERE id = $2', [data.full_name, userId]);

        return result.rows[0];
    }
}

module.exports = UserService;
