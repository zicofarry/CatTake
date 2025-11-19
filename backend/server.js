const fastify = require('fastify')({ logger: true });
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('@fastify/cors');

fastify.register(cors, {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Izinkan semua method yang diperlukan
    allowedHeaders: ['Content-Type', 'Authorization'], // Izinkan header kustom
    credentials: true
});

// Daftarkan route Anda
fastify.register(authRoutes, { prefix: '/api/v1/auth' });
fastify.register(userRoutes, { prefix: '/api/v1/users' });

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