import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ⚠️ ປ່ຽນມາໃຊ້ຕົວປົກກະຕິທີ່ເຄື່ອງເຈົ້າມີ

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/my-event-budget-app/', // ⚠️ ຄ່າເສັ້ນທາງສຳລັບ GitHub Pages
})