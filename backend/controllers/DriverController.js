const DriverModel = require('../models/DriverModel');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);
const bcrypt = require('bcrypt'); 

class DriverController {

    // Helper Hapus File dengan Folder Dinamis
    static deleteFile(folder, filename) {
        if (!filename) return;
        const filePath = path.join(__dirname, `../public/img/${folder}`, filename);
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) { console.error(`Gagal hapus file ${folder}/${filename}:`, err); }
    }

    // GET List
    static async getShelterDrivers(req, reply) {
        try {
            const shelterId = req.user.id;
            const drivers = await DriverModel.getByShelterId(shelterId);
            reply.send(drivers);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    // POST Add Driver
    static async addDriver(req, reply) {
        try {
            const parts = req.parts();
            let fields = {};
            let simFilename = null;
            let photoFilename = null;

            // Loop part untuk handle file dan field
            for await (const part of parts) {
                if (part.file) {
                    // Cek fieldname untuk tentukan folder
                    let uploadDir;
                    let filename;
                    const ext = path.extname(part.filename);

                    if (part.fieldname === 'sim') {
                        uploadDir = path.join(__dirname, '../public/img/license');
                        filename = `sim-${Date.now()}${ext}`;
                        simFilename = filename;
                    } else if (part.fieldname === 'photo') {
                        uploadDir = path.join(__dirname, '../public/img/profile');
                        filename = `driver-${Date.now()}${ext}`;
                        photoFilename = filename;
                    }

                    if (uploadDir) {
                        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                        await pump(part.file, fs.createWriteStream(path.join(uploadDir, filename)));
                    } else {
                        part.file.resume(); // Skip unknown file
                    }
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            // Validasi
            if (!fields.name || !fields.email || !fields.password || !fields.username) {
                return reply.code(400).send({ message: "Data (Nama, Email, Username, Password) wajib diisi!" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(fields.password, salt);

            const userData = {
                username: fields.username,
                email: fields.email,
                password: hashedPassword
            };

            const driverData = {
                shelter_id: req.user.id,
                full_name: fields.name,
                contact_phone: fields.phone || '',
                license_info: simFilename,
                profile_picture: photoFilename
            };

            await DriverModel.create(userData, driverData);
            reply.code(201).send({ message: 'Driver berhasil ditambahkan' });

        } catch (error) {
            console.error("Error Add Driver:", error);
            // Handle unique constraint error username/email
            if (error.code === '23505') {
                return reply.code(400).send({ message: 'Username atau Email sudah terdaftar.' });
            }
            reply.code(500).send({ error: 'Gagal menambah driver' });
        }
    }

    // PUT Update Driver
    static async updateDriver(req, reply) {
        try {
            const { id } = req.params;
            const parts = req.parts();
            let fields = {};
            let newSim = null;
            let newPhoto = null;

            for await (const part of parts) {
                if (part.file) {
                    let uploadDir;
                    let filename;
                    const ext = path.extname(part.filename);

                    if (part.fieldname === 'sim') {
                        uploadDir = path.join(__dirname, '../public/img/license');
                        filename = `sim-${Date.now()}${ext}`;
                        newSim = filename;
                    } else if (part.fieldname === 'photo') {
                        uploadDir = path.join(__dirname, '../public/img/profile');
                        filename = `driver-${Date.now()}${ext}`;
                        newPhoto = filename;
                    }

                    if (uploadDir) {
                        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                        await pump(part.file, fs.createWriteStream(path.join(uploadDir, filename)));
                    }
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            // Hapus file lama jika ada file baru
            const oldDriver = await DriverModel.getById(id);
            if (oldDriver) {
                if (newSim && oldDriver.license_info) {
                    DriverController.deleteFile('license', oldDriver.license_info);
                }
                if (newPhoto && oldDriver.profile_picture) {
                    DriverController.deleteFile('profile', oldDriver.profile_picture);
                }
            }

            const updateData = {
                full_name: fields.name,
                username: fields.username,
                email: fields.email,
                contact_phone: fields.phone,
                license_info: newSim,      // null jika tidak ganti
                profile_picture: newPhoto  // null jika tidak ganti
            };

            await DriverModel.update(id, updateData);
            reply.send({ message: 'Data driver diperbarui' });

        } catch (error) {
            console.error("Error Update Driver:", error);
            reply.code(500).send({ error: 'Gagal update driver' });
        }
    }

    // DELETE Driver
    static async deleteDriver(req, reply) {
        try {
            const { id } = req.params;
            const driver = await DriverModel.getById(id);
            if (!driver) return reply.code(404).send({ message: 'Driver tidak ditemukan' });

            const success = await DriverModel.delete(id);
            if (!success) return reply.code(400).send({ message: 'Gagal menghapus data' });

            // Hapus Foto Fisik
            if (driver.license_info) DriverController.deleteFile('license', driver.license_info);
            if (driver.profile_picture) DriverController.deleteFile('profile', driver.profile_picture);

            reply.send({ message: 'Driver berhasil dihapus' });
        } catch (error) {
            console.error("Error Delete Driver:", error);
            reply.code(500).send({ error: 'Gagal menghapus driver' });
        }
    }
}

module.exports = DriverController;