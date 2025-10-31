import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// ---- เพิ่มบรรทัดประกาศ global type ----
declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}
// -----------------------------------------

window.Pusher = Pusher as any;

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY as string,
  wsHost: import.meta.env.VITE_REVERB_HOST as string,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 80),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
});

// <<< ✅ เพิ่มอันนี้เข้าไป >>>
export function configureEcho(_opts?: any) {
  // noop — เราไม่สร้างใหม่ เพราะสร้างแล้วข้างบน
  return echo;
}

// optional เผื่อเรียกใน Composition API
export function useEcho() {
  return echo;
}