const AdoptionController = require('../controllers/AdoptionController');
const authentication = require('../middlewares/authentication');
const optionalAuthentication = require('../middlewares/optionalAuthentication');

async function adoptRoutes(fastify, options) {
    // Public: Ambil daftar kucing
    fastify.get('/cats', { preHandler: [optionalAuthentication] }, AdoptionController.getCats);

    // User: Apply adopsi
    fastify.post('/apply', { preHandler: [authentication] }, AdoptionController.applyAdoption);

    // Shelter: Lihat laporan (Nanti shelterId bisa diambil dari Token JWT request.user.id agar lebih aman)
    fastify.get('/reports/:shelterId', AdoptionController.getShelterReports);
}

module.exports = adoptRoutes;
