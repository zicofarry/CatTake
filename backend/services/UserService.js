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
}

module.exports = UserService;
