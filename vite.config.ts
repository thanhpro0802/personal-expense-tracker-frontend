import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // 👈 Thêm path để tạo alias

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // 👈 Alias `@` trỏ về thư mục `src`
        },
    },
    server: {
        port: 5173, // bạn có thể đổi nếu cần
    },
});
