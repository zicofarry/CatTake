const db = require('../config/db');

class ShelterChatModel {
    
    // 1. Simpan Pesan Baru (Tetap sama)
    static async create(senderId, receiverId, message) {
        const query = `
            INSERT INTO shelter_chats (sender_id, receiver_id, message, is_read)
            VALUES ($1, $2, $3, false)
            RETURNING id, sender_id, receiver_id, message, created_at
        `;
        const result = await db.query(query, [senderId, receiverId, message]);
        return result.rows[0];
    }

    // 2. Ambil History Chat (Tetap sama)
    static async getHistory(userId1, userId2) {
        const query = `
            SELECT 
                c.id,
                c.sender_id,
                c.receiver_id,
                c.message,
                c.created_at,
                c.is_read,
                CASE 
                    WHEN c.sender_id = $1 THEN 'me'
                    ELSE 'partner'
                END as position
            FROM shelter_chats c
            WHERE (c.sender_id = $1 AND c.receiver_id = $2)
               OR (c.sender_id = $2 AND c.receiver_id = $1)
            ORDER BY c.created_at ASC
        `;
        const result = await db.query(query, [userId1, userId2]);
        return result.rows;
    }

    // 3. Ambil Daftar Inbox dengan Atribut Asli is_verified / is_verified_shelter
    static async getInboxList(currentUserId) {
        const query = `
            SELECT * FROM (
                SELECT DISTINCT ON (u.id)
                    u.id as partner_id,
                    -- Ambil nama dari shelter atau individu
                    COALESCE(us.shelter_name, up.full_name, u.username) as name,
                    
                    -- LOGIKA FOTO: Ambil shelter_picture jika ada, jika tidak profile_picture
                    COALESCE(us.shelter_picture, up.profile_picture) as profile_photo,
                    
                    c.message as last_message,
                    c.created_at as time,
                    
                    -- Hitung pesan belum dibaca
                    (SELECT COUNT(*) FROM shelter_chats 
                     WHERE sender_id = u.id AND receiver_id = $1 AND is_read = false) as unread,
                    
                    -- MAPPING VERIFIKASI: Gunakan is_verified_shelter atau is_verified
                    -- Dikirim sebagai 'is_official' agar sesuai dengan pengecekan di frontend mobile kamu
                    COALESCE(us.is_verified_shelter, up.is_verified, false) as is_official

                FROM shelter_chats c
                JOIN users u ON (
                    CASE 
                        WHEN c.sender_id = $1 THEN c.receiver_id 
                        ELSE c.sender_id 
                    END = u.id
                )
                LEFT JOIN detail_user_individu up ON u.id = up.id 
                LEFT JOIN detail_user_shelter us ON u.id = us.id
                
                WHERE c.sender_id = $1 OR c.receiver_id = $1
                ORDER BY u.id, c.created_at DESC
            ) as sub
            ORDER BY time DESC
        `;
        const result = await db.query(query, [currentUserId]);
        return result.rows;
    }
}

module.exports = ShelterChatModel;