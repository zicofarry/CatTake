// backend/routes/lostCatRoutes.js
const LostCatController = require('../controllers/LostCatController');
const authentication = require('../middlewares/authentication');

async function lostCatRoutes(fastify, options) {
    // Post Laporan Kehilangan (Wajib Login)
    fastify.post('/', { preHandler: [authentication] }, LostCatController.create);

    // Get List Kucing Hilang (Raw Array)
    fastify.get('/', LostCatController.getAll);

    // [BARU] Get List Kucing Hilang Terformat ({ data: [] })
    fastify.get('/list', LostCatController.getList);

    // Search Kucing Hilang (Public)
    fastify.get('/search', LostCatController.search);
}

module.exports = lostCatRoutes;