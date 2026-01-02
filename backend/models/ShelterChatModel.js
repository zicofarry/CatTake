const db = require('../config/db');

class ShelterChatModel {
    
    // 1. Simpan Pesan Baru
    static async create(senderId, receiverId, message) {
        const query = `
            INSERT INTO shelter_chats (sender_id, receiver_id, message, is_read)
            VALUES ($1, $2, $3, false)
            RETURNING id, sender_id, receiver_id, message, created_at
        `;
        const result = await db.query(query, [senderId, receiverId, message]);
        return result.rows[0];
    }

    // 2. Ambil History Chat (Room Chat)
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

    // 3. Ambil Daftar Inbox (Inbox List)
    static async getInboxList(currentUserId) {
        // DISTINCT ON untuk ambil 1 pesan terakhir dari setiap lawan bicara
        const query = `
            SELECT DISTINCT ON (partner_id)
                u.id as partner_id,
                u.username as name,
                up.profile_photo, -- Sesuaikan dengan tabel user profile kamu
                c.message as last_message,
                c.created_at as time,
                (SELECT COUNT(*) FROM shelter_chats 
                 WHERE sender_id = u.id AND receiver_id = $1 AND is_read = false) as unread
            FROM shelter_chats c
            JOIN users u ON (
                CASE 
                    WHEN c.sender_id = $1 THEN c.receiver_id 
                    ELSE c.sender_id 
                END = u.id
            )
            LEFT JOIN user_profiles up ON u.id = up.user_id 
            
            WHERE c.sender_id = $1 OR c.receiver_id = $1
            ORDER BY partner_id, c.created_at DESC
        `;
        const result = await db.query(query, [currentUserId]);
        return result.rows;
    }
}

module.exports = ShelterChatModel;