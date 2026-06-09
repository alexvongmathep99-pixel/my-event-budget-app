import { defineConfig } from 'vite'
import react from '@vitejs/react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/my-event-budget-app/', // ⚠️ ຕ້ອງເພີ່ມແຖວນີ້ເຂົ້າໄປໃຫ້ຕົງກັບຊື່ Repository ເດີ້
})