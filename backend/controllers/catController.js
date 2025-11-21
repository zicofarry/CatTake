const CatService = require('../services/CatService');
const CatModel = require('../models/CatModel');

class CatController {

    // Handler untuk mengambil semua kucing
    static async getCats(req, reply) {
        try {
            // Asumsi: Kamu pakai middleware auth yang menaruh data user di req.user
            // Jika user belum login (guest), userId bisa undefined/null
            const userId = req.user ? req.user.id : null;

            const cats = await CatModel.getAllCatsWithUserStatus(userId);
            
            reply.status(200).send(cats);
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    }

    static async getDetail(req, reply) {
        try {
            const { id } = req.params;
            const cat = await CatService.getCatById(id);

            if (!cat) {
                return reply.code(404).send({ error: 'Kucing tidak ditemukan' });
            }

            reply.send(cat);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
    
    // Handler untuk Like/Unlike
    static async toggleLike(req, reply) {
        try {
            const userId = req.user.id; // Harus login
            const catId = req.params.id; // ID kucing dari URL

            const isFavorited = await CatModel.toggleFavorite(userId, catId);

            reply.status(200).send({ 
                message: isFavorited ? 'Added to favorites' : 'Removed from favorites',
                isFavorited: isFavorited 
            });
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Failed to toggle favorite' });
        }
    }
}

module.exports = CatController;
