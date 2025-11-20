const jwt = require('jsonwebtoken');

const authentication = async (request, reply) => {
    try {
        // 1. Ambil token dari Header 'Authorization'
        // Format biasanya: "Bearer eyJhbGciOi..."
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return reply.code(401).send({ error: 'Akses ditolak! Token tidak ditemukan.' });
        }

        // 2. Pisahkan kata "Bearer" dan token aslinya
        const token = authHeader.split(' ')[1]; 

        if (!token) {
            return reply.code(401).send({ error: 'Format token salah.' });
        }

        // 3. Verifikasi token
        // PENTING: Ganti 'RAHASIA_NEGARA' dengan secret key yang sama 
        // seperti yang kamu pakai di AuthController saat bikin token (jwt.sign)
        // Biasanya ada di process.env.JWT_SECRET
        const secretKey = process.env.JWT_SECRET || 'RAHASIA_NEGARA'; 
        
        const decoded = jwt.verify(token, secretKey);

        // 4. Simpan data user ke dalam request biar bisa dipakai di Controller
        request.user = decoded;

    } catch (error) {
        request.log.error(error);
        return reply.code(401).send({ error: 'Token tidak valid atau kadaluarsa.' });
    }
};

module.exports = authentication;
