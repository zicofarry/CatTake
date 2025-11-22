<!-- # Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support). -->

# How to Install and Run
1. Clone repository ke local dulu, bisa 2 cara:
   ```terminal
   git clone https://github.com/zicofarry/CatTake.git
   ```
   atau dengan clone menggunakan GitHub Desktop.

2. Install requirements
   dengan command:
   
   untuk auto-update server, di direktori CatTake
   ```
   npm install -g nodemon
   ```

   untuk frontend
   ```
   cd frontend/
   npm install vue-router@4
   npm install tailwindcss @tailwindcss/vite
   npm install vite-plugin-vue-devtools --save-dev
   npm install leaflet
   npm install axios
   npm install jwt-decode
   npm install vue3-google-login
   ```

   untuk backend
   ```
   cd backend/
   npm install fastify pg
   npm install bcrypt jsonwebtoken
   npm install @fastify/cors
   npm install @fastify/static
   npm install @fastify/multipart
   npm install google-auth-library
   ```

3. Import database
   
   Kembali ke direktori CatTake, lalu lakukan ini:
   - Jika belum membuat database cattake
     ```
     createdb -U postgres cattake && psql -U postgres -d cattake -f "backend/db/cattake.sql"
     ```

   - Jika sudah membuat database cattake (database wajib kosong)
     ```
     psql -U postgres -d cattake -f "backend/db/cattake.sql"
     ```

   - sesuaikan config, cd backend/config/db.js (ubah password sesuai password postgre kamu)

4. Jalankan server
   dengan command:

   untuk frontend
   ```
   cd frontend/
   npm run dev
   ```

   untuk backend
   ```
   cd backend/
   nodemon server.js
   ```

5. Script setup, pastikan database cattake sudah di drop
   
   ```
   createdb -U postgres cattake && psql -U postgres -d cattake -f "backend/db/cattake.sql"
   npm install -g nodemon
   cd frontend/
   npm install vue-router@4
   npm install tailwindcss @tailwindcss/vite
   npm install vite-plugin-vue-devtools --save-dev
   npm install leaflet
   npm install axios
   npm install jwt-decode
   npm install vue3-google-login
   cd ../backend/
   npm install fastify pg
   npm install bcrypt jsonwebtoken
   npm install @fastify/cors
   npm install @fastify/static
   npm install @fastify/multipart
   npm install google-auth-library

   ```

   lalu jalankan server seperti di no 4