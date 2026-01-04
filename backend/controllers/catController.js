const CatService = require('../services/CatService');
const CatModel = require('../models/CatModel');
const { uploadToCloudinary, cloudinary } = require('../config/cloudinary');


class CatController {
    // --- FITUR AMBIL KUCING SHELTER ---
    static async getShelterCats(req, reply) {
        try {
            const { id } = req.params;
            // Pastikan user yang login berhak melihat (opsional: cek id user = id params)
            
            const cats = await CatModel.findByShelterId(id);
            reply.send(cats);
        } catch (error) {
            console.error("Error Get Shelter Cats:", error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    // Fungsi ini akan dipanggil saat update atau delete
    static deleteImageFile(filename) {
        if (!filename) return;
        
        // Path ke folder public/img/cats
        const filePath = path.join(__dirname, '../public/img/cats', filename);
        
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Hapus file fisik
                console.log(`File ${filename} berhasil dihapus.`);
            }
        } catch (err) {
            console.error(`Gagal menghapus file ${filename}:`, err);
        }
    }

    // --- FITUR: TAMBAH KUCING (CREATE) ---
    static async createCat(req, reply) {
        try {
            const parts = req.parts();
            let fields = {};
            let imageUrl = null;

            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();
                    // Upload ke Cloudinary di folder 'cattake/cats'
                    const result = await uploadToCloudinary(buffer, 'cattake/cats');
                    imageUrl = result.secure_url; // URL lengkap (https://...)
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            const catData = {
                shelter_id: fields.shelter_id,
                name: fields.name,
                breed: fields.breed,
                age: fields.age,
                gender: fields.gender,
                health_status: fields.health_status,
                description: fields.description,
                adoption_status: fields.adoption_status || 'available',
                photo: imageUrl // Simpan URL lengkap
            };

            await CatModel.create(catData);
            reply.code(201).send({ message: 'Kucing berhasil ditambahkan' });

        } catch (error) {
            console.error("Error Create Cat:", error);
            reply.code(500).send({ error: 'Gagal menambahkan data kucing' });
        }
    }

    static async updateCat(req, reply) {
        try {
            const { id } = req.params;
            const parts = req.parts();
            let fields = {};
            let newImageUrl = null;

            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();
                    const result = await uploadToCloudinary(buffer, 'cattake/cats');
                    newImageUrl = result.secure_url;
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            // Jika ada foto baru, hapus foto lama di Cloudinary
            if (newImageUrl) {
                const oldCat = await CatService.getCatById(id);
                if (oldCat && oldCat.photo) {
                    await CatController.deleteCloudinaryImage(oldCat.photo);
                }
            }

            const updateData = {
                name: fields.name,
                breed: fields.breed,
                age: fields.age,
                gender: fields.gender,
                health_status: fields.health_status,
                description: fields.description,
                photo: newImageUrl 
            };

            const updatedCat = await CatModel.update(id, updateData);
            if (!updatedCat) return reply.code(404).send({ message: 'Kucing tidak ditemukan' });

            reply.send({ message: 'Data kucing berhasil diperbarui', data: updatedCat });
        } catch (error) {
            console.error("Error Update:", error);
            reply.code(500).send({ error: 'Gagal update data kucing' });
        }
    }

    static async deleteCat(req, reply) {
        try {
            const { id } = req.params;
            const catToDelete = await CatService.getCatById(id);

            if (!catToDelete) return reply.code(404).send({ message: 'Kucing tidak ditemukan' });

            const deleted = await CatModel.delete(id);
            if (deleted && catToDelete.photo) {
                // Hapus foto dari Cloudinary
                await CatController.deleteCloudinaryImage(catToDelete.photo);
            }

            reply.send({ message: 'Kucing dan fotonya berhasil dihapus' });
        } catch (error) {
            console.error("Error Delete:", error);
            reply.code(500).send({ error: 'Gagal menghapus kucing' });
        }
    }

    // Handler untuk mengambil semua kucing
    static async getCats(req, reply) {
        try {
            // Asumsi: Kamu pakai middleware auth yang menaruh data user di req.user
            // Jika user belum login (guest), userId bisa undefined/null
            const userId = req.user ? req.user.id : null;

            const cats = await CatModel.getAllCatsWithUserStatus(userId);
            
            reply.status(200).send(cats);
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    }

    static async getDetail(req, reply) {
        try {
            const { id } = req.params;
            const cat = await CatService.getCatById(id);

            if (!cat) {
                return reply.code(404).send({ error: 'Kucing tidak ditemukan' });
            }

            reply.send(cat);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
    
    // Handler untuk Like/Unlike
    static async toggleLike(req, reply) {
        try {
            const userId = req.user.id; // Harus login
            const catId = req.params.id; // ID kucing dari URL

            const isFavorited = await CatModel.toggleFavorite(userId, catId);

            reply.status(200).send({ 
                message: isFavorited ? 'Added to favorites' : 'Removed from favorites',
                isFavorited: isFavorited 
            });
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Failed to toggle favorite' });
        }
    }

    // Handler baru untuk Hall of Fame
    static async getAdopted(req, reply) {
        try {
            const cats = await CatService.getAdoptedCats();
            reply.send({ 
                status: 'success', 
                data: cats 
            });
        } catch (error) {
            console.error("Error Fetching Adopted Cats:", error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    // Helper untuk menghapus foto di Cloudinary
    static async deleteCloudinaryImage(imageUrl) {
        if (!imageUrl || !imageUrl.includes('cloudinary')) return;
        
        try {
            // Ekstrak public_id dari URL (contoh: cattake/cats/filename)
            const parts = imageUrl.split('/');
            const folderIndex = parts.indexOf('cattake');
            const publicIdWithExtension = parts.slice(folderIndex).join('/');
            const publicId = publicIdWithExtension.split('.')[0];
            
            await cloudinary.uploader.destroy(publicId);
            console.log(`Foto ${publicId} berhasil dihapus dari Cloudinary.`);
        } catch (err) {
            console.error(`Gagal menghapus foto dari Cloudinary:`, err);
        }
    }
}

module.exports = CatController;
