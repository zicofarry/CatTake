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

    // --- TAMBAHKAN INI (Route Khusus Driver) ---
    fastify.get('/driver-tasks', RescueController.getDriverTasks);
    
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
    fastify.delete('/chat/clear/:trackingId', RescueController.clearChat);
    
    // [BARU] Get List Rescue di Shelter
    fastify.get('/shelter-history', RescueController.getShelterRescuedCats);

    // [BARU] Aksi Return Owner
    fastify.post('/return-owner', RescueController.returnToOwner);

    // [BARU] Aksi Move to Adoption
    fastify.post('/move-adoption', RescueController.moveToAdoption);
}

module.exports = rescueRoutes;