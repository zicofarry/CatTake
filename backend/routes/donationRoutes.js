// backend/routes/donationRoutes.js
const DonationController = require('../controllers/DonationController');
const authentication = require('../middlewares/authentication');

async function donationRoutes(fastify, options) {
    
    // Endpoint User Mengirim Donasi (Wajib Login)
    fastify.post('/', { preHandler: [authentication] }, DonationController.create);

    // Endpoint Shelter Melihat Donasi Masuk (Bisa diamankan dengan cek role shelter)
    fastify.get('/shelter/:shelterId', { preHandler: [authentication] }, DonationController.getByShelter);
}

module.exports = donationRoutes;
