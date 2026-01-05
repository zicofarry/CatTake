// zicofarry/cattake/CatTake-without-img3/backend/services/GamificationService.js

const db = require('../config/db');

class GamificationService {
    
    /**
     * Memperbarui progress user berdasarkan kategori aksi.
     * @param {number} userId - ID User
     * @param {string} category - Kategori misi ('POST_COUNT', 'DONATION_AMOUNT', 'DAYS_JOINED')
     * @param {number} valueToAdd - Nilai yang ditambahkan (misal 1 postingan, atau 50000 rupiah, atau total hari)
     */
    static async updateProgress(userId, category, valueToAdd) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const questsRes = await client.query(`SELECT * FROM quests WHERE category = $1`, [category]);
            const quests = questsRes.rows;

            for (let quest of quests) {
                const progressRes = await client.query(
                    `SELECT * FROM user_quest_progress WHERE user_id = $1 AND quest_id = $2`,
                    [userId, quest.id]
                );

                if (progressRes.rows.length > 0 && progressRes.rows[0].completed_at) {
                    continue; // Sudah selesai, lewati.
                }

                let currentVal = progressRes.rows.length > 0 ? parseFloat(progressRes.rows[0].current_value) : 0;
                const isNew = progressRes.rows.length === 0;
                
                // Khusus untuk POST_LIKE_COUNT/DAYS_JOINED, nilai tidak diakumulasi
                let newVal = (category === 'POST_LIKE_COUNT' || category === 'DAYS_JOINED') ? valueToAdd : currentVal + valueToAdd;

                let completedAt = null;
                if (newVal >= parseFloat(quest.target_value)) {
                    completedAt = new Date();
                    newVal = parseFloat(quest.target_value); // Set nilai maksimum target
                }

                if (isNew) {
                    await client.query(
                        `INSERT INTO user_quest_progress (user_id, quest_id, current_value, completed_at, updated_at) 
                         VALUES ($1, $2, $3, $4, NOW())`,
                        [userId, quest.id, newVal, completedAt]
                    );
                } else {
                    await client.query(
                        `UPDATE user_quest_progress 
                         SET current_value = $1, completed_at = $2, updated_at = NOW() 
                         WHERE user_id = $3 AND quest_id = $4`,
                        [newVal, completedAt, userId, quest.id]
                    );
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Mengambil daftar quests dan achievements user dari DB.
     * Menerapkan sorting berdasarkan Progress Ratio (untuk Quests) dan Completed Date (untuk Achievements).
     */
    static async getUserQuestsAndAchievements(userId) {
        const query = `
            SELECT 
                q.id, q.name, q.description, q.target_value, q.points, q.category,
                COALESCE(uqp.current_value, 0) as progress, 
                (uqp.completed_at IS NOT NULL) as is_completed,
                uqp.completed_at, -- BARU: Diperlukan untuk sorting Achievement
                COALESCE(uqp.is_claimed, FALSE) as is_claimed -- Diperlukan untuk sorting Claim
            FROM quests q
            LEFT JOIN user_quest_progress uqp ON q.id = uqp.quest_id AND uqp.user_id = $1
            -- Hapus ORDER BY SQL, kita akan sorting di JavaScript
        `;
        const result = await db.query(query, [userId]);

        let quests = [];
        let achievements = [];
        
        result.rows.forEach(row => {
            const item = {
                id: row.id,
                name: row.name,
                description: row.description,
                points: row.points,
                target: parseFloat(row.target_value), 
                progress: parseFloat(row.progress),
                isClaimed: row.is_claimed,
                completedAt: row.completed_at // Simpan data tanggal penyelesaian
            };

            if (!row.is_completed) {
                quests.push(item);
            } else if (row.is_completed) { 
                achievements.push(item);
            }
        });

        // 1. SORTING QUESTS: Urutkan berdasarkan persentase completion (paling dekat ke 100%)
        quests.sort((a, b) => {
            const ratioA = a.progress / a.target;
            const ratioB = b.progress / b.target;
            // Jika persentase sama, urutkan berdasarkan ID ASC
            if (ratioB - ratioA === 0) return a.id - b.id; 
            
            return ratioB - ratioA; // DESC (Tertinggi di atas)
        });

        // 2. SORTING ACHIEVEMENTS: Claimed di bawah, dan Terbaru Selesai di atas
        achievements.sort((a, b) => {
            // PRIMARY SORT: Claimed (FALSE/belum diklaim di atas, TRUE/sudah diklaim di bawah)
            if (a.isClaimed !== b.isClaimed) {
                return a.isClaimed ? 1 : -1; // 1 jika A claimed, -1 jika B claimed
            }

            // SECONDARY SORT: Tanggal Selesai (Terbaru di atas)
            const dateA = new Date(a.completedAt);
            const dateB = new Date(b.completedAt);
            return dateB.getTime() - dateA.getTime(); // DESC (Terbaru/Terbesar di atas)
        });


        return { quests, achievements };
    }
    
    /**
     * Memproses klaim Achievement.
     */
    static async claimAchievement(userId, questId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Cek status Achievement
            const checkQuery = `
                SELECT q.points, uqp.is_claimed, uqp.completed_at
                FROM user_quest_progress uqp
                JOIN quests q ON uqp.quest_id = q.id
                WHERE uqp.user_id = $1 AND uqp.quest_id = $2
            `;
            const checkRes = await client.query(checkQuery, [userId, questId]);
            const achievement = checkRes.rows[0];

            if (!achievement) {
                throw new Error('Achievement tidak ditemukan.');
            }
            if (!achievement.completed_at) {
                throw new Error('Misi belum selesai.');
            }
            if (achievement.is_claimed) {
                throw new Error('Poin sudah diklaim.');
            }

            // 2. Update status klaim di user_quest_progress
            await client.query(`
                UPDATE user_quest_progress 
                SET is_claimed = TRUE, updated_at = NOW() 
                WHERE user_id = $1 AND quest_id = $2
            `, [userId, questId]);

            // 3. Tambahkan poin ke total_points di tabel users
            const pointsToAward = achievement.points;
            const updatePointsQuery = `
                UPDATE users 
                SET total_points = COALESCE(total_points, 0) + $1 
                WHERE id = $2 
                RETURNING total_points
            `;
            const updateRes = await client.query(updatePointsQuery, [pointsToAward, userId]);

            await client.query('COMMIT');
            
            return { 
                message: 'Poin berhasil diklaim!', 
                points: pointsToAward,
                totalPoints: parseFloat(updateRes.rows[0].total_points)
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    static async syncDaysJoined(userId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Query ini melakukan:
            // 1. Menghitung selisih hari: (Sekarang - Tanggal Regis) / 86400 detik + 1
            // 2. Mencari quest dengan kategori 'DAYS_JOINED'
            // 3. Update tabel user_quest_progress (Insert jika belum ada, Update jika sudah ada)
            // 4. Otomatis mengisi completed_at jika mencapai target_value
            const syncQuery = `
                WITH calc AS (
                    SELECT 
                        q.id as quest_id,
                        q.target_value,
                        FLOOR(EXTRACT(EPOCH FROM (NOW() - u.created_at)) / 86400)::int + 1 as actual_days
                    FROM users u
                    CROSS JOIN quests q
                    WHERE u.id = $1 AND q.category = 'DAYS_JOINED'
                )
                INSERT INTO user_quest_progress (user_id, quest_id, current_value, updated_at, completed_at)
                SELECT $1, quest_id, actual_days, NOW(), 
                    CASE WHEN actual_days >= target_value THEN NOW() ELSE NULL END
                FROM calc
                ON CONFLICT (user_id, quest_id) 
                DO UPDATE SET 
                    current_value = EXCLUDED.current_value,
                    updated_at = NOW(),
                    completed_at = CASE 
                        WHEN EXCLUDED.current_value >= (SELECT target_value FROM quests WHERE id = user_quest_progress.quest_id) 
                        THEN COALESCE(user_quest_progress.completed_at, NOW()) 
                        ELSE user_quest_progress.completed_at 
                    END;
            `;

            await client.query(syncQuery, [userId]);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Gagal Sync Days Joined:", error);
        } finally {
            client.release();
        }
    }
}

module.exports = GamificationService;