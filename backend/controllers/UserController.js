// /backend/controllers/UserController.js

const UserService = require('../services/UserService'); // <-- Memanggil service yang melakukan JOIN DB

class UserController {
    /**
     * Mengambil detail profil pengguna (individu/shelter) berdasarkan ID dan role.
     * Endpoint: GET /api/v1/users/profile/:userId/:role
     */
    static async getProfile(request, reply) {
        try {
            // Mengambil userId dan role dari parameter URL yang dikirimkan (saat testing tanpa JWT)
            const { userId, role } = request.params; 
            
            // Konversi userId ke integer karena Fastify params adalah string
            const id = parseInt(userId, 10);
            
            if (isNaN(id) || !role) {
                return reply.code(400).send({ error: 'Invalid user ID or role.' });
            }

            // Panggil UserService untuk mengambil data yang di-JOIN dari tabel detail
            const profile = await UserService.getProfile(id, role);
            
            // Mengembalikan status 200 OK
            return reply.send(profile);
            
        } catch (error) {
            if (error.message.includes('Profile not found')) {
                return reply.code(404).send({ error: 'User profile data not found.' });
            }
            console.error('Error fetching profile:', error);
            return reply.code(500).send({ error: 'Internal server error while fetching profile.' });
        }
    }
    
    static async updateProfile(request, reply) {
        try {
            // Asumsi middleware JWT sudah memverifikasi user dan menaruhnya di request.user
            // Kita akan menggunakan userId dan role dari URL params untuk saat ini
            const { userId } = request.params; 
            const { role } = request.body; // Ambil role dari body atau dari JWT

            // Panggil service untuk melakukan update
            const updatedData = await UserService.updateProfile(parseInt(userId, 10), role, request.body);

            return reply.send({ 
                message: 'Profile updated successfully!', 
                data: updatedData
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            return reply.code(400).send({ error: error.message });
        }
    }

    static async getShelters(request, reply) {
        try {
            const shelters = await UserService.getAllShelters();
            return reply.send(shelters);
        } catch (error) {
            console.error('Error fetching shelters:', error);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
    // Anda bisa menambahkan controller lain di sini, seperti updateProfile
}

module.exports = UserController;
