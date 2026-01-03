const AdoptionController = require('../controllers/AdoptionController');
const authentication = require('../middlewares/authentication');
const optionalAuthentication = require('../middlewares/optionalAuthentication');

async function adoptRoutes(fastify, options) {
    // Public: Ambil daftar kucing
    fastify.get('/cats', { preHandler: [optionalAuthentication] }, AdoptionController.getCats);

    // User: Apply adopsi
    fastify.post('/apply', { preHandler: [authentication] }, AdoptionController.applyAdoption);

    // Shelter: Lihat laporan (Nanti shelterId bisa diambil dari Token JWT request.user.id agar lebih aman)
    // fastify.get('/reports/:shelterId', AdoptionController.getShelterReports);
    fastify.get('/my-reports', { preHandler: [authentication] }, AdoptionController.getShelterReports);

    // Verifikasi adopsi oleh shelter
    fastify.patch('/verify/:id', { preHandler: [authentication] }, AdoptionController.verifyAdoption);

    fastify.get('/my-adoptions', { preHandler: [authentication] }, AdoptionController.getMyAdoptions);
fastify.delete('/cancel/:id', { preHandler: [authentication] }, AdoptionController.cancelAdoption);
}

module.exports = adoptRoutes;
