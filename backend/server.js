const fastify = require('fastify')({ 
    logger: true,
    trustProxy: true 
});
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
    origin: true, // Biarkan Fastify yang mengatur header dynamic (Reflect origin)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true, // Izinkan cookies/token
    preflight: true,   // Pastikan preflight OPTIONS ditangani
    optionsSuccessStatus: 204 // Kembalikan 204 (No Content) untuk OPTIONS sukses
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

fastify.get('/', async (request, reply) => {
    return { status: 'OK', message: 'Server is running & CORS is active' };
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
    try {
        await connectDB();

        // 1. Pastikan PORT dibaca sebagai ANGKA (Integer)
        // Railway memberi port dalam bentuk string, kita ubah jadi number
        const port = parseInt(process.env.PORT) || 3000; 

        // 2. LOG DULU SEBELUM JALAN (Biar tau mau jalan di mana)
        console.log(`Attempting to start server on 0.0.0.0:${port}...`);

        // 3. LISTEN DENGAN FORMAT OBJEK YANG BENAR
        // Host '0.0.0.0' ADALAH KUNCI UTAMA AGAR TIDAK 502
        await fastify.listen({ 
            port: port, 
            host: '0.0.0.0' 
        });

        // Log sukses (Fastify biasanya otomatis log juga, tapi kita tambah manual)
        console.log(`✅ SERVER SUCCESS: Running on http://0.0.0.0:${port}`);

    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();