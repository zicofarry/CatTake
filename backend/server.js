const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');
const path = require('path'); 
const fastifyStatic = require('@fastify/static'); 
const { connectDB } = require('./config/db');

// Import route
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const faqRoutes = require('./routes/faqRoutes');
const adoptRoutes = require('./routes/adoptRoutes');
const catRoutes = require('./routes/catRoutes');
const donationRoutes = require('./routes/donationRoutes');
const communityRoutes = require('./routes/communityRoutes');
const reportRoutes = require('./routes/reportRoutes');
const lostCatRoutes = require('./routes/lostCatRoutes');

fastify.register(cors, {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Izinkan semua method yang diperlukan
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

fastify.register(multipart, {
    limits: {
        fileSize: 5 * 1024 * 1024, // Batas 5 MB (dalam bytes)
        files: 1 // Opsional: Memastikan hanya satu file yang diizinkan per request
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

// Jalankan server
const start = async () => {
    await connectDB();
    try {
        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();