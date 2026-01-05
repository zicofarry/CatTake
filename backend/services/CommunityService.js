const db = require('../config/db');
const GamificationService = require('./GamificationService');

class CommunityService {
    
    // --- HELPER: Format Waktu dengan Status Edit ---
    static formatTime(createdAt, updatedAt) {
        const created = new Date(createdAt);
        const updated = new Date(updatedAt);
        const opts = { 
            day: 'numeric', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit'
        };

        if (updated - created > 5000) {
            return `Diupdate: ${updated.toLocaleString('id-ID', opts)}`;
        }
        return created.toLocaleString('id-ID', opts);
    }

    // --- HELPER: Resolve Image URL ---
    // Fungsi internal untuk memastikan URL yang dikirim ke frontend benar
    static resolveImage(path, placeholder = '') {
        if (!path || path === 'NULL.JPG' || path === 'null') return placeholder;
        if (path.startsWith('http')) return path;
        // Jika ada data lama yang terselip bukan URL, kita arahkan ke placeholder agar tidak broken
        return placeholder;
    }

    // --- 1. POSTINGAN UTAMA (LIST) ---
    static async getAllPosts(currentUserId) {
        const query = `
            SELECT 
                p.id, p.author_id, p.title, p.content, p.media_path, p.likes_count, 
                p.created_at, p.updated_at,
                u.username, 
                d.full_name, 
                d.profile_picture, 
                d.is_verified,
                ds.shelter_name, 
                ds.is_verified_shelter,
                (
                    (SELECT COUNT(*) FROM "comment" c WHERE c.post_id = p.id) + 
                    (SELECT COUNT(*) FROM reply_comment rc 
                     JOIN "comment" c ON rc.comment_id = c.id 
                     WHERE c.post_id = p.id)
                ) AS total_comments,
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
            return {
                id: row.id,
                authorId: row.author_id,
                author: row.full_name || row.shelter_name || row.username,
                username: row.username,
                time: CommunityService.formatTime(row.created_at, row.updated_at),
                isVerified: (row.is_verified === true) || (row.is_verified_shelter === true),
                title: row.title || (row.content ? row.content.substring(0, 30) + '...' : 'Tanpa Judul'),
                excerpt: row.content ? row.content.substring(0, 60) + '...' : '',
                description: row.content,
                // [FIX] Gunakan resolveImage, tidak perlu prefix path lokal lagi
                profileImg: this.resolveImage(row.profile_picture),
                postImg: row.media_path && row.media_path.startsWith('http') ? row.media_path : null,
                likes: row.likes_count,
                comments: parseInt(row.total_comments),
                isLiked: row.isLiked
            };
        });
    }

    // --- 2. DETAIL POSTINGAN ---
    static async getPostById(postId) {
        const postQuery = `
            SELECT 
                p.id, p.author_id, p.title, p.content, p.media_path, p.likes_count, 
                p.created_at, p.updated_at,
                u.username, d.full_name, d.profile_picture
            FROM community_post p
            JOIN users u ON p.author_id = u.id
            LEFT JOIN detail_user_individu d ON u.id = d.id
            WHERE p.id = $1
        `;
        const postResult = await db.query(postQuery, [postId]);
        if (postResult.rows.length === 0) throw new Error('Post not found');
        const row = postResult.rows[0];

        const commentQuery = `
            SELECT c.id, c.content, c.created_at, c.updated_at, u.id as user_id, u.username, d.full_name, d.profile_picture
            FROM "comment" c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN detail_user_individu d ON u.id = d.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `;
        const commentResult = await db.query(commentQuery, [postId]);

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

        const buildReplyTree = (replies, parentId = null) => {
            return replies
                .filter(r => r.parent_reply_id === parentId)
                .map(r => ({
                    id: r.id,
                    comment_id: r.comment_id,
                    userId: r.user_id,
                    user: r.full_name || r.username,
                    // [FIX] Bersihkan path
                    profileImg: this.resolveImage(r.profile_picture),
                    text: r.content,
                    time: this.formatTime(r.created_at, r.updated_at), 
                    replies: buildReplyTree(replies, r.id)
                }));
        };

        const commentsWithReplies = commentResult.rows.map(c => {
            const rootRepliesForThisComment = allReplies.filter(r => r.comment_id === c.id);
            return {
                id: c.id,
                userId: c.user_id,
                user: c.full_name || c.username,
                // [FIX] Bersihkan path
                profileImg: this.resolveImage(c.profile_picture),
                text: c.content,
                time: this.formatTime(c.created_at, c.updated_at),
                replies: buildReplyTree(rootRepliesForThisComment, null) 
            };
        });

        return {
            id: row.id,
            authorId: row.author_id,
            author: row.full_name || row.username,
            username: row.username,
            time: this.formatTime(row.created_at, row.updated_at),
            title: row.title,
            description: row.content,
            // [FIX] Bersihkan path
            profileImg: this.resolveImage(row.profile_picture),
            postImg: row.media_path && row.media_path.startsWith('http') ? row.media_path : null,
            likes: row.likes_count,
            comments: commentResult.rowCount + allReplies.length,
            commentData: commentsWithReplies
        };
    }

    // --- 3. CREATE & INTERACTION ---
    // (createPost, updatePost, deletePost, dll tetap sama karena hanya handle DB ID/Content)
    static async createPost(userId, title, content, mediaPath) {
        const query = `INSERT INTO community_post (author_id, title, content, media_path, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`;
        const result = await db.query(query, [userId, title, content, mediaPath]);
        return result.rows[0];
    }

    static async updatePost(userId, postId, title, content) {
        const query = `UPDATE community_post SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND author_id = $4 RETURNING id`;
        const result = await db.query(query, [title, content, postId, userId]);
        if (result.rows.length === 0) throw new Error('Gagal update atau bukan milik Anda.');
        return result.rows[0];
    }

    static async deletePost(userId, postId) {
        const query = `DELETE FROM community_post WHERE id = $1 AND author_id = $2 RETURNING *`;
        const result = await db.query(query, [postId, userId]);
        if (result.rows.length === 0) throw new Error('Gagal hapus.');
        return result.rows[0];
    }

    static async addComment(userId, postId, content) {
        const query = `INSERT INTO "comment" (user_id, post_id, content, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, content`;
        const result = await db.query(query, [userId, postId, content]);
        return result.rows[0];
    }

    static async addReply(userId, commentId, content, parentReplyId = null) {
        const query = `INSERT INTO reply_comment (user_id, comment_id, content, parent_reply_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, content`;
        const result = await db.query(query, [userId, commentId, content, parentReplyId]);
        return result.rows[0];
    }

    static async updateComment(userId, commentId, content) {
        const query = `UPDATE "comment" SET content = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *`;
        const result = await db.query(query, [content, commentId, userId]);
        if (result.rows.length === 0) throw new Error('Gagal update.');
        return result.rows[0];
    }

    static async deleteComment(userId, commentId) {
        const query = `DELETE FROM "comment" WHERE id = $1 AND user_id = $2 RETURNING id`;
        await db.query(query, [commentId, userId]);
        return true;
    }

    static async updateReply(userId, replyId, content) {
        const query = `UPDATE reply_comment SET content = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *`;
        const result = await db.query(query, [content, replyId, userId]);
        if (result.rows.length === 0) throw new Error('Gagal update.');
        return result.rows[0];
    }

    static async deleteReply(userId, replyId) {
        const query = `DELETE FROM reply_comment WHERE id = $1 AND user_id = $2 RETURNING id`;
        await db.query(query, [replyId, userId]);
        return true;
    }

    static async toggleLike(userId, postId) {
        const authorRes = await db.query('SELECT author_id FROM community_post WHERE id = $1', [postId]);
        if (authorRes.rows.length === 0) throw new Error('Postingan tidak ditemukan.');
        const authorId = authorRes.rows[0].author_id;

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

            const totalLikesQuery = `SELECT COALESCE(SUM(likes_count), 0) AS total_likes FROM community_post WHERE author_id = $1`;
            const totalLikesRes = await db.query(totalLikesQuery, [authorId]);
            const totalLikes = parseInt(totalLikesRes.rows[0].total_likes);
            
            GamificationService.updateProgress(authorId, 'POST_LIKE_COUNT', totalLikes)
                .catch(err => console.error("Quest Update Error:", err));

            const countRes = await db.query(`SELECT likes_count FROM community_post WHERE id = $1`, [postId]);
            return { isLiked, likesCount: countRes.rows[0].likes_count };
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }
    
    // --- 4. SIDEBAR & LEADERBOARD ---
    static async getTopMembersByActivity() {
        const query = `
            SELECT u.id, COALESCE(d.full_name, u.username) as name, d.profile_picture,
                ((SELECT COUNT(*) FROM community_post WHERE author_id = u.id) +
                 (SELECT COUNT(*) FROM "comment" WHERE user_id = u.id) +
                 (SELECT COUNT(*) FROM reply_comment WHERE user_id = u.id)) as activity_score
            FROM users u
            JOIN detail_user_individu d ON u.id = d.id
            WHERE u.role = 'individu' 
            ORDER BY activity_score DESC LIMIT 5
        `;
        const result = await db.query(query);
        return result.rows.map(row => ({
            name: row.name,
            // [FIX] Bersihkan path
            profilePic: this.resolveImage(row.profile_picture),
            score: parseInt(row.activity_score)
        }));
    }

    static async getTopMembersByPoints() {
        const query = `
            SELECT u.id, COALESCE(d.full_name, u.username) as name, d.profile_picture, COALESCE(u.total_points, 0) as total_points
            FROM users u
            JOIN detail_user_individu d ON u.id = d.id
            WHERE u.role = 'individu' 
            ORDER BY total_points DESC LIMIT 5
        `;
        const result = await db.query(query);
        return result.rows.map(row => ({
            name: row.name,
            // [FIX] Bersihkan path
            profilePic: this.resolveImage(row.profile_picture),
            score: parseFloat(row.total_points)
        }));
    }

    static async getPopularPosts() {
        const query = `SELECT id, title, content, media_path FROM community_post ORDER BY likes_count DESC LIMIT 3`;
        const result = await db.query(query);
        return result.rows.map(p => ({
            id: p.id,
            title: p.title || (p.content.substring(0, 40) + '...'),
            // [FIX] Gunakan URL langsung dari DB
            image: p.media_path && p.media_path.startsWith('http') ? p.media_path : '/img/postinganPopuler1.png'
        }));
    }

    static async getSidebarData() {
        const [events, popular, fact, activeMembersByActivity, activeMembersByPoints] = await Promise.all([
            this.getUpcomingEvents(),
            this.getPopularPosts(),
            this.getRandomFact(),
            this.getTopMembersByActivity(),
            this.getTopMembersByPoints()
        ]);

        const lostQuery = `SELECT id, name, last_seen_address, reward_amount, photo FROM lost_cats WHERE status = 'searching' ORDER BY created_at DESC LIMIT 3`;
        const lostRes = await db.query(lostQuery);
        const missing = lostRes.rows.map(l => ({
            id: l.id,
            name: l.name,
            address: l.last_seen_address,
            reward: parseFloat(l.reward_amount),
            // [FIX] Gunakan URL langsung dari DB
            image: l.photo && l.photo.startsWith('http') ? l.photo : ''
        }));

        return { events, popular, fact, activeMembersByActivity, activeMembersByPoints, missing };
    }

    // (getUpcomingEvents, getRandomFact, getAllFacts tetap sama karena aset statis di frontend)
    static async getUpcomingEvents() {
        const query = `SELECT title, event_date, start_time, location_name FROM events WHERE is_active = true AND event_date >= CURRENT_DATE ORDER BY event_date ASC LIMIT 3`;
        const result = await db.query(query);
        return result.rows.map(e => ({
            title: e.title,
            date: new Date(e.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long'}),
            time: `Pukul ${e.start_time.substring(0, 5)} WIB`,
            location: e.location_name
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