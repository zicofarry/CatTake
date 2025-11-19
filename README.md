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
   untuk frontend
   ```
   npm install -g nodemon
   cd frontend/
   npm install vue-router@4
   npm install tailwindcss @tailwindcss/vite
   npm install vite-plugin-vue-devtools --save-dev
   npm install leaflet
   npm install axios
   npm install jwt-decode
   ```

   untuk backend
   ```
   cd backend/
   npm install fastify pg
   npm install bcrypt jsonwebtoken
   npm install @fastify/cors
   ```

3. Jalankan server
   dengan command:
   ```
   npm run dev
   ```

Website dengan framework vue harusnya sudah bisa dijalankan.