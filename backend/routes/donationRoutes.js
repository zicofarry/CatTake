// backend/routes/donationRoutes.js
const DonationController = require('../controllers/DonationController');
const authentication = require('../middlewares/authentication');

async function donationRoutes(fastify, options) {
    
    // Endpoint User Mengirim Donasi
    fastify.post('/', { preHandler: [authentication] }, DonationController.create);

    // [PERBAIKAN] Daftarkan route riwayat donasi user
    fastify.get('/my-history', { preHandler: [authentication] }, DonationController.getMyHistory);

    // Endpoint Shelter Melihat Donasi Masuk
    fastify.get('/shelter/:shelterId', { preHandler: [authentication] }, DonationController.getByShelter);
}

module.exports = donationRoutes;