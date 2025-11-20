const jwt = require('jsonwebtoken');

const optionalAuthentication = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;

        // Kalau gak ada header Authorization, lanjut aja (Guest)
        if (!authHeader) return; 

        const token = authHeader.split(' ')[1];
        if (!token) return;

        // Pastikan SECRET_KEY sama dengan yang di AuthController
        const secretKey = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY'; 
        
        const decoded = jwt.verify(token, secretKey);
        
        // Simpan data user (biar Controller tau ini siapa)
        request.user = decoded;

    } catch (error) {
        // Token error/expired? Anggap aja Guest. Jangan di-stop.
        request.user = null;
    }
};

module.exports = optionalAuthentication;

