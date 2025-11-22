const RescueController = require('../controllers/RescueController');
const authentication = require('../middlewares/authentication');

async function rescueRoutes(fastify, options) {
    
    // Semua endpoint di bawah ini butuh Login (Token)
    fastify.addHook('preHandler', authentication);

    // Shelter melihat laporan masuk
    fastify.get('/incoming', RescueController.getIncoming);
    
    // Shelter melihat daftar drivernya
    fastify.get('/drivers', RescueController.getDrivers);
    
    // Shelter menugaskan driver (Ambil Order)
    fastify.post('/accept', RescueController.acceptJob);
    
    // Shelter melihat riwayat tugas
    fastify.get('/my-tasks', RescueController.getMyTasks);

    // Driver/Shelter update status & upload bukti (Multipart)
    fastify.post('/update-status', RescueController.updateStatus);

    // Public/Private: Get Tracking Detail
    fastify.get('/tracking/:id', RescueController.getTrackingDetail);

    // TRACKING LOCATION
    fastify.post('/location', RescueController.updateLocation); // Driver kirim lokasi
    fastify.get('/location/:assignmentId', RescueController.getLocation); // User/Shelter liat lokasi

    // FITUR CHAT
    fastify.get('/chat/:id', RescueController.getChats);
    fastify.post('/chat', RescueController.sendChat);
    fastify.delete('/chat/:messageId', RescueController.deleteChat);

    // fastify.get('/my-tasks', authentication, RescueController.getDriverTasks);
}

module.exports = rescueRoutes;