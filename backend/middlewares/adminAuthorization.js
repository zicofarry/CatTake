const adminAuthorization = async (request, reply) => {
    // Pastikan sudah melewati middleware 'authentication' sebelumnya
    if (!request.user || request.user.role !== 'admin') {
        return reply.code(403).send({ error: 'Akses ditolak. Halaman ini khusus Admin.' });
    }
};

module.exports = adminAuthorization;
