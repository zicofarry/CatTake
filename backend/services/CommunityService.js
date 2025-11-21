// backend/services/CommunityService.js
const db = require('../config/db');

class CommunityService {
    
    // 1. Ambil Semua Postingan (untuk CommunityPage.vue)
    static async getAllPosts(currentUserId) {
        const query = `
            SELECT 
                p.id, p.content, p.media_path, p.likes_count, p.created_at,
                u.username, d.full_name, d.profile_picture,
                (SELECT COUNT(*) FROM "comment" c WHERE c.post_id = p.id) AS total_comments,
                -- Cek apakah user yang sedang login sudah like (Return true/false)
                CASE 
                    WHEN pl.user_id IS NOT NULL THEN true 
                    ELSE false 
                END AS "isLiked"
            FROM community_post p
            JOIN users u ON p.author_id = u.id
            LEFT JOIN detail_user_individu d ON u.id = d.id
            -- Join ke tabel likes khusus untuk user ini
            LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = $1
            ORDER BY p.created_at DESC
        `;

        const result = await db.query(query, [currentUserId || null]);

        return result.rows.map(row => ({
            id: row.id,
            community: 'CatLover Umum',
            author: row.full_name || row.username,
            time: new Date(row.created_at).toLocaleDateString('id-ID'),
            title: row.content.substring(0, 30) + (row.content.length > 30 ? '...' : ''),
            excerpt: row.content.substring(0, 60) + (row.content.length > 60 ? '...' : ''),
            description: row.content,
            profileImg: row.profile_picture ? `/img/${row.profile_picture}` : '/img/NULL.JPG',
            postImg: row.media_path ? `/img/${row.media_path}` : null,
            likes: row.likes_count,
            comments: row.total_comments,
            isLiked: row.isLiked // <-- Field baru untuk frontend
        }));
    }

    // 2. Ambil Detail Postingan + Komentar (untuk PostDetailPage.vue)
    static async getPostById(postId) {
        // Ambil Post
        const postQuery = `
            SELECT 
                p.id, p.content, p.media_path, p.likes_count, p.created_at,
                u.username, d.full_name, d.profile_picture
            FROM community_post p
            JOIN users u ON p.author_id = u.id
            LEFT JOIN detail_user_individu d ON u.id = d.id
            WHERE p.id = $1
        `;
        const postResult = await db.query(postQuery, [postId]);
        
        if (postResult.rows.length === 0) throw new Error('Post not found');
        const row = postResult.rows[0];

        // Ambil Komentar
        const commentQuery = `
            SELECT 
                c.id, c.content, c.created_at,
                u.username, d.full_name
            FROM comment c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN detail_user_individu d ON u.id = d.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `;
        const commentResult = await db.query(commentQuery, [postId]);

        return {
            id: row.id,
            community: 'CatLover Umum',
            author: row.full_name || row.username,
            time: new Date(row.created_at).toLocaleString('id-ID'),
            title: row.content.substring(0, 50),
            description: row.content,
            profileImg: row.profile_picture ? `/img/${row.profile_picture}` : '/img/NULL.JPG',
            postImg: row.media_path ? `/img/${row.media_path}` : null,
            likes: row.likes_count,
            comments: commentResult.rowCount,
            commentData: commentResult.rows.map(c => ({
                id: c.id,
                user: c.full_name || c.username,
                text: c.content
            }))
        };
    }

    // 3. Buat Postingan Baru
    static async createPost(userId, content, mediaPath) {
        const query = `
            INSERT INTO community_post (author_id, content, media_path, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id
        `;
        const result = await db.query(query, [userId, content, mediaPath]);
        return result.rows[0];
    }

    // 4. Tambah Komentar
    static async addComment(userId, postId, content) {
        // PERBAIKAN: Tambahkan tanda kutip ganda pada nama tabel "comment"
        const query = `
            INSERT INTO "comment" (user_id, post_id, content, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id, content
        `;
        const result = await db.query(query, [userId, postId, content]);
        return result.rows[0];
    }

    static async toggleLike(userId, postId) {
        // Cek apakah sudah like
        const checkQuery = `SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2`;
        const check = await db.query(checkQuery, [userId, postId]);

        let isLiked = false;

        try {
            await db.query('BEGIN'); // Mulai Transaksi

            if (check.rows.length > 0) {
                // SUDAH LIKE -> UNLIKE (Hapus data & Kurangi counter)
                await db.query(`DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2`, [userId, postId]);
                await db.query(`UPDATE community_post SET likes_count = likes_count - 1 WHERE id = $1`, [postId]);
                isLiked = false;
            } else {
                // BELUM LIKE -> LIKE (Tambah data & Tambah counter)
                await db.query(`INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)`, [userId, postId]);
                await db.query(`UPDATE community_post SET likes_count = likes_count + 1 WHERE id = $1`, [postId]);
                isLiked = true;
            }

            await db.query('COMMIT');
            
            // Kembalikan jumlah like terbaru
            const countQuery = `SELECT likes_count FROM community_post WHERE id = $1`;
            const countRes = await db.query(countQuery, [postId]);
            
            return { 
                isLiked, 
                likesCount: countRes.rows[0].likes_count 
            };

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }

    static async getUpcomingEvents() {
        const query = `
            SELECT title, event_date, start_time, location_name
            FROM events
            WHERE is_active = true AND event_date >= CURRENT_DATE
            ORDER BY event_date ASC
            LIMIT 3
        `;
        const result = await db.query(query);
        
        return result.rows.map(e => ({
            title: e.title,
            // Format tanggal: "15 Oktober 2025"
            date: new Date(e.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'}),
            // Ambil 5 karakter pertama dari waktu (09:00:00 -> 09:00)
            time: `Pukul ${e.start_time.substring(0, 5)} WIB`,
            location: e.location_name
        }));
    }

    // 6. Ambil Postingan Populer (Top 3 by Likes)
    static async getPopularPosts() {
        const query = `
            SELECT id, content, media_path
            FROM community_post
            ORDER BY likes_count DESC
            LIMIT 3
        `;
        const result = await db.query(query);
        return result.rows.map(p => ({
            id: p.id,
            // Judul diambil dari potongan konten
            title: p.content.substring(0, 40) + (p.content.length > 40 ? '...' : ''),
            // Jika tidak ada gambar, pakai placeholder
            image: p.media_path ? `/img/${p.media_path}` : '/img/postinganPopuler1.png'
        }));
    }

    // 7. Ambil 1 Fakta Kucing Acak
    static async getRandomFact() {
        const query = `SELECT fact_text, image_path FROM cat_facts ORDER BY RANDOM() LIMIT 1`;
        const result = await db.query(query);
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return {
            fact: row.fact_text,
            image: row.image_path ? `/img/${row.image_path}` : '/img/logoFaktaKucing.png'
        };
    }
}

module.exports = CommunityService;