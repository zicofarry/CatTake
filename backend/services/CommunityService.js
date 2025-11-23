const db = require('../config/db');

class CommunityService {
    
    // 1. Ambil Semua Postingan
    static async getAllPosts(currentUserId) {
        const query = `
            SELECT 
                p.id, p.title, p.content, p.media_path, p.likes_count, p.created_at,
                u.username, d.full_name, ds.shelter_name, d.profile_picture,
                (SELECT COUNT(*) FROM "comment" c WHERE c.post_id = p.id) AS total_comments,
                CASE 
                    WHEN pl.user_id IS NOT NULL THEN true 
                    ELSE false 
                END AS "isLiked"
            FROM community_post p
            JOIN users u ON p.author_id = u.id
            LEFT JOIN detail_user_individu d ON u.id = d.id
            LEFT JOIN detail_user_shelter ds ON u.id = ds.id
            LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = $1
            ORDER BY p.created_at DESC
        `;

        const result = await db.query(query, [currentUserId || null]);

        return result.rows.map(row => {
            let profilePath = row.profile_picture;
            if (!profilePath || profilePath === 'NULL.JPG') profilePath = '/img/NULL.JPG';
            else if (!profilePath.startsWith('http') && !profilePath.startsWith('/img/')) profilePath = `/public/img/profile/${profilePath}`;

            let postPath = row.media_path;
            if (postPath) postPath = `/public/img/${postPath}`;

            return {
                id: row.id,
                community: 'CatLover Umum',
                author: row.full_name || row.shelter_name || row.username,
                time: new Date(row.created_at).toLocaleDateString('id-ID'),
                title: row.title || (row.content.substring(0, 30) + '...'),
                excerpt: row.content.substring(0, 60) + '...',
                description: row.content,
                profileImg: profilePath,
                postImg: postPath,
                likes: row.likes_count,
                comments: row.total_comments,
                isLiked: row.isLiked
            };
        });
    }

    // 2. Ambil Detail Postingan (UPDATE: Logika Waktu Edit)
    static async getPostById(postId) {
        // A. Ambil Data Post
        const postQuery = `
            SELECT 
                p.id, p.title, p.content, p.media_path, p.likes_count, p.created_at,
                u.username, d.full_name, d.profile_picture
            FROM community_post p
            JOIN users u ON p.author_id = u.id
            LEFT JOIN detail_user_individu d ON u.id = d.id
            WHERE p.id = $1
        `;
        const postResult = await db.query(postQuery, [postId]);
        if (postResult.rows.length === 0) throw new Error('Post not found');
        const row = postResult.rows[0];

        // B. Ambil Komentar Utama (Tambah field updated_at)
        const commentQuery = `
            SELECT c.id, c.content, c.created_at, c.updated_at, u.id as user_id, u.username, d.full_name, d.profile_picture
            FROM "comment" c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN detail_user_individu d ON u.id = d.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `;
        const commentResult = await db.query(commentQuery, [postId]);

        // C. Ambil Balasan (Tambah field updated_at)
        let allReplies = [];
        if (commentResult.rows.length > 0) {
            const commentIds = commentResult.rows.map(c => c.id);
            const replyQuery = `
                SELECT r.id, r.comment_id, r.parent_reply_id, r.content, r.created_at, r.updated_at, u.id as user_id, u.username, d.full_name, d.profile_picture
                FROM reply_comment r
                JOIN users u ON r.user_id = u.id
                LEFT JOIN detail_user_individu d ON u.id = d.id
                WHERE r.comment_id = ANY($1::int[])
                ORDER BY r.created_at ASC
            `;
            const replyResult = await db.query(replyQuery, [commentIds]);
            allReplies = replyResult.rows;
        }

        // Helper: Format Waktu (Cek Edit)
        const formatTime = (createdAt, updatedAt) => {
            const created = new Date(createdAt);
            const updated = new Date(updatedAt);
            
            // Jika selisih updated dan created lebih dari 2 detik, anggap sudah diedit
            // (2000ms toleransi untuk eksekusi server saat insert awal)
            if (updated - created > 2000) {
                return `Diupdate pada: ${updated.toLocaleString('id-ID')}`;
            }
            return created.toLocaleString('id-ID');
        };

        // D. Helper Tree
        const buildReplyTree = (replies, parentId = null) => {
            return replies
                .filter(r => r.parent_reply_id === parentId)
                .map(r => {
                    let repProfile = r.profile_picture;
                    if (!repProfile || repProfile === 'NULL.JPG') repProfile = '/img/NULL.JPG';
                    else if (!repProfile.startsWith('http')) repProfile = `/public/img/profile/${repProfile}`;

                    return {
                        id: r.id,
                        comment_id: r.comment_id,
                        userId: r.user_id,
                        user: r.full_name || r.username,
                        profileImg: repProfile,
                        text: r.content,
                        time: formatTime(r.created_at, r.updated_at), // <--- PAKAI HELPER
                        replies: buildReplyTree(replies, r.id)
                    };
                });
        };

        // E. Mapping Komentar
        const commentsWithReplies = commentResult.rows.map(c => {
            const rootRepliesForThisComment = allReplies.filter(r => r.comment_id === c.id);
            
            let comProfile = c.profile_picture;
            if (!comProfile || comProfile === 'NULL.JPG') comProfile = '/img/NULL.JPG';
            else if (!comProfile.startsWith('http')) comProfile = `/public/img/profile/${comProfile}`;

            return {
                id: c.id,
                userId: c.user_id,
                user: c.full_name || c.username,
                profileImg: comProfile,
                text: c.content,
                time: formatTime(c.created_at, c.updated_at), // <--- PAKAI HELPER
                replies: buildReplyTree(rootRepliesForThisComment, null) 
            };
        });

        // Format Profile Post Author
        let profilePath = row.profile_picture;
        if (!profilePath || profilePath === 'NULL.JPG') profilePath = '/img/NULL.JPG';
        else if (!profilePath.startsWith('http')) profilePath = `/public/img/profile/${profilePath}`;

        return {
            id: row.id,
            community: 'CatLover Umum',
            author: row.full_name || row.username,
            time: new Date(row.created_at).toLocaleString('id-ID'),
            title: row.title,
            description: row.content,
            profileImg: profilePath,
            postImg: row.media_path ? `/public/img/${row.media_path}` : null,
            likes: row.likes_count,
            comments: commentResult.rowCount,
            commentData: commentsWithReplies
        };
    }

    // (CREATE POST, COMMENT, REPLY )
    static async createPost(userId, title, content, mediaPath) {
        const query = `INSERT INTO community_post (author_id, title, content, media_path, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`;
        const result = await db.query(query, [userId, title, content, mediaPath]);
        return result.rows[0];
    }
    static async addComment(userId, postId, content) {
        const query = `INSERT INTO "comment" (user_id, post_id, content, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, content`;
        const result = await db.query(query, [userId, postId, content]);
        return result.rows[0];
    }
    static async addReply(userId, commentId, content, parentReplyId = null) {
        const query = `INSERT INTO reply_comment (user_id, comment_id, content, parent_reply_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, content, created_at`;
        const result = await db.query(query, [userId, commentId, content, parentReplyId]);
        return result.rows[0];
    }

    // === EDIT & DELETE ===

    static async updateComment(userId, commentId, content) {
        // Saat update, updated_at di-set NOW()
        const query = `UPDATE "comment" SET content = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *`;
        const result = await db.query(query, [content, commentId, userId]);
        if (result.rows.length === 0) throw new Error('Gagal update: Komentar tidak ditemukan atau bukan milik Anda.');
        return result.rows[0];
    }

    static async deleteComment(userId, commentId) {
        const query = `DELETE FROM "comment" WHERE id = $1 AND user_id = $2 RETURNING id`;
        const result = await db.query(query, [commentId, userId]);
        if (result.rows.length === 0) throw new Error('Gagal hapus: Komentar tidak ditemukan atau bukan milik Anda.');
        return true;
    }

    static async updateReply(userId, replyId, content) {
        // Saat update, updated_at di-set NOW()
        const query = `UPDATE reply_comment SET content = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *`;
        const result = await db.query(query, [content, replyId, userId]);
        if (result.rows.length === 0) throw new Error('Gagal update: Balasan tidak ditemukan atau bukan milik Anda.');
        return result.rows[0];
    }

    static async deleteReply(userId, replyId) {
        const query = `DELETE FROM reply_comment WHERE id = $1 AND user_id = $2 RETURNING id`;
        const result = await db.query(query, [replyId, userId]);
        if (result.rows.length === 0) throw new Error('Gagal hapus: Balasan tidak ditemukan atau bukan milik Anda.');
        return true;
    }

    // (Toggle Like & Sidebar)
    static async toggleLike(userId, postId) {
        const checkQuery = `SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2`;
        const check = await db.query(checkQuery, [userId, postId]);
        let isLiked = false;
        try {
            await db.query('BEGIN');
            if (check.rows.length > 0) {
                await db.query(`DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2`, [userId, postId]);
                await db.query(`UPDATE community_post SET likes_count = likes_count - 1 WHERE id = $1`, [postId]);
                isLiked = false;
            } else {
                await db.query(`INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)`, [userId, postId]);
                await db.query(`UPDATE community_post SET likes_count = likes_count + 1 WHERE id = $1`, [postId]);
                isLiked = true;
            }
            await db.query('COMMIT');
            const countQuery = `SELECT likes_count FROM community_post WHERE id = $1`;
            const countRes = await db.query(countQuery, [postId]);
            return { isLiked, likesCount: countRes.rows[0].likes_count };
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }

    static async getUpcomingEvents() {
        const query = `SELECT title, event_date, start_time, location_name FROM events WHERE is_active = true AND event_date >= CURRENT_DATE ORDER BY event_date ASC LIMIT 3`;
        const result = await db.query(query);
        return result.rows.map(e => ({
            title: e.title,
            date: new Date(e.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'}),
            time: `Pukul ${e.start_time.substring(0, 5)} WIB`,
            location: e.location_name
        }));
    }

    static async getPopularPosts() {
        const query = `SELECT id, title, content, media_path FROM community_post ORDER BY likes_count DESC LIMIT 3`;
        const result = await db.query(query);
        return result.rows.map(p => ({
            id: p.id,
            title: p.title || (p.content.substring(0, 40) + '...'),
            image: p.media_path ? `/public/img/${p.media_path}` : '/img/postinganPopuler1.png'
        }));
    }

    static async getRandomFact() {
        const query = `SELECT fact_text, image_path FROM cat_facts ORDER BY RANDOM() LIMIT 1`;
        const result = await db.query(query);
        if (result.rows.length === 0) return null;
        return { fact: result.rows[0].fact_text, image: result.rows[0].image_path ? `/img/${result.rows[0].image_path}` : '/img/logoFaktaKucing.png' };
    }

    static async getAllFacts() {
        const query = `SELECT id, fact_text, source, image_path FROM cat_facts ORDER BY id ASC`;
        const result = await db.query(query);
        return result.rows.map(f => ({
            id: f.id,
            title: f.source ? f.source : 'Tahukah Kamu?', 
            fact: f.fact_text,
            image: f.image_path ? `/img/${f.image_path}` : '/img/logoFaktaKucing.png'
        }));
    }
}

module.exports = CommunityService;