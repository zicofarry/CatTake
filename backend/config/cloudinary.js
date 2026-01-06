// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
require('dotenv').config();

cloudinary.config({
cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (fileBuffer, folder, resourceType = 'auto', fileName = null) => {
  return new Promise((resolve, reject) => {
    // 1. Bersihkan nama file dari spasi dan karakter spesial agar URL tidak korup
    // Contoh: "SIEM & SOAR.pdf" -> "SIEM_SOAR.pdf"
    const safeFileName = fileName 
      ? fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase() 
      : 'file';

    const options = { 
      resource_type: resourceType 
    };

    if (resourceType === 'raw') {
      // JANGAN pakai properti 'folder' jika sudah dimasukkan ke public_id
      // Masukkan folder langsung ke public_id agar tidak double
      options.public_id = `${folder}/${Date.now()}-${safeFileName}`;
    } else {
      // Untuk image (QR/Profile), biarkan seperti biasa
      options.folder = folder;
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const readableStream = new Readable();
    readableStream._read = () => {}; 
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// HELPER BARU: Hapus gambar dari Cloudinary berdasarkan URL
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary')) return;
  try {
    const parts = imageUrl.split('/');
    const isRaw = imageUrl.includes('/raw/upload/');
    const resource_type = isRaw ? 'raw' : 'image';
    const folderIndex = parts.indexOf('cattake');
    let publicId = parts.slice(folderIndex).join('/');
    
    // Jika BUKAN raw (berarti image), hapus ekstensinya (.jpg, .png)
    if (!isRaw) {
      publicId = publicId.split('.')[0];
    }
    await cloudinary.uploader.destroy(publicId, { resource_type });
  } catch (err) {
    console.error(`Gagal hapus di Cloudinary:`, err);
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };