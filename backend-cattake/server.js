// server.js (versi 3 - Terhubung ke Database)

const fastify = require('fastify')({
  logger: true
})

fastify.register(require('@fastify/cors'), { 
  origin: "*", // Mengizinkan SEMUA koneksi. 
               // Nanti bisa diganti ke 'http://localhost:5173' (alamat Vue)
});

// 1. DAFTARKAN PLUGIN POSTGRES
// =============================
fastify.register(require('@fastify/postgres'), {
  // Ganti 'USER', 'PASSWORD', dan 'cattake_db' sesuai pengaturan Postgres Anda!
  connectionString: 'postgres://postgres:3636@localhost:5432/db_cattake' 
})
// =============================


// Rute 1: Rute utama (masih sama)
fastify.get('/', async (request, reply) => {
  return { 
    project: "CatTake", 
    status: "Server Backend Aktif (Connected to DB)" 
  }
})

// Rute 2: Rute Kucing (SEKARANG AMBIL DARI DATABASE)
fastify.get('/api/kucing', async (request, reply) => {
  
  // Dapatkan 'client' database dari pool koneksi Fastify
  const client = await fastify.pg.connect()

  try {
    // 2. BUAT QUERY
    // Kita pakai JOIN untuk mengambil nama shelter (dari tabel users)
    const query = `
        SELECT 
            cats.id, 
            cats.name, 
            users.username AS shelter_name, 
            cats.gender, 
            cats.age_in_months, 
            cats.photo
        FROM 
            cats
        JOIN 
            users ON cats.shelter_id = users.id
        WHERE 
            cats.adoption_status = 'available' 
            AND users.role = 'shelter';
    `
    const { rows } = await client.query(query)

    // 3. MAPPING DATA (PENTING!)
    // Ubah data dari format database (snake_case, dll)
    // ke format yang diharapkan frontend (camelCase, age string)
    
    const frontendData = rows.map(cat => {
      return {
        id: cat.id,
        name: cat.name,
        shelter: cat.shelter_name, // 'shelter_name' dari query kita ubah jadi 'shelter'
        gender: cat.gender,
        age: `${cat.age_in_months} Bulan`, // 'age_in_months' (angka) kita ubah jadi string '... Bulan'
        image: cat.photo, // 'photo' kita ubah jadi 'image'
        isFavorite: false // Frontend yang akan mengatur ini, kita beri default
      }
    })

    // 4. KIRIM DATA HASIL MAPPING
    return frontendData

  } catch (err) {
    fastify.log.error(err)
    reply.code(500).send({ error: 'Gagal mengambil data kucing' })
  } finally {
    // 5. SELALU LEPASKAN CLIENT!
    // Ini sangat penting agar koneksi bisa dipakai lagi
    client.release()
  }
})


// Fungsi untuk menjalankan server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    console.log(`Server backend (v3) berjalan di http://localhost:3000`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Jalankan servernya
start()