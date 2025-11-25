const CatController = require('../controllers/catController');
const authentication = require('../middlewares/authentication');
const optionalAuthentication = require('../middlewares/optionalAuthentication');

async function catRoutes(fastify, options) {

    // Route: Tambah Kucing Baru (Upload File)
    // POST /api/v1/cats
    fastify.post('/', {
        preHandler: [authentication]
    }, CatController.createCat);

    // Route Update Kucing
    fastify.put('/:id', {
        preHandler: [authentication]
    }, CatController.updateCat);

    // Route Hapus Kucing
    fastify.delete('/:id', {
        preHandler: [authentication]
    }, CatController.deleteCat);

    // Route: Ambil Semua Kucing Milik Shelter Tertentu
    // GET /api/v1/cats/shelter/:id
    fastify.get('/shelter/:id', {
        preHandler: [authentication] 
    }, CatController.getShelterCats);

    // Route: Toggle Favorite
    fastify.post('/:id/favorite', {
        preHandler: [authentication]
    }, CatController.toggleLike);

    // Route: Detail Kucing
    fastify.get('/:id', CatController.getDetail);

    // Route Public: Ambil Kucing yang Sudah Diadopsi (Hall of Fame)
    fastify.get('/adopted', CatController.getAdopted);

    // Route: Get All Cats (Public/Optional Auth)
    fastify.get('/', { preHandler: [optionalAuthentication] }, CatController.getCats);
}

module.exports = catRoutes;