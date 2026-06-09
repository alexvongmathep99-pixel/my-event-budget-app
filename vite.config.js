import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/my-event-budget-app/', // ⚠️ ຫ້າມລືມເຄື່ອງໝາຍ ຈຸດ (,) ທາງທ້າຍເດີ້
})