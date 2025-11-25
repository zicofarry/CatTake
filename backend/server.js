const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');
const path = require('path'); 
const fastifyStatic = require('@fastify/static'); 
const { connectDB } = require('./config/db');

// Import route
const DashboardController = require('./controllers/DashboardController');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const faqRoutes = require('./routes/faqRoutes');
const adoptRoutes = require('./routes/adoptRoutes');
const catRoutes = require('./routes/catRoutes');
const donationRoutes = require('./routes/donationRoutes');
const communityRoutes = require('./routes/communityRoutes');
const reportRoutes = require('./routes/reportRoutes');
const lostCatRoutes = require('./routes/lostCatRoutes');
const rescueRoutes = require('./routes/rescueRoutes');
const driverRoutes = require('./routes/driverRoutes');
const authentication = require('./middlewares/authentication');
const gamificationRoutes = require('./routes/gamificationRoutes');

fastify.register(cors, {
    // origin: [
    //     'http://localhost:5173', // Buat di laptop
    //     'https://cattake-frontend-production.up.railway.app', // domain railway
    //     'https://zicofarry.my.id' // domain sendiri
    // ], 
    origin: true, // Izinkan semua origin 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Izinkan semua method yang diperlukan
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

fastify.register(multipart, {
    limits: {
        fileSize: 5 * 1024 * 1024, // Batas 5 MB (dalam bytes)
        files: 5 // Opsional: Memastikan hanya satu file yang diizinkan per request
    }
});

fastify.register(fastifyStatic, {
    // Tentukan root directory tempat file statis (foto) disimpan
    root: path.join(__dirname, 'public'), 
    prefix: '/public/', 
    limits: {
        fileSize: 10 * 1024 * 1024, // Batas: 10 MB
    }
});

// Daftarkan route
fastify.register(authRoutes, { prefix: '/api/v1/auth' });
fastify.register(userRoutes, { prefix: '/api/v1/users' });
fastify.register(faqRoutes, { prefix: '/api/v1/faq' });
fastify.register(adoptRoutes, { prefix: '/api/v1/adopt' });
fastify.register(catRoutes, { prefix: '/api/v1/cats' });
fastify.register(donationRoutes, { prefix: '/api/v1/donations' });
fastify.register(communityRoutes, { prefix: '/api/v1/community' });
fastify.register(reportRoutes, { prefix: '/api/v1/reports' });
fastify.register(lostCatRoutes, { prefix: '/api/v1/lost-cats' });
fastify.register(rescueRoutes, { prefix: '/api/v1/rescue' });
fastify.register(driverRoutes, { prefix: '/api/v1/drivers' });
fastify.register(gamificationRoutes, { prefix: '/api/v1/gamification' });

fastify.get('/api/v1/dashboard', {
    preHandler: [authentication] 
}, DashboardController.getSummary);

// Jalankan server
const start = async () => {
    await connectDB();
    try {
        // Gunakan process.env.PORT
        const port = process.env.PORT || 3000; 
        await fastify.listen({ port: port, host: '0.0.0.0' }); // Host 0.0.0.0 wajib untuk Docker/Railway
        console.log(`Server running on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();