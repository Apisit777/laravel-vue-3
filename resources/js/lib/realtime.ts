// resources/js/lib/realtime.ts
import { ref, type Ref } from 'vue';
import { echo } from '@/lib/echo';
import { useNotify } from '@/stores/notify';

export type TableCode = string;
export interface OrderPayload {
  order_id: string;
  name: string;
  order: string;
  count: number;
  table: TableCode;
  ts?: number;
}

// ---------- Singletons ----------
const g = globalThis as any;

// g.__ORDERS__ ??= ref<OrderPayload[]>([]);
// export const orders = g.__ORDERS__ as ReturnType<typeof ref<OrderPayload[]>>;

g.__ORDERS__ ??= ref<OrderPayload[]>([])
export const orders = g.__ORDERS__ as Ref<OrderPayload[]>

g.__RT_STATE__ ??= { bound:false, hydrated:false, seen:new Set<string>() };
const state = g.__RT_STATE__ as { bound:boolean; hydrated:boolean; seen:Set<string> };

// ---------- HYDRATE (จาก localStorage; ถ้ามี API เปลี่ยนฟังก์ชันนี้) ----------
export async function hydrateFromLocalStorage() {
  if (state.hydrated) return
  const notify = useNotify()

  const raw = localStorage.getItem('ordersByTable') || '{}'
  const data = JSON.parse(raw) as Record<string, Array<{order_id?:string; name:string; order:string; count:number; table:string; ts?:number}>>

  const nextOrders: OrderPayload[] = []
  const nextCounts: Record<string, number> = {}

  state.seen.clear()

  Object.entries(data).forEach(([table, list]) => {
    nextCounts[table] = nextCounts[table] ?? 0
    list.forEach(item => {
      const id = item.order_id ?? `${table}-${item.ts ?? Date.now()}-${Math.random().toString(36).slice(2,8)}`
      if (state.seen.has(id)) return
      state.seen.add(id)

      nextOrders.push({
        order_id: id,
        name: item.name,
        order: item.order,
        count: Number(item.count),
        table: String(table),
        ts: item.ts ?? Date.now(),
      })
      nextCounts[table]++
    })
  })

  nextOrders.sort((a,b)=>(b.ts ?? 0)-(a.ts ?? 0))

  // ✅ สลับสถานะ “ทีเดียว”
  orders.value = nextOrders
  notify.replace(nextCounts)   // ดูข้อข้างล่าง
  state.hydrated = true
}

// ---------- BIND REALTIME (กัน bind ซ้ำ + กันเบิ้ลด้วย seenIds) ----------
export function bindRealtime() {
  if (state.bound) return;
  state.bound = true;

  const notify = useNotify();

  echo.channel('shop')
    .listen('.OrderPlaced', (e:any) => {
      const id = String(e.order_id ?? `${e.table}-${Date.now()}`);
      if (state.seen.has(id)) return;        // ✅ กัน push ซ้ำ
      state.seen.add(id);

      const o: OrderPayload = {
        order_id: id,
        name: String(e.name),
        order: String(e.order),
        count: Number(e.count),
        table: String(e.table),
        ts: Date.now(),
      };
      orders.value!.unshift(o);
      notify.inc(o.table, 1);
    })
    .listen('.OrderAccepted', (e:any) => {
      const id = String(e.order_id);
      const t  = String(e.table);
      const idx = orders.value!.findIndex(x => x.order_id === id);
      if (idx !== -1) orders.value!.splice(idx,1);
      if (state.seen.has(id)) state.seen.delete(id);
      notify.dec(t, 1);
    });
}

// ---------- public API ----------
export async function ensureRealtimeReady() {
  await hydrateFromLocalStorage();
  bindRealtime();
}

// export { orders };
// export type { OrderPayload };

// โหลดรายการ order จาก localStorage
// export function restoreOrders() {
//   const ORDERS_KEY = 'ordersByTable'
//   const raw = localStorage.getItem(ORDERS_KEY)
//   if (!raw) return

//   const map = JSON.parse(raw) as Record<string, any[]>

// // ให้แน่ใจว่า orders.value เป็น array
// const arr = (orders.value ||= []);
// arr.length = 0;

//   Object.entries(map).forEach(([table, list]) => {
//     list.forEach(item => {
//       arr.push({
//         order_id: item.order_id ?? `${table}-${item.ts}`,
//         name: item.name,
//         order: item.order,
//         count: Number(item.count),
//         table: String(table),
//         ts: item.ts ?? Date.now()
//       })
//     })
//   })
// }