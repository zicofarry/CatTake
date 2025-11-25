const AuthService = require('../services/AuthService');
// const { OAuth2Client } = require('google-auth-library');
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '899392310680-d4566vlejmbdu2ltobbj1sbliu2tq4gr.apps.googleusercontent.com'; 
// const client = new OAuth2Client(GOOGLE_CLIENT_ID);

class AuthController {
static async register(request, reply) {
        try {
            // 1. Panggil Service (Data masuk ke DB di sini)
            const result = await AuthService.registerUser(request.body);

            
            // Logika Gamifikasi: Karena baru daftar, set DAYS_JOINED = 1
            if (result && result.id) {
                try {
                    await GamificationService.updateProgress(result.id, 'DAYS_JOINED', 1);
                } catch (err) {
                    console.error("Gagal update gamifikasi saat register:", err);
                }
            }

            return reply.code(201).send({ 
                message: 'User registered successfully!', 
                user: result 
            });

        } catch (error) {
            if (error.message.includes('unique constraint')) {
                return reply.code(409).send({ error: 'Email or username already exists.' });
            }
            if (error.message.includes('violates check constraint')) {
                // Menangani error ENUM/CHECK constraint
                return reply.code(400).send({ error: 'Data tidak valid: ' + error.message });
            }
            return reply.code(500).send({ error: error.message });
        }
    }

    static async login(request, reply) {
        try {
            const { identifier, password } = request.body; 
            const result = await AuthService.loginUser(identifier, password);
            return reply.send({ message: 'Login successful!', data: result });
        } catch (error) {
            return reply.code(401).send({ error: error.message });
        }
    }

    static async googleLogin(request, reply) {
        try {
            // Kita terima 'accessToken' dan 'role' dari frontend
            const { accessToken, role } = request.body;

            if (!accessToken) {
                return reply.code(400).send({ error: 'Access Token Google diperlukan' });
            }

            // 1. Gunakan Access Token untuk mengambil data user langsung dari Google API
            const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!googleResponse.ok) {
                throw new Error('Gagal mengambil data user dari Google');
            }

            // Data User: { sub, name, given_name, family_name, picture, email, ... }
            const payload = await googleResponse.json();

            // 2. Panggil Service untuk Proses DB (Cari atau Simpan User)
            // Service tidak perlu diubah karena struktur payloadnya cocok (ada email, name, picture, sub)
            const result = await AuthService.loginOrRegisterGoogle(payload, role);

            return reply.send({ 
                message: 'Login Google berhasil!', 
                data: result 
            });

        } catch (error) {
            console.error("Google Auth Error:", error);
            return reply.code(401).send({ error: 'Gagal verifikasi Google Login: ' + error.message });
        }
    }
}

module.exports = AuthController;
