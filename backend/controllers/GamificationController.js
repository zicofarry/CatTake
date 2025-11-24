const GamificationService = require('../services/GamificationService');

class GamificationController {
    
    /**
     * Endpoint untuk memproses klaim poin dari Achievement.
     * POST /api/v1/gamification/claim/:questId
     */
    static async claim(req, reply) {
        try {
            const userId = req.user.id;
            const questId = parseInt(req.params.questId);

            if (isNaN(questId)) {
                return reply.code(400).send({ error: 'ID Quest tidak valid.' });
            }

            const result = await GamificationService.claimAchievement(userId, questId);
            
            return reply.send({ status: 'success', data: result });
            
        } catch (error) {
            console.error('Error claiming achievement:', error);
            let msg = error.message;
            if (msg.includes('Poin sudah diklaim') || msg.includes('Misi belum selesai') || msg.includes('Achievement tidak ditemukan')) {
                return reply.code(409).send({ error: msg });
            }
            return reply.code(500).send({ error: 'Gagal memproses klaim poin.' });
        }
    }
}

module.exports = GamificationController;
