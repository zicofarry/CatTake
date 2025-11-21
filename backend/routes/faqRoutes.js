const FaqController = require('../controllers/FaqController');

async function faqRoutes(fastify, options) {
    // Endpoint: GET /api/v1/faq
    fastify.get('/', FaqController.getAll);
    
    // Endpoint: POST /api/v1/faq (Jika ingin test nambah data via Postman)
    fastify.post('/', FaqController.create);
}

module.exports = faqRoutes;
