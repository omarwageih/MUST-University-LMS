import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
            },
            manifest: {
                name: 'Mini LMS University Portal',
                short_name: 'MiniLMS',
                description: 'Advanced University Learning Management System',
                theme_color: '#020617',
                icons: [
                    {
                        src: 'logo.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
    }
});
