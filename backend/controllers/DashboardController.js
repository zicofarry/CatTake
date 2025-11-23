// backend/controllers/DashboardController.js
const DashboardService = require('../services/DashboardService');

class DashboardController {
    static async getSummary(req, reply) {
        try {
            // Memastikan user adalah shelter
            if (!req.user || req.user.role !== 'shelter') {
                return reply.code(403).send({ error: 'Akses ditolak: Anda bukan Shelter.' });
            }

            const shelterId = req.user.id;
            
            const summary = await DashboardService.getShelterDashboardSummary(shelterId);

            return reply.send({ 
                status: 'success',
                data: summary 
            });

        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = DashboardController;