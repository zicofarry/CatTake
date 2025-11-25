const AdminController = require('../controllers/AdminController');
const authentication = require('../middlewares/authentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

async function adminRoutes(fastify, options) {
    // Middleware ganda: Harus Login DAN Harus Admin
    fastify.addHook('preHandler', authentication);
    fastify.addHook('preHandler', adminAuthorization);

    fastify.get('/pending-shelters', AdminController.getPendingShelters);
    fastify.post('/verify', AdminController.verifyUser);
}

module.exports = adminRoutes;
