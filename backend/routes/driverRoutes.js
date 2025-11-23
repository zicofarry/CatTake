const DriverController = require('../controllers/DriverController');
const authentication = require('../middlewares/authentication');

async function driverRoutes(fastify, options) {
    
    // GET: List Driver (Wajib Login sebagai Shelter)
    fastify.get('/', {
        preHandler: [authentication]
    }, DriverController.getShelterDrivers);

    // POST: Tambah Driver
    fastify.post('/', {
        preHandler: [authentication]
    }, DriverController.addDriver);

    // PUT: Update Driver
    fastify.put('/:id', {
        preHandler: [authentication]
    }, DriverController.updateDriver);

    // DELETE: Hapus Driver
    fastify.delete('/:id', {
        preHandler: [authentication]
    }, DriverController.deleteDriver);
}

module.exports = driverRoutes;
