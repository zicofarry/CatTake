const GamificationController = require('../controllers/GamificationController');
const authentication = require('../middlewares/authentication');

async function gamificationRoutes(fastify, options) {
    
    // Wajib Login untuk melakukan klaim
    fastify.post('/claim/:questId', { preHandler: [authentication] }, GamificationController.claim);

}

module.exports = gamificationRoutes;

