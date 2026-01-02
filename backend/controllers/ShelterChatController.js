const ShelterChatService = require('../services/ShelterChatService');

class ShelterChatController {
    
    // POST /api/chat/send
    static async sendMessage(req, reply) {
        try {
            const senderId = req.user.id; // Dari Token Login
            const { receiverId, message } = req.body; // Dari Body Request

            const chat = await ShelterChatService.sendMessage(senderId, receiverId, message);
            
            return reply.code(201).send({
                status: 'success',
                message: 'Pesan berhasil dikirim',
                data: chat
            });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: error.message });
        }
    }

    // GET /api/chat/history/:partnerId
    static async getHistory(req, reply) {
        try {
            const myId = req.user.id;
            const { partnerId } = req.params;

            const chats = await ShelterChatService.getChatHistory(myId, partnerId);
            
            return reply.send({
                status: 'success',
                data: chats
            });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Gagal memuat riwayat chat.' });
        }
    }

    // GET /api/chat/inbox
    static async getInbox(req, reply) {
        try {
            const myId = req.user.id;
            const inbox = await ShelterChatService.getInbox(myId);
            
            return reply.send({
                status: 'success',
                data: inbox
            });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Gagal memuat inbox.' });
        }
    }
}

module.exports = ShelterChatController;