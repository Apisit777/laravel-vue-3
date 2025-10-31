import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

import path from 'path'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.ts'],
      ssr: 'resources/js/ssr.ts',
      refresh: true,
    }),
    tailwindcss(),
    wayfinder({
      formVariants: true,
    }),
    vue({
      template: {
        transformAssetUrls: {
          base: null,
          includeAbsolute: false,
        },
      },
    }),
  ],

  // ✅ บังคับปิดการใช้ LightningCSS ทั้งตอน dev และ build
  css: {
    // ใช้ PostCSS pipeline (เช่น Tailwind) แทน LightningCSS
    // (option นี้มีใน Vite 5.x)
    transformer: 'postcss',
  },
  build: {
    // ใช้ esbuild เป็นตัว minify CSS แทน LightningCSS
    cssMinify: 'esbuild',
  },

  // กัน Vite พยายาม bundle lightningcss ตอน optimize deps
  optimizeDeps: {
    exclude: ['lightningcss'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js'),   // ✅ เพิ่มบรรทัดนี้
    },
  },
});