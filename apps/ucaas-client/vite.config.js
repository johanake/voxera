import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@ucaas/shared': path.resolve(__dirname, '../../packages/shared/src'),
            '@ucaas/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
        },
    },
    server: {
        port: 3002,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
