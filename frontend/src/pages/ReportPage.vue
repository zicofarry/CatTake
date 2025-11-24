<template>
  <div class="min-h-screen font-sans overflow-x-hidden pt-20 pb-32 relative"
    style="
        background: radial-gradient(circle at top right, #cfe3d4 10%, oklch(39.3% 0.095 152.535) 80%);
        background-repeat: no-repeat;
        background-attachment: fixed;
    ">
    
    <div v-if="userRole === 'shelter'">
        
        <div class="text-center mb-8 -mt-2 space-y-6">
            <h1 class="inline-block text-3xl md:text-4xl font-extrabold text-white drop-shadow-md py-3 px-8">
                Dashboard Rescue
            </h1>

            <div class="flex justify-center">
                <div class="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg inline-flex">
                    <button 
                        @click="activeTab = 'incoming'"
                        class="px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2"
                        :class="activeTab === 'incoming' ? 'bg-[#EBCD5E] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'"
                    >
                        Permintaan Masuk 
                        <span v-if="incomingReports.length" class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{{ incomingReports.length }}</span>
                    </button>
                    <button 
                        @click="activeTab = 'tasks'"
                        class="px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300"
                        :class="activeTab === 'tasks' ? 'bg-[#3A5F50] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'"
                    >
                        Tugas Saya
                    </button>
                </div>
            </div>
        </div>

        <div class="max-w-4xl mx-auto px-4">
            
            <div v-if="activeTab === 'incoming'" class="space-y-4">
                <div v-if="incomingReports.length === 0" class="bg-white/80 backdrop-blur-md rounded-3xl p-10 text-center text-gray-500 shadow-lg">
                    <i class="fas fa-check-circle text-4xl mb-2 opacity-50"></i>
                    <p>Tidak ada laporan baru di sekitar Anda.</p>
                </div>
                
                <div v-for="report in incomingReports" :key="report.id" class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:border-[#EBCD5E] transition-colors relative overflow-hidden group">
                    <div class="absolute top-0 left-0 w-2 h-full bg-[#EBCD5E]"></div>
                    <div class="flex flex-col md:flex-row gap-6">
                        <img :src="resolveImageUrl(report.photo)" class="w-full md:w-40 h-40 object-cover rounded-2xl bg-gray-200">
                        
                        <div class="flex-grow">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-xl font-bold text-gray-800">Laporan #{{ report.id }}</h3>
                                <span class="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{{ formatDate(report.created_at) }}</span>
                            </div>
                            
                            <div class="space-y-1 text-sm text-gray-600 mb-4">
                                <p><i class="fas fa-user w-5 text-center"></i> Pelapor: <strong>{{ report.full_name || report.reporter_name }}</strong></p>
                                <p><i class="fas fa-map-marker-alt w-5 text-center"></i> {{ report.location }}</p>
                                <p><i class="fas fa-align-left w-5 text-center"></i> {{ report.description }}</p>
                            </div>

                            <div class="flex justify-end">
                                <button 
                                    @click="openDriverModal(report)"
                                    class="bg-[#EBCD5E] hover:bg-[#dcb945] text-white font-bold py-2 px-6 rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
                                >
                                    Ambil Laporan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activeTab === 'tasks'" class="space-y-4">
                <div v-if="myTasks.length === 0" class="bg-white/80 backdrop-blur-md rounded-3xl p-10 text-center text-gray-500 shadow-lg">
                    Belum ada tugas yang diambil.
                </div>

                <div v-for="task in myTasks" :key="task.assignment_id" class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                        <span 
                            class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                            :class="getStatusColor(task.assignment_status)"
                        >
                            {{ formatStatus(task.assignment_status) }}
                        </span>
                        <span class="text-sm text-gray-500">Driver: <strong>{{ task.driver_name }}</strong></span>
                    </div>

                    <div class="flex gap-4 mb-4">
                        <img :src="resolveImageUrl(task.photo)" class="w-20 h-20 rounded-xl object-cover bg-gray-200">
                        <div>
                            <p class="font-bold text-gray-800 line-clamp-1">{{ task.location }}</p>
                            <p class="text-sm text-gray-500 line-clamp-2">{{ task.description }}</p>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2">
                        <router-link 
                            :to="`/track?id=${task.tracking_id}`"
                            class="bg-[#3A5F50] hover:bg-[#2c473c] text-white font-bold py-2 px-6 rounded-xl shadow-md transition text-sm flex items-center gap-2"
                        >
                            <i class="fas fa-map"></i> Lacak Status
                        </router-link>
                    </div>
                </div>
            </div>

        </div>
    </div>
      
    <div v-else>
      
      <div class="relative w-full h-[400px] overflow-visible bg-transparent z-0">
          <div class="relative z-10 h-full max-w-6xl mx-auto px-6 flex items-center justify-center gap-12">
              <div class="flex-shrink-0 text-center md:text-left">
                <h1 class="text-5xl md:text-7xl font-bold text-white drop-shadow-lg leading-tight">
                    Lapor &<br>Temukan
                </h1>
                <p class="text-white mt-4 text-lg max-w-md hidden md:block drop-shadow-md font-medium">
                  Laporkan penemuan kucing liar, kucing orang lain yang hilang, atau umumkan kucingmu yang hilang.
                </p>

                <div class="bg-white/20 backdrop-blur-md p-1.5 rounded-full flex mt-6 shadow-lg border border-white/30 inline-flex">
                    <button 
                        @click="switchUserTab('create')"
                        class="px-6 py-2 rounded-full font-bold transition-all text-sm md:text-base"
                        :class="activeUserTab === 'create' ? 'bg-white text-[#3A5F50] shadow-lg' : 'text-white hover:bg-white/10'"
                    >
                        <i class="fas fa-edit mr-2"></i>Buat Laporan
                    </button>
                    <button 
                        @click="switchUserTab('history')"
                        class="px-6 py-2 rounded-full font-bold transition-all text-sm md:text-base"
                        :class="activeUserTab === 'history' ? 'bg-white text-[#3A5F50] shadow-lg' : 'text-white hover:bg-white/10'"
                    >
                        <i class="fas fa-history mr-2"></i>Riwayat Saya
                    </button>
                </div>
              </div>
              <div class="h-full flex items-end">
                  <img 
                    src="../assets/img/tigakucing.png" 
                    alt="Tiga Kucing" 
                    class="h-[75%] md:h-[135%] w-auto object-contain object-bottom md:translate-y-16 drop-shadow-2xl"
                  >
              </div>
          </div>
      </div>

      <div class="max-w-4xl mx-auto px-6 relative z-10 mt-12 md:mt-32">
        <div v-if="activeUserTab === 'create'">
          <div class="flex flex-wrap justify-center gap-4 mb-12">
            <div class="bg-white/80 backdrop-blur-sm p-2 rounded-[25px] shadow-sm">
                <button 
                  @click="setActiveReportType('stray')"
                  class="min-w-[160px] py-3 px-6 rounded-[20px] font-bold text-lg transition-all duration-300"
                  :class="activeReportType === 'stray' ? 'bg-[#EBCD5E] text-white shadow-md scale-105' : 'bg-transparent text-gray-600 hover:bg-gray-100'"
                >
                  Nemu Kucing Liar
                </button>
            </div>
            <div class="bg-white/80 backdrop-blur-sm p-2 rounded-[25px] shadow-sm">
                <button 
                  @click="setActiveReportType('missing')"
                  class="min-w-[160px] py-3 px-6 rounded-[20px] font-bold text-lg transition-all duration-300"
                  :class="activeReportType === 'missing' ? 'bg-[#E9B92F] text-white shadow-md scale-105' : 'bg-transparent text-gray-600 hover:bg-gray-100'"
                >
                  Nemu Kucing Hilang
                </button>
            </div>
            <div class="bg-white/80 backdrop-blur-sm p-2 rounded-[25px] shadow-sm">
                <button 
                  @click="setActiveReportType('my_lost')"
                  class="min-w-[160px] py-3 px-6 rounded-[20px] font-bold text-lg transition-all duration-300 border-2 border-transparent"
                  :class="activeReportType === 'my_lost' ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-red-500'"
                >
                  Kucing Saya Hilang!
                </button>
            </div>
          </div>

          <div class="bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[50px] shadow-2xl relative z-20 border border-white/50">
            
            <LoginOverlay 
                :isLoggedIn="isLoggedInProp" 
                :message="activeReportType === 'my_lost' ? 'Login untuk memposting info kehilangan.' : 'Kamu perlu login dulu sebelum melaporkan kucing.'" 
                buttonText="Login Sekarang" 
                loginRoute="/login"
            />

            <form v-if="activeReportType !== 'my_lost'" @submit.prevent="submitDiscoveryReport" class="space-y-8">
              
            <div v-if="activeReportType === 'missing'" class="relative">
                <label for="ownerName" class="block text-xl font-bold text-[#1F1F1F] mb-4">
                  Cari Data Kucing Hilang
                  <span class="text-sm font-normal text-gray-500 ml-2">*Ketik nama kucing atau pemilik</span>
                </label>
                
                <div class="relative">
                    <input 
                      type="text" 
                      id="ownerName"
                      v-model="searchQuery"
                      @input="handleSearchInput" 
                      @focus="isDropdownOpen = true"
                      @blur="handleBlur"
                      placeholder="Cari: 'Mochi' atau 'Andi'..."
                      autocomplete="off"
                      class="w-full p-5 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] text-lg"
                    >
                    <div class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <i v-if="isSearching" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-search"></i>
                    </div>
                </div>

                <transition name="fade">
                    <ul v-if="isDropdownOpen && searchResults.length > 0" class="absolute z-50 w-full bg-white mt-2 rounded-2xl shadow-xl max-h-60 overflow-y-auto border border-gray-100">
                        <li 
                            v-for="item in searchResults" 
                            :key="item.id"
                            @mousedown.prevent="selectLostCat(item)"
                            class="p-4 hover:bg-[#EBCD5E]/10 cursor-pointer transition-colors border-b border-gray-50 flex items-center gap-3"
                        >
                            <img :src="resolveImageUrl(item.photo)" class="w-10 h-10 rounded-full object-cover bg-gray-200">
                            
                            <div class="flex flex-col">
                                <span class="font-bold text-[#1F1F1F]">{{ item.cat_name }}</span>
                                <span class="text-xs text-gray-500">Pemilik: {{ item.owner_name }}</span>
                            </div>
                        </li>
                    </ul>
                    <div v-else-if="isDropdownOpen && searchQuery.length > 2 && !isSearching" class="absolute z-50 w-full bg-white mt-2 rounded-2xl shadow-xl p-4 text-gray-500 text-center">
                        Data tidak ditemukan.
                    </div>
                </transition>
              </div>

              <div>
                <label class="block text-xl font-bold text-[#1F1F1F] mb-4">Lokasi Ditemukan</label>
                <div class="flex gap-4 flex-col md:flex-row">
                  <div 
                    @click="openMapModal"
                    class="w-full md:w-40 h-36 flex-none bg-gray-200 rounded-2xl overflow-hidden relative cursor-pointer group"
                  >
                    <img src="../assets/img/maps.png" class="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500">

                    <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                      <i class="fas fa-map-marker-alt text-3xl text-red-500 drop-shadow-md"></i>
                    </div>
                  </div>


                  <textarea 
                    v-model="reportForm.location" 
                    required 
                    rows="4" 
                    placeholder="Klik peta di samping untuk set lokasi otomatis, atau ketik manual..."
                    class="flex-grow p-5 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-lg resize-none"
                  ></textarea>
                </div>
              </div>

              <div>
                <label class="block text-xl font-bold text-[#1F1F1F] mb-4">Deskripsi Kondisi</label>
                <textarea v-model="reportForm.description" required rows="3" placeholder="Jelaskan ciri-ciri, kondisi, dll..." class="w-full p-5 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-lg resize-none"></textarea>
              </div>

              <div>
                <label class="block text-xl font-bold text-[#1F1F1F] mb-4">Foto Bukti</label>
                <div @click="triggerFileInput" class="bg-gray-100 rounded-2xl p-8 text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#EBCD5E] transition">
                  <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange">
                  <i class="fas fa-camera text-3xl text-gray-400 mb-2"></i>
                  <p class="text-gray-500" v-if="!reportForm.file">Klik untuk ambil/upload foto</p>
                  <p class="text-[#3A5F50] font-bold" v-else>File: {{ reportForm.file.name }}</p>
                </div>
              </div>

              <div class="pt-4 text-center">
                <button type="submit" class="bg-[#EBCD5E] hover:bg-[#e0c355] text-white text-xl font-bold py-4 px-16 rounded-full shadow-lg transition-transform hover:-translate-y-1 active:scale-95 w-full md:w-auto">
                  Kirim Laporan
                </button>
              </div>
            </form>
            

            <form v-else @submit.prevent="submitLostCatAd" class="space-y-6">
                
                <div class="bg-red-50 p-4 rounded-xl border border-red-100 text-red-800 text-sm mb-6 flex gap-3">
                  <i class="fas fa-info-circle mt-1"></i>
                  <p>Data ini akan dipublikasikan di halaman "Daftar Kucing Hilang" agar komunitas bisa bantu mencari.</p>
              </div>
              <div class="flex items-center gap-3 bg-yellow-50 p-4 rounded-xl border border-yellow-200 cursor-pointer" @click="lostCatForm.shareToCommunity = !lostCatForm.shareToCommunity">
                  <div class="relative flex items-center">
                    <input type="checkbox" v-model="lostCatForm.shareToCommunity" class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-400 transition-all checked:border-[#EBCD5E] checked:bg-[#EBCD5E]">
                    <i class="fas fa-check absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-xs"></i>
                  </div>
                  <label class="text-sm font-bold text-gray-700 cursor-pointer select-none">
                      Bagikan otomatis ke postingan Komunitas agar lebih banyak yang melihat?
                  </label>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Nama Kucing</label>
                      <input type="text" v-model="lostCatForm.name" required class="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Misal: Mochi">
                  </div>
                  <div>
                      <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Umur (Bulan)</label>
                      <input type="number" v-model="lostCatForm.age" required class="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Contoh: 12">
                  </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Ras</label>
                      <input type="text" v-model="lostCatForm.breed" class="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Domestik/Persia/dll">
                  </div>
                  <div>
                      <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Warna Dominan</label>
                      <input type="text" v-model="lostCatForm.color" required class="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Oren/Hitam Putih">
                  </div>
              </div>

              <div>
                  <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Ciri-ciri Khusus</label>
                  <textarea v-model="lostCatForm.description" required rows="3" class="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none resize-none" placeholder="Contoh: Pakai kalung merah, ekor bengkok..."></textarea>
              </div>

              <div>
                  <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Lokasi Terakhir Dilihat</label>
                      <div class="flex gap-4 flex-col md:flex-row">
                          <div 
                            @click="openMapModal"
                            class="w-full md:w-40 h-36 flex-none bg-gray-200 rounded-2xl overflow-hidden relative cursor-pointer group"
                          >
                            <img src="../assets/img/maps.png" class="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500">
                            <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                              <i class="fas fa-map-marker-alt text-3xl text-red-500 drop-shadow-md"></i>
                            </div>
                          </div>
                          <textarea v-model="lostCatForm.last_seen_address" required rows="2" class="flex-grow p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none resize-none" placeholder="Klik peta di samping untuk set lokasi otomatis, atau ketik manual..."></textarea>
                      </div>
              </div>

              <div>
                  <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Imbalan (Opsional)</label>
                  <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rp</span>
                      <input type="number" v-model="lostCatForm.reward_amount" class="w-full p-4 pl-12 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="0">
                  </div>
              </div>

              <div>
                <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Foto Kucing</label>
                <div
                    @click="triggerFileInput"
                    class="bg-gray-100 rounded-2xl p-8 text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#EBCD5E] transition"
                  >
                    <input
                      type="file"
                      ref="fileInput"
                      class="hidden"
                      accept="image/*"
                      @change="handleLostCatFile"
                    >

                    <i class="fas fa-camera text-3xl text-gray-400 mb-2"></i>

                    <p class="text-gray-500" v-if="!reportForm.file">
                      Klik untuk ambil/upload foto
                    </p>

                    <p class="text-[#3A5F50] font-bold" v-else>
                      File: {{ reportForm.file.name }}
                    </p>
                  </div>
              </div>

              <div class="pt-4">
                  <button type="submit" class="w-full bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-4 rounded-full shadow-lg transition-transform hover:-translate-y-1 active:scale-95">
                      Pasang Iklan Kehilangan
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div v-if="activeUserTab === 'history'" class="space-y-6 animate-fade-in-up max-w-4xl mx-auto px-6 pb-20 relative z-10">
            
            <div v-if="myReportHistory.length === 0" class="text-center py-20 bg-white/90 backdrop-blur-md rounded-[40px] shadow-lg border border-white/50">
                <img src="/img/kucingtidur.png" class="h-32 mx-auto mb-4 opacity-50">
                <p class="text-gray-500 text-lg">Kamu belum pernah membuat laporan.</p>
                <button @click="switchUserTab('create')" class="mt-4 text-[#EBCD5E] font-bold hover:underline">Buat Laporan Sekarang</button>
            </div>

            <div v-else v-for="item in myReportHistory" :key="item.id" class="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-6 items-center md:items-start">
                
                <div class="w-full md:w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <img :src="resolveImageUrl(item.photo)" class="w-full h-full object-cover">
                </div>

                <div class="flex-grow w-full">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span 
                                class="text-xs font-bold px-2 py-1 rounded-md uppercase mb-1 inline-block"
                                :class="item.report_type === 'stray' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'"
                            >
                                {{ item.report_type === 'stray' ? 'Kucing Liar' : 'Kucing Hilang' }}
                            </span>
                            <h3 class="text-xl font-bold text-gray-800">Laporan #{{ item.id }}</h3>
                        </div>
                        <span class="text-xs text-gray-400">{{ formatDate(item.created_at) }}</span>
                    </div>

                    <p class="text-gray-600 text-sm mb-1"><i class="fas fa-map-marker-alt w-5 text-center"></i> {{ item.location }}</p>
                    <p class="text-gray-500 text-sm line-clamp-2 italic">"{{ item.description }}"</p>
                    
                    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div>
                            <p class="text-xs text-gray-400 uppercase font-bold">Status</p>
                            <p class="font-bold" :class="getStatusColor(item.assignment_status)">
                                {{ formatStatus(item.assignment_status || 'Mencari Shelter') }}
                            </p>
                        </div>

                        <router-link 
                            v-if="item.is_trackable && item.assignment_status !== 'completed'"
                            :to="`/track?id=${item.tracking_id}`"
                            class="bg-[#EBCD5E] hover:bg-[#dcb945] text-white font-bold py-2 px-6 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2 text-sm"
                        >
                            <i class="fas fa-location-arrow"></i> Lacak Driver
                        </router-link>
                        
                        <div 
                            v-else-if="item.assignment_status === 'completed'"
                            class="bg-green-100 text-green-600 font-bold py-2 px-6 rounded-xl border border-green-200 flex items-center gap-2 text-sm"
                        >
                            <i class="fas fa-check-circle"></i> Misi Sukses
                        </div>
                        
                        <button 
                            v-else 
                            class="bg-gray-100 text-gray-400 font-bold py-2 px-6 rounded-xl cursor-not-allowed text-sm"
                        >
                            <i class="fas fa-clock"></i> Menunggu
                        </button>
                    </div>
                </div>
            </div>

        </div>

      <teleport to="body">
        <div v-if="showMapModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-3xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
            <div class="bg-[#3A5F50] p-4 flex justify-between items-center text-white">
              <h3 class="text-xl font-bold">Pilih Lokasi</h3>
              <button @click="closeMapModal" class="text-white hover:text-red-300 transition"><i class="fas fa-times text-2xl"></i></button>
            </div>
            <div id="mapContainer" class="flex-grow w-full relative">
               <div v-if="isLoadingMap" class="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]"><p class="text-gray-500 text-lg animate-pulse">Sedang mencari lokasimu...</p></div>
            </div>
            <div class="p-4 bg-gray-100 text-center">
              <p class="text-gray-600 mb-3 text-sm">Klik pada peta untuk memilih titik lokasi.</p>
              <button @click="confirmLocation" class="bg-[#EBCD5E] text-white font-bold py-3 px-12 rounded-full hover:bg-[#dcb945] transition">Pilih Lokasi Ini</button>
            </div>
          </div>
        </div>
      </teleport>

    </div>

    <teleport to="body">
        <div v-if="showDriverModal" class="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                <div class="bg-[#3A5F50] p-4 text-white flex justify-between items-center">
                    <h3 class="font-bold text-lg">Pilih Driver</h3>
                    <button @click="showDriverModal = false" class="hover:text-red-300"><i class="fas fa-times"></i></button>
                </div>
                
                <div class="p-4 max-h-[60vh] overflow-y-auto">
                    <p class="text-sm text-gray-500 mb-3">Tugaskan driver untuk menjemput laporan ini.</p>
                    
                    <div v-if="drivers.length === 0" class="text-center py-4 text-gray-400">
                        Tidak ada driver tersedia.
                    </div>

                    <div 
                        v-for="driver in drivers" 
                        :key="driver.id"
                        @click="assignDriver(driver.id)"
                        class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition border border-transparent hover:border-gray-200 mb-2"
                    >
                        <img
                        :src="resolveImageUrl(driver.profile_picture)"
                        alt="Driver"
                        class="w-10 h-10 rounded-full object-cover border border-gray-300"
                        />

                        <div class="flex-grow">
                            <p class="font-bold text-gray-800">{{ driver.full_name }}</p>
                            <p class="text-xs text-gray-500">ID: {{ driver.id }}</p>
                        </div>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/http';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import LoginOverlay from '../components/LoginOverlay.vue';
import ReportCard from '../components/ReportCardItem.vue';

const router = useRouter();
const userRole = computed(() => localStorage.getItem('userRole') || 'guest');
const props = defineProps({ isLoggedInProp: Boolean });

// --- STATE ---
const activeReportType = ref('stray'); // 'stray', 'missing', 'my_lost'
const fileInput = ref(null);

// State Form Penemuan (Existing)
const reportForm = reactive({
    ownerName: '',
    location: '',
    description: '',
    file: null,
    lat: null, 
    long: null
});

// State Form Kehilangan (NEW)
const lostCatForm = reactive({
    name: '',
    age: '',
    breed: '',
    color: '',
    description: '',
    last_seen_address: '',
    last_seen_lat: null,
    last_seen_long: null,
    reward_amount: '',
    file: null,
    shareToCommunity: false
});

// --- STATE USER ---
const activeUserTab = ref('create'); // 'create' | 'history'
const myReportHistory = ref([]);

// --- METHOD USER ---
async function fetchUserHistory() {
    try {
        const res = await apiClient.get('/reports/my-history');
        myReportHistory.value = res.data;
    } catch (error) {
        console.error("Gagal load history:", error);
    }
}

// Panggil ini saat tab history diklik
function switchUserTab(tab) {
    activeUserTab.value = tab;
    if (tab === 'history') {
        fetchUserHistory();
    }
}

// STATE SHELTER
const activeTab = ref('incoming');
const incomingReports = ref([]);
const myTasks = ref([]);
const drivers = ref([]);
const showDriverModal = ref(false);
const selectedReportId = ref(null);


// Helper URL Image
function resolveImageUrl(path) {
    if (!path || path.includes('NULL')) {
        return '/img/NULL.JPG'
    }

    if (path.startsWith('http')) {
        return path
    }

    if (path.startsWith('/public/')) {
        return `http://localhost:3000${path}`
    }

    if (path.startsWith('report-')) {
        return `http://localhost:3000/public/img/report_cat/${path}`
    }

    if (path.startsWith('lost-')) {
        return `http://localhost:3000/public/img/lost_cat/${path}`
    }

    if (path.startsWith('profile-') || path.startsWith('driver-')) {
        return `http://localhost:3000/public/img/profile/${path}`
    }

    if (path.startsWith('qr')) {
        return `http://localhost:3000/public/img/qr_img/${path}`
    }

    return `/img/placeholder.png`
}


// Helper Date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Helper Status
function getStatusColor(status) {
    if (status === 'assigned') return 'bg-blue-100 text-blue-600';
    if (status === 'in_transit') return 'bg-yellow-100 text-yellow-600';
    if (status === 'completed') return 'bg-green-100 text-green-600';
    return 'bg-gray-100 text-gray-600';
}

function formatStatus(status) {
    if (status === 'assigned') return 'Ditugaskan';
    if (status === 'in_transit') return 'Dijemput';
    if (status === 'completed') return 'Selesai';
    return status;
}

// --- API CALLS SHELTER ---
async function fetchShelterData() {
    if (userRole.value !== 'shelter') return;
    
    try {
        // 1. Get Incoming
        const resIncoming = await apiClient.get('/rescue/incoming');
        incomingReports.value = resIncoming.data;

        // 2. Get My Tasks
        const resTasks = await apiClient.get('/rescue/my-tasks');
        myTasks.value = resTasks.data;

        // 3. Get Drivers (Untuk Modal)
        const resDrivers = await apiClient.get('/rescue/drivers');
        drivers.value = resDrivers.data;

    } catch (error) {
        console.error("Gagal load data shelter:", error);
    }
}

function openDriverModal(report) {
    selectedReportId.value = report.id;
    showDriverModal.value = true;
}

async function assignDriver(driverId) {
    if (!confirm("Tugaskan driver ini?")) return;

    try {
        await apiClient.post('/rescue/accept', {
            reportId: selectedReportId.value,
            driverId: driverId
        });
        
        alert("Berhasil mengambil laporan!");
        showDriverModal.value = false;
        fetchShelterData(); // Refresh data
        activeTab.value = 'tasks'; // Pindah tab

    } catch (error) {
        console.error(error);
        alert("Gagal mengambil laporan: " + (error.response?.data?.error || error.message));
    }
}


// State Peta & Autocomplete
const showMapModal = ref(false);
const isLoadingMap = ref(false);
let map = null;
let marker = null;
const tempLocation = reactive({ address: '', lat: null, lng: null });

const searchQuery = ref('');
const isDropdownOpen = ref(false);
const isSearching = ref(false);
const searchResults = ref([]); // Array hasil pencarian dari API
let searchTimeout = null;
// const filteredOwners = computed(() => dummyOwners.value.filter(o => o.name.toLowerCase().includes(searchQuery.value.toLowerCase())));

// --- METHODS ---

// Autocomplete Logic
// function selectOwner(owner) { searchQuery.value = owner.name; reportForm.ownerName = owner.name; isDropdownOpen.value = false; }
function handleSearchInput() {
    isDropdownOpen.value = true;
    if (searchTimeout) clearTimeout(searchTimeout);

    if (searchQuery.value.length < 2) {
        searchResults.value = [];
        return;
    }

    isSearching.value = true;
    // Tunggu 500ms setelah user berhenti mengetik baru request ke API
    searchTimeout = setTimeout(async () => {
        try {
            const response = await apiClient.get(`/lost-cats/search?q=${searchQuery.value}`);
            searchResults.value = response.data;
        } catch (error) {
            console.error("Gagal mencari kucing:", error);
        } finally {
            isSearching.value = false;
        }
    }, 500);
}

// 2. Saat item dipilih
function selectLostCat(item) {
    // Set teks input: "Mochi - Andi"
    searchQuery.value = `${item.cat_name} - ${item.owner_name}`; 
    
    // Simpan data penting ke form
    reportForm.ownerName = item.owner_name; 
    reportForm.lostCatId = item.id; // PENTING: Simpan ID ini untuk dikirim ke backend nanti
    
    isDropdownOpen.value = false;
}

function handleBlur() { 
    setTimeout(() => { isDropdownOpen.value = false; }, 200); 
}

function setActiveReportType(type) {
    activeReportType.value = type;
}
// File Handling
function triggerFileInput() { fileInput.value.click(); }
function handleFileChange(event) { const file = event.target.files[0]; if (file) reportForm.file = file; }
function handleLostCatFile(event) { const file = event.target.files[0]; if (file) lostCatForm.file = file; }

// Map Logic
async function openMapModal() {
    showMapModal.value = true;
    isLoadingMap.value = true;
    await nextTick();
    
    if (!map) {
        map = L.map('mapContainer').setView([-6.9175, 107.6191], 13); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // --- MODIFIKASI BAGIAN INI ---
        map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            
            // 1. Update Marker di Peta
            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lng]).addTo(map);
            
            // 2. Simpan koordinat sementara
            tempLocation.lat = lat;
            tempLocation.lng = lng;
            
            // 3. Set status loading di text area
            tempLocation.address = "Mencari alamat...";

            // 4. Panggil API Nominatim (Reverse Geocoding)
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data && data.display_name) {
                    // Jika alamat ditemukan
                    tempLocation.address = data.display_name;
                } else {
                    // Fallback jika alamat tidak ada
                    tempLocation.address = `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                }
            } catch (error) {
                console.error("Gagal mengambil alamat:", error);
                tempLocation.address = `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            }
        });
        // -----------------------------
    }

    // Logic GeoLocation browser (Opsional: tambahkan reverse geocoding juga di sini jika mau)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 16);
            
            if (marker) map.removeLayer(marker);
            marker = L.marker([latitude, longitude]).addTo(map);
            
            tempLocation.lat = latitude;
            tempLocation.lng = longitude;
            
            // Auto fetch address untuk lokasi saat ini
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
                const response = await fetch(url);
                const data = await response.json();
                tempLocation.address = data.display_name || `Koordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            } catch (e) {
                tempLocation.address = `Koordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            }

            isLoadingMap.value = false;
        }, () => { isLoadingMap.value = false; });
    } else { isLoadingMap.value = false; }
}

function confirmLocation() {
    if (activeReportType.value === 'my_lost') {
        lostCatForm.last_seen_address = tempLocation.address;
        lostCatForm.last_seen_lat = tempLocation.lat;
        lostCatForm.last_seen_long = tempLocation.lng;
    } else {
        reportForm.location = tempLocation.address;
        reportForm.lat = tempLocation.lat;
        reportForm.long = tempLocation.lng;
    }
    closeMapModal();
}

function closeMapModal() {
    showMapModal.value = false;
    if (map) { map.remove(); map = null; marker = null; }
}

async function submitDiscoveryReport() {
    if (!reportForm.file) { alert('Mohon sertakan foto bukti.'); return; }
    // Di sini nanti kirim reportForm.lostCatId juga ke backend
    try {
      const formData = new FormData();
      
      // 2. Tentukan Tipe Laporan untuk Backend
      // Jika tab "Nemu Kucing Hilang" aktif -> report_type = 'Found_Missing'
      // Jika tab "Nemu Kucing Liar" aktif -> report_type = 'stray' (nanti dihandle backend)
      let typeToSend = 'stray';
      if (activeReportType.value === 'missing') {
          typeToSend = 'missing';
      }
      
      formData.append('report_type', typeToSend);
      formData.append('location', reportForm.location);
      formData.append('description', reportForm.description);
      
      // 3. Kirim Koordinat (Jika user set lokasi via peta)
      if (reportForm.lat) formData.append('lat', reportForm.lat);
      if (reportForm.long) formData.append('long', reportForm.long);
      
      // 4. Kirim ID Kucing Hilang (PENTING: Agar terhubung ke tabel lost_cats)
      if (activeReportType.value === 'missing' && reportForm.lostCatId) {
          formData.append('lost_cat_id', reportForm.lostCatId);
      }
      
      // 5. Kirim File Foto
      formData.append('photo', reportForm.file);

      // 6. Panggil API Backend
      await apiClient.post('/reports', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Terima kasih! Laporan penemuan berhasil dikirim. Tim kami akan segera memproses.');
      
      // Redirect ke halaman tracking atau beranda
      router.push('/track'); 

  } catch (error) {
      console.error("Gagal lapor penemuan:", error);
      alert('Gagal mengirim laporan: ' + (error.response?.data?.error || error.message));
  }
}

async function submitLostCatAd() {
    if (!lostCatForm.name || !lostCatForm.age || !lostCatForm.file) {
        alert('Mohon lengkapi data wajib (Nama, Umur, Foto).');
        return;
    }
    try {
        const formData = new FormData();
        formData.append('name', lostCatForm.name);
        formData.append('age', lostCatForm.age);
        formData.append('breed', lostCatForm.breed);
        formData.append('color', lostCatForm.color);
        formData.append('description', lostCatForm.description);
        formData.append('last_seen_address', lostCatForm.last_seen_address);
        if (lostCatForm.last_seen_lat) formData.append('last_seen_lat', lostCatForm.last_seen_lat);
        if (lostCatForm.last_seen_long) formData.append('last_seen_long', lostCatForm.last_seen_long);
        if (lostCatForm.reward_amount) formData.append('reward_amount', lostCatForm.reward_amount);
        formData.append('share_to_community', lostCatForm.shareToCommunity);
        formData.append('photo', lostCatForm.file);

        await apiClient.post('/lost-cats', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Iklan Kehilangan Berhasil Diposting!');
        router.push('/'); 
    } catch (error) {
        console.error(error);
        alert('Gagal memposting iklan: ' + (error.response?.data?.error || error.message));
    }
}

const mockShelterReports = ref([
    { id: 1, type: 'stray', date: '2025/11/20 10:00', location: 'Bandung', description: 'Kucing liar sakit', reporter: { name: 'Budi', profilePic: '' } }
]);

onMounted(() => {
    fetchShelterData();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>