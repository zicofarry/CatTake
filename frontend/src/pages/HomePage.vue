<template>
  <main class="overflow-x-hidden min-h-screen bg-gray-50">
    
    <div v-if="userRole === 'shelter'" class="min-h-screen pb-20 relative">
        
        <div class="absolute top-0 left-0 w-full h-[400px] z-0" 
             style="
                background: radial-gradient(circle at top right, #cfe3d4 10%, oklch(39.3% 0.095 152.535) 80%);
                border-bottom-left-radius: 50px;
                border-bottom-right-radius: 50px;
             ">
        </div>

        <div class="relative z-10 max-w-6xl mx-auto px-6 pt-32">
            
            <div class="flex flex-col md:flex-row justify-between items-center mb-12 text-white">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <div class="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <i class="fas fa-home text-xl"></i>
                        </div>
                        <span class="uppercase tracking-widest text-sm font-bold opacity-80">Dashboard Partner</span>
                    </div>
                    <h1 class="text-4xl md:text-5xl font-extrabold drop-shadow-md">Halo, {{ shelterName }}! 👋</h1>
                    <p class="mt-2 text-lg text-white/90 font-medium max-w-xl">
                        Siap menyelamatkan nyawa hari ini? Berikut ringkasan aktivitas sheltermu.
                    </p>
                </div>
                <div class="mt-6 md:mt-0 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
                    <div class="text-right">
                        <p class="text-xs text-gray-200 uppercase font-bold">Status Akun</p>
                        <p class="font-bold text-[#EBCD5E] flex items-center gap-1 justify-end">
                            <i class="fas fa-check-circle"></i> Terverifikasi
                        </p>
                    </div>
                    <img src="/img/cathelo.png" class="w-12 h-12 rounded-full bg-white border-2 border-[#EBCD5E]">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div class="bg-white p-6 rounded-3xl shadow-xl border-l-8 border-[#EBCD5E] hover:-translate-y-1 transition-transform">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-gray-500 text-sm font-bold uppercase mb-1">Rescue Masuk</p>
                            <h3 class="text-4xl font-extrabold text-gray-800">{{ dashboardData.incoming_rescue }}</h3>
                            <p class="text-xs text-gray-400 mt-2">Laporan masuk</p>
                        </div>
                        <div class="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-[#dcb945] text-2xl">
                            <i class="fas fa-ambulance"></i>
                        </div>
                    </div>
                    <router-link to="/lapor" class="mt-4 inline-block text-sm font-bold text-[#dcb945] hover:underline">Lihat Laporan &rarr;</router-link>
                </div>

                <div class="bg-white p-6 rounded-3xl shadow-xl border-l-8 border-[#3A5F50] hover:-translate-y-1 transition-transform">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-gray-500 text-sm font-bold uppercase mb-1">Permintaan Adopsi</p>
                            <h3 class="text-4xl font-extrabold text-gray-800">{{ dashboardData.pending_adoption }}</h3>
                            <p class="text-xs text-gray-400 mt-2">Menunggu verifikasi</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-[#3A5F50] text-2xl">
                            <i class="fas fa-clipboard-check"></i>
                        </div>
                    </div>
                    <router-link to="/adopsi" class="mt-4 inline-block text-sm font-bold text-[#3A5F50] hover:underline">Cek Pengajuan &rarr;</router-link>
                </div>

                <div class="bg-white p-6 rounded-3xl shadow-xl border-l-8 border-[#2c473c] hover:-translate-y-1 transition-transform">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-gray-500 text-sm font-bold uppercase mb-1">Kucing Dikelola</p>
                            <h3 class="text-4xl font-extrabold text-gray-800">{{ dashboardData.managed_cats }}</h3>
                            <p class="text-xs text-gray-400 mt-2">Total penghuni shelter</p>
                        </div>
                        <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 text-2xl">
                            <i class="fas fa-cat"></i>
                        </div>
                    </div>
                    <router-link to="/shelter/cats" class="mt-4 inline-block text-sm font-bold text-[#2c473c] hover:underline">Kelola Data &rarr;</router-link>
                </div>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-6">Menu Cepat</h2>

              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 place-items-stretch">

              <!-- Rescue -->
              <router-link
                  to="/lapor"
                  class="group bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-[#EBCD5E] flex flex-col items-center text-center justify-between min-h-[180px]"
              >
                  <div class="flex flex-col items-center">
                      <div
                          class="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center text-[#EBCD5E] text-2xl mb-3 group-hover:scale-110 transition-transform"
                      >
                          <i class="fas fa-map-marked-alt"></i>
                      </div>
                      <h3 class="font-bold text-gray-800">Misi Rescue</h3>
                      <p class="text-xs text-gray-500 mt-1">
                          Tugaskan driver
                      </p>
                  </div>
              </router-link>

              <!-- Adopter -->
              <router-link
                  to="/adopsi"
                  class="group bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-500 flex flex-col items-center text-center justify-between min-h-[180px]"
              >
                  <div class="flex flex-col items-center">
                      <div
                          class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 text-2xl mb-3 group-hover:scale-110 transition-transform"
                      >
                          <i class="fas fa-users"></i>
                      </div>
                      <h3 class="font-bold text-gray-800">Calon Adopter</h3>
                      <p class="text-xs text-gray-500 mt-1">
                          Seleksi berkas
                      </p>
                  </div>
              </router-link>

              <!-- Donasi -->
              <router-link
                  to="/donasi"
                  class="group bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-purple-500 flex flex-col items-center text-center justify-between min-h-[180px]"
              >
                  <div class="flex flex-col items-center">
                      <div
                          class="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 text-2xl mb-3 group-hover:scale-110 transition-transform"
                      >
                          <i class="fas fa-hand-holding-heart"></i>
                      </div>
                      <h3 class="font-bold text-gray-800">Laporan Donasi</h3>
                      <p class="text-xs text-gray-500 mt-1">
                          Cek pemasukan
                      </p>
                  </div>
              </router-link>

              <!-- Kucing -->
              <router-link
                  to="/shelter/cats"
                  class="group bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-[#3A5F50] flex flex-col items-center text-center justify-between min-h-[180px]"
              >
                  <div class="flex flex-col items-center">
                      <div
                          class="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-[#3A5F50] text-2xl mb-3 group-hover:scale-110 transition-transform"
                      >
                          <i class="fas fa-paw"></i>
                      </div>
                      <h3 class="font-bold text-gray-800">Kucing Saya</h3>
                      <p class="text-xs text-gray-500 mt-1">
                          Tambah & edit data
                      </p>
                  </div>
              </router-link>

              <!-- Driver -->
              <!-- <router-link
                  to="/shelter/driver"
                  class="group bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-[#2563eb] flex flex-col items-center text-center justify-between min-h-[180px]"
              >
                  <div class="flex flex-col items-center">
                      <div
                          class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-[#2563eb] text-2xl mb-3 group-hover:scale-110 transition-transform"
                      >
                          <i class="fas fa-truck"></i>
                      </div>
                      <h3 class="font-bold text-gray-800">Driver Saya</h3>
                      <p class="text-xs text-gray-500 mt-1">
                          Tambah & edit data
                      </p>
                  </div>
              </router-link> -->

          </div>


        </div>
    </div>

    <div v-else>
        <section class="py-20 px-6 bg-white">
          <div class="max-w-6xl mx-auto">
            <div class="flex flex-col md:flex-row items-center gap-12 mb-16">
              <div class="md:w-1/2 order-2 md:order-1">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-1 bg-[#EBCD5E] rounded-full"></div>
                  <span class="text-[#3A5F50] font-bold text-sm uppercase tracking-wider">Tentang Kami</span>
                </div>
                <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Menciptakan Dunia Lebih Baik Bagi <span class="text-[#3A5F50]">Bangsa Kucing</span>
                </h2>
                <p class="text-gray-500 text-lg leading-relaxed mb-8">
                  Setiap kucing berhak mendapatkan tempat yang hangat. CatTake hadir untuk memastikan tidak ada lagi anabul yang terlantar di jalanan.
                </p>
                <div class="grid grid-cols-3 gap-6 border-t border-gray-200 pt-8">
                  <div>
                    <h3 class="text-3xl font-bold text-[#3A5F50]">150+</h3>
                    <p class="text-sm text-gray-500 mt-1">Nyawa Selamat</p>
                  </div>
                  <div>
                    <h3 class="text-3xl font-bold text-[#3A5F50]">80+</h3>
                    <p class="text-sm text-gray-500 mt-1">Rumah Baru</p>
                  </div>
                  <div>
                    <h3 class="text-3xl font-bold text-[#3A5F50]">1k+</h3>
                    <p class="text-sm text-gray-500 mt-1">Teman Meow</p>
                  </div>
                </div>
              </div>
              <div class="md:w-1/2 relative order-1 md:order-2">
                <div class="absolute top-0 right-0 w-32 h-32 bg-[#EBCD5E]/20 rounded-full blur-3xl -z-10"></div>
                <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Cute Cat Close up" class="rounded-[40px] shadow-2xl w-full object-cover h-[400px] md:h-[500px]" />
                <div class="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4 max-w-[220px] animate-bounce-slow">
                  <div class="bg-orange-100 p-3 rounded-full text-orange-500">
                    <i class="fas fa-cat"></i>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Status Misi</p>
                    <p class="font-bold text-gray-800">Banyak Kucing Bahagia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="bg-[#1F352C] py-4 overflow-hidden relative">
          <div class="animate-marquee whitespace-nowrap flex gap-8 items-center text-white/90 font-bold text-lg tracking-widest uppercase">
            <span>Rescue</span> <span class="text-[#EBCD5E]">•</span>
            <span>Meow</span> <span class="text-[#EBCD5E]">•</span>
            <span>Save Lives</span> <span class="text-[#EBCD5E]">•</span>
            <span>Adopt</span> <span class="text-[#EBCD5E]">•</span>
            <span>Rescue</span> <span class="text-[#EBCD5E]">•</span>
            <span>Meow</span> <span class="text-[#EBCD5E]">•</span>
            <span>Save Lives</span> <span class="text-[#EBCD5E]">•</span>
            <span>Adopt</span>
          </div>
        </div>

        <section class="py-24 px-6 bg-[#1F352C] relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div class="absolute -top-24 -right-24 w-96 h-96 bg-[#EBCD5E] rounded-full blur-[100px]"></div>
          </div>
          <div class="max-w-6xl mx-auto relative z-10">
            <div class="text-center mb-16">
              <span class="text-[#EBCD5E] font-bold uppercase tracking-wider text-sm">Layanan Kami</span>
              <h2 class="text-3xl md:text-4xl font-bold text-white mt-3">Bantu Anabul Dengan Cara Kamu</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="bg-[#2C4A3E] p-8 rounded-[30px] hover:-translate-y-2 transition-transform duration-300 border border-[#3A5F50] group">
                <div class="w-14 h-14 bg-[#3A5F50] rounded-2xl flex items-center justify-center text-[#EBCD5E] text-2xl mb-6 group-hover:bg-[#EBCD5E] group-hover:text-[#1F352C] transition-colors">
                  <i class="fas fa-camera"></i>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Lapor Penemuan</h3>
                <p class="text-gray-300 mb-8 leading-relaxed text-sm">Lihat kucing terlantar? Foto dan laporkan lokasinya agar bisa segera kami selamatkan.</p>
                <router-link to="/lapor" class="inline-flex items-center gap-2 text-[#EBCD5E] font-bold hover:gap-4 transition-all">Buat Laporan <i class="fas fa-arrow-right"></i></router-link>
              </div>
              <div class="bg-[#2C4A3E] p-8 rounded-[30px] hover:-translate-y-2 transition-transform duration-300 border border-[#3A5F50] group relative">
                <div class="absolute top-0 right-0 bg-[#EBCD5E] text-[#1F352C] text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-[28px]">Popular</div>
                <div class="w-14 h-14 bg-[#3A5F50] rounded-2xl flex items-center justify-center text-[#EBCD5E] text-2xl mb-6 group-hover:bg-[#EBCD5E] group-hover:text-[#1F352C] transition-colors">
                  <i class="fas fa-paw"></i>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Adopsi Anabul</h3>
                <p class="text-gray-300 mb-8 leading-relaxed text-sm">Temukan kucing impianmu yang siap untuk diadopsi hari ini dari shelter terpercaya.</p>
                <router-link to="/adopsi" class="inline-flex items-center gap-2 text-[#EBCD5E] font-bold hover:gap-4 transition-all">Cari Kucing <i class="fas fa-arrow-right"></i></router-link>
              </div>
              <div class="bg-[#2C4A3E] p-8 rounded-[30px] hover:-translate-y-2 transition-transform duration-300 border border-[#3A5F50] group">
                <div class="w-14 h-14 bg-[#3A5F50] rounded-2xl flex items-center justify-center text-[#EBCD5E] text-2xl mb-6 group-hover:bg-[#EBCD5E] group-hover:text-[#1F352C] transition-colors">
                  <i class="fas fa-heart"></i>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Komunitas Pecinta</h3>
                <p class="text-gray-300 mb-8 leading-relaxed text-sm">Gabung dengan pecinta kucing lainnya. Berbagi tips, cerita lucu, dan dukung shelter.</p>
                <router-link to="/komunitas" class="inline-flex items-center gap-2 text-[#EBCD5E] font-bold hover:gap-4 transition-all">Gabung Sekarang <i class="fas fa-arrow-right"></i></router-link>
              </div>
            </div>
          </div>
        </section>

        <section class="py-24 px-6 bg-[#F9FAFB]">
          <div class="max-w-6xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <div class="flex items-center gap-2 mb-4">
                  <i class="fas fa-sync text-[#EBCD5E]"></i>
                  <span class="text-[#3A5F50] font-bold text-sm uppercase tracking-wider">Cara Kerja</span>
                </div>
                <h2 class="text-4xl font-bold text-gray-900 max-w-lg">Langkah Mudah Menyelamatkan <span class="text-[#EBCD5E]">Nyawa</span></h2>
                 <p class="text-gray-500 max-w-md text-sm leading-relaxed mt-4">
                  Tidak perlu jadi ahli untuk membantu. Cukup ikuti 3 langkah sederhana ini.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="bg-white p-8 rounded-[30px] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-0 right-0 bg-[#EBCD5E]/10 w-24 h-24 rounded-bl-[100px] transition-all group-hover:bg-[#EBCD5E]/20"></div>
                <span class="text-7xl font-bold text-gray-300 absolute -bottom-0 -right-0 z-0 group-hover:text-[#EBCD5E]/50 transition-colors">01</span>
                <div class="relative z-10">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-[#3A5F50] mb-6">
                    <i class="fas fa-search"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800 mb-3">Snap & Lapor</h3>
                  <p class="text-gray-500 text-sm leading-relaxed">Ambil foto kucing yang butuh bantuan dan pastikan lokasinya akurat di peta.</p>
                </div>
              </div>
              <div class="bg-white p-8 rounded-[30px] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-0 right-0 bg-[#3A5F50]/5 w-24 h-24 rounded-bl-[100px] transition-all group-hover:bg-[#3A5F50]/10"></div>
                <span class="text-7xl font-bold text-gray-300 absolute -bottom-0 -right-0 z-0 group-hover:text-[#3A5F50]/40 transition-colors">02</span>
                <div class="relative z-10">
                  <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-6">
                    <i class="fas fa-check-circle"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800 mb-3">Verifikasi</h3>
                  <p class="text-gray-500 text-sm leading-relaxed">Laporan akan diverifikasi oleh shelter terdekat untuk memastikan kondisi kucing.</p>
                </div>
              </div>
              <div class="bg-white p-8 rounded-[30px] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-0 right-0 bg-orange-100/50 w-24 h-24 rounded-bl-[100px] transition-all group-hover:bg-orange-100"></div>
                <span class="text-7xl font-bold text-gray-300 absolute -bottom-0 -right-0 z-0 group-hover:text-orange-300/50 transition-colors">03</span>
                <div class="relative z-10">
                  <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-6">
                    <i class="fas fa-hands-helping"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800 mb-3">Rescue & Adopsi</h3>
                  <p class="text-gray-500 text-sm leading-relaxed">Kucing diselamatkan, dirawat, dan siap dicarikan rumah baru (Adopsi).</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="py-24 px-6 bg-white">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-12">
              <span class="text-[#EBCD5E] font-bold uppercase tracking-wider text-sm">Hall of Fame</span>
              <h2 class="text-3xl md:text-4xl font-bold text-[#3A5F50] mt-3">Alumni CatTake (Sudah Teradopsi)</h2>
              <p class="text-gray-500 mt-2 max-w-2xl mx-auto">
                Mereka yang telah menemukan rumah barunya dan hidup bahagia.
              </p>
            </div>

            <TransitionGroup 
              name="list" 
              tag="div" 
              class="flex flex-wrap justify-center gap-6"
            >
              <div 
                v-for="(cat, index) in visibleCats" 
                :key="cat.name" 
                class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all w-full sm:w-[280px]"
              >
                <div class="h-48 overflow-hidden relative">
                  <img :src="cat.img" :alt="cat.name" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div class="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wide">
                    Adopted
                  </div>
                </div>
                <div class="p-4">
                  <h4 class="font-bold text-gray-800 text-lg">{{ cat.name }}</h4>
                  <p class="text-sm text-gray-500 mt-1">Adopter: <span class="text-[#3A5F50] font-semibold">{{ cat.adopter }}</span></p>
                  <div class="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                    <span class="flex items-center gap-1 font-medium text-gray-500">
                      <i class="fas fa-cat text-gray-400"></i> {{ cat.breed }}
                    </span>
                    <i class="fas fa-paw text-[#EBCD5E]"></i>
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <div class="text-center mt-12">
              <button 
                @click="toggleView"
                class="inline-block px-8 py-4 bg-[#3A5F50] text-white rounded-full font-bold shadow-lg hover:bg-[#2C4A3E] hover:shadow-xl transition-all transform hover:-translate-y-1 focus:outline-none"
              >
                <span v-if="visibleCount < adoptedCats.length">Lihat Semua Alumni ({{ adoptedCats.length }})</span>
                <span v-else>Tutup Galeri</span>
              </button>
            </div>

          </div>
        </section>
    </div>

  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import HeroSection from '../components/HeroSection.vue';
import { jwtDecode } from 'jwt-decode'; // Import buat ambil nama shelter
import apiClient from '@/api/http'; // Import apiClient

const userRole = computed(() => localStorage.getItem('userRole') || 'guest');
const shelterName = ref('Shelter');

// [BARU] State untuk menyimpan data dashboard
const dashboardData = ref({
    incoming_rescue: 0,
    pending_adoption: 0,
    managed_cats: 0
});

// --- LOGIC SHELTER ---
function getShelterName() {
    const token = localStorage.getItem('userToken');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            shelterName.value = decoded.username || 'Partner';
        } catch (error) { 
            console.error(error); 
        }
    }
}

// [BARU] Fungsi untuk mengambil data dashboard dari backend
async function fetchDashboardData() {
    if (userRole.value !== 'shelter') return;
    try {
        const response = await apiClient.get('/dashboard'); // Endpoint baru
        dashboardData.value = response.data.data;
    } catch (error) {
        console.error("Gagal mengambil data dashboard shelter:", error);
        // Fallback ke 0 jika gagal
        dashboardData.value = { incoming_rescue: 0, pending_adoption: 0, managed_cats: 0 };
    }
}

// --- LOGIC USER ---
const heroContent = computed(() => {
  const baseContent = {
    title: 'Rescue. Snap. Save.',
    subtitle: 'Bersama kita bisa menyelamatkan lebih banyak kucing dan memberikan mereka kehidupan yang lebih baik.'
  };

  if (userRole.value === 'shelter') {
    return {
      ...baseContent,
      buttonText: 'Cek Laporan Masuk',
      buttonLink: '/lapor' 
    };
  } else {
    const targetLink = userRole.value === 'guest' ? '/login' : '/lapor';
    return {
      ...baseContent,
      buttonText: 'Buat Laporan',
      buttonLink: targetLink 
    };
  }
});

const adoptedCats = [
  { name: 'Mimi', img: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400', adopter: 'Azmi', breed: 'Domestik' }, 
  { name: 'Popo', img: 'https://images.unsplash.com/photo-1519052537078-e6302a4968ef?w=400', adopter: 'Azmi', breed: 'Persia' }, 
  { name: 'Lili', img: 'https://images.unsplash.com/photo-1501820488136-72669149e0d4?w=400', adopter: 'Azmi', breed: 'Anggora' }, 
  { name: 'Gembul', img: 'https://images.unsplash.com/photo-1494256997604-0e105c51e295?w=400', adopter: 'Azmi', breed: 'British Short.' }, 
  { name: 'Chiko', img: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400', adopter: 'Azmi', breed: 'Domestik' },
];

const visibleCount = ref(3);

const visibleCats = computed(() => {
  return adoptedCats.slice(0, visibleCount.value);
});

function toggleView() {
  if (visibleCount.value < adoptedCats.length) {
    visibleCount.value = adoptedCats.length;
  } else {
    visibleCount.value = 3;
  }
}

onMounted(() => {
    if(userRole.value === 'shelter') {
        getShelterName();
        fetchDashboardData(); // Panggil fungsi fetch data baru
    }
});
</script>

<style scoped>
/* Animasi Marquee */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
  width: 200%;
}

/* Animasi Floating Badge */
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}

/* ANIMASI LIST (Dreeeert Effect) */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-active {
  position: absolute;
}
</style>