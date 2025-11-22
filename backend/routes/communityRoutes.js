// backend/routes/communityRoutes.js
const CommunityController = require('../controllers/CommunityController');
const authentication = require('../middlewares/authentication');
const optionalAuthentication = require('../middlewares/optionalAuthentication');

async function communityRoutes(fastify, options) {
    // Public / Optional Auth
    fastify.get('/posts', { preHandler: [optionalAuthentication] }, CommunityController.getAll);
    fastify.get('/posts/:id', { preHandler: [optionalAuthentication] }, CommunityController.getOne);
    fastify.get('/sidebar', CommunityController.getSidebarData);
    fastify.get('/facts', CommunityController.getAllFacts);

    // Private Actions (Authentication Required)
    fastify.post('/posts', { preHandler: [authentication] }, CommunityController.create);
    fastify.post('/posts/:id/comments', { preHandler: [authentication] }, CommunityController.addComment);
    fastify.post('/comments/:commentId/replies', { preHandler: [authentication] }, CommunityController.replyComment);
    fastify.post('/posts/:id/like', { preHandler: [authentication] }, CommunityController.toggleLike);

    // === ROUTE BARU: EDIT & DELETE ===
    // Untuk Komentar Utama
    fastify.put('/comments/:id', { preHandler: [authentication] }, CommunityController.editComment);
    fastify.delete('/comments/:id', { preHandler: [authentication] }, CommunityController.deleteComment);

    // Untuk Reply
    fastify.put('/replies/:id', { preHandler: [authentication] }, CommunityController.editReply);
    fastify.delete('/replies/:id', { preHandler: [authentication] }, CommunityController.deleteReply);
}

module.exports = communityRoutes;