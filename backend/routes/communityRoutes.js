const CommunityController = require('../controllers/CommunityController');
const authentication = require('../middlewares/authentication');
const optionalAuthentication = require('../middlewares/optionalAuthentication');

async function communityRoutes(fastify, options) {
    // 1. PERBAIKAN: Tambahkan optionalAuthentication agar bisa cek status like user
    fastify.get('/posts', { preHandler: [optionalAuthentication] }, CommunityController.getAll);
    
    // Public: Lihat detail post
    fastify.get('/posts/:id', { preHandler: [optionalAuthentication] }, CommunityController.getOne);

    // 2. PERBAIKAN: Hapus [optionalAuthentication] dan perbaiki syntax array
    // Cukup [authentication] karena wajib login untuk posting
    fastify.post('/posts', { preHandler: [authentication] }, CommunityController.create);

    // Private (Harus Login): Komentar
    fastify.post('/posts/:id/comments', { preHandler: [authentication] }, CommunityController.addComment);

    // Public: Ambil data Sidebar (Event, Populer, Fakta)
    fastify.get('/sidebar', CommunityController.getSidebarData);

    // Private: Like Postingan
    fastify.post('/posts/:id/like', { preHandler: [authentication] }, CommunityController.toggleLike);

    fastify.get('/facts', CommunityController.getAllFacts);
}

module.exports = communityRoutes;