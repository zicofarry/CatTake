const UserController = require('../controllers/UserController');
// const { authenticate } = require('../middlewares/auth'); // Asumsi middleware

async function userRoutes(fastify, options) {
    // Gunakan middleware JWT untuk melindungi route ini
    // fastify.get('/profile', { preHandler: [authenticate] }, UserController.getProfile);

    // Tanpa middleware (untuk testing):
    fastify.get('/profile/:userId/:role', UserController.getProfile); 
    fastify.patch('/profile/:userId', UserController.updateProfile);
    fastify.get('/shelters', UserController.getShelters);
    fastify.post('/profile/:userId/photo', UserController.uploadPhoto);

    // [BARU] Route khusus update shelter (Multipart)
    fastify.put('/shelter/:userId', UserController.updateShelter);
}

module.exports = userRoutes;