const ShelterChatModel = require('../models/ShelterChatModel');

class ShelterChatService {
    
    static async sendMessage(senderId, receiverId, message) {
        if (!message || !receiverId) {
            throw new Error("Pesan dan ID Penerima tidak boleh kosong.");
        }
        return await ShelterChatModel.create(senderId, receiverId, message);
    }

    static async getChatHistory(myId, partnerId) {
        return await ShelterChatModel.getHistory(myId, partnerId);
    }

    static async getInbox(myId) {
        return await ShelterChatModel.getInboxList(myId);
    }
}

module.exports = ShelterChatService;