const CatController = require('../controllers/catController'); // Sesuaikan path
const authentication = require('../middlewares/authentication'); // Sesuaikan path middleware
const optionalAuthentication = require('../middlewares/optionalAuthentication');

// Di Fastify, routes itu dibungkus function async
async function catRoutes(fastify, options) {

    // Route: POST /api/v1/cats/:id/favorite
    fastify.post('/:id/favorite', {
        preHandler: [authentication] // <--- Cara pasang middleware di Fastify beda dengan Express
    }, CatController.toggleLike);

    // Route: GET /api/v1/cats (Contoh kalau ada)
    fastify.get('/', { preHandler: [optionalAuthentication] }, CatController.getCats);
}

module.exports = catRoutes;