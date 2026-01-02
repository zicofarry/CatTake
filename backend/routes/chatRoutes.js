const ShelterChatController = require('../controllers/ShelterChatController');
const { authentication } = require('../middlewares/authentication'); 

async function chatRoutes(fastify, options) {
    
    // Wajib Login untuk akses chat
    fastify.addHook('preHandler', authentication);

    // Endpoint Kirim Pesan
    fastify.post('/send', ShelterChatController.sendMessage);

    // Endpoint Lihat Chat Room
    fastify.get('/history/:partnerId', ShelterChatController.getHistory);

    // Endpoint Lihat Daftar Pesan (Inbox)
    fastify.get('/inbox', ShelterChatController.getInbox);
}

module.exports = chatRoutes;