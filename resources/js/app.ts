import Aura from '@primevue/themes/aura';

import 'primeicons/primeicons.css';   // ไอคอนยังใช้ได้ปกติ

import '../css/app.css';

import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { DefineComponent } from 'vue';
import { createApp, h } from 'vue';
import { initializeTheme } from './composables/useAppearance';
import { echo } from './lib/echo';
import { useNotify } from './stores/notify';
import PrimeVue from 'primevue/config';
import { configureEcho } from '@/lib/echo'

// ตั้งค่า Echo/Reverb
configureEcho({ broadcaster: 'reverb' })

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.vue`,
            import.meta.glob<DefineComponent>('./pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(PrimeVue, {
                theme: {
                    preset: Aura,        // 👈 จุดสำคัญ
                    // (ไม่บังคับ) สามารถกำหนด options อื่น ๆ ได้ เช่น darkMode, cssLayer, pt
                    options: {
                        darkModeSelector: '.dark', // 🔥 ตัวนี้สำคัญ
                    },
                },
            })
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on page load...
initializeTheme();
