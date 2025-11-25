const AdminService = require('../services/AdminService');

class AdminController {
    static async getPendingShelters(req, reply) {
        try {
            const data = await AdminService.getPendingShelters();
            reply.send({ status: 'success', data });
        } catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }

    static async verifyUser(req, reply) {
        try {
            const { targetUserId, status, notes, roleType } = req.body; // status: 'approved' | 'rejected'
            const adminId = req.user.id;

            await AdminService.verifyUser(adminId, targetUserId, status, notes, roleType);
            reply.send({ message: 'Verifikasi berhasil diproses.' });
        } catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = AdminController;
