<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import PlaceholderPattern from '@/components/PlaceholderPattern.vue';
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { echo } from '@/lib/echo';
// ✅ ใช้ state + type จาก realtime เดียวกันทั้งแอป
import { orders } from '@/lib/realtime'
import type { OrderPayload } from '@/lib/realtime'

const breadcrumbs: BreadcrumbItem[] = [
    { 
        title: 'Response', 
        href: '/response' 
    },
]

// แสดงโต๊ะ 4 ตัว
const tables = ['A1', 'A2', 'B1', 'B2']
let channelSub: any = null;

// รวมออเดอร์ตามโต๊ะไว้ล่วงหน้า (เรนเดอร์เร็วกว่า filter ใน template)
const ordersByTable = computed<Record<string, OrderPayload[]>>(() => {
  const m: Record<string, OrderPayload[]> = {};
  for (const o of orders.value) {
    const k = String(o.table);
    (m[k] ||= []).push(o);
  }
  return m;
});

// onMounted(() => {
// //   channelSub = echo.channel('shop').listen('.OrderPlaced', (e: OrderPayload) => {
//     channelSub = echo.channel('shop').listen('.OrderPlaced', (e: any) => {
//     // normalize ให้ count เป็น number ด้วย เผื่อฝั่ง PHP ส่งมาเป็น string
//     orders.value.unshift({
//       name: String(e.name),
//       order: String(e.order),
//       count: Number(e.count),
//       table: String(e.table),
//       ts: Date.now(),
//     } as OrderPayload);
//   });
// });
// onBeforeUnmount(() => {
//   if (channelSub?.stopListening) channelSub.stopListening('.OrderPlaced');
// });

// ลบทีละรายการ
const serveOrder = (order: OrderPayload) => {
  orders.value = orders.value.filter(o => o !== order);
};

// ล้างโต๊ะ
const clearTableOrders = (table: string) => {
  orders.value = orders.value.filter(o => String(o.table) !== table);
};

async function accept(o: OrderPayload) {
  // optimistic update ก็ได้ แต่เดี๋ยวมี broadcast กลับมาลดให้อยู่ดี
  await fetch('/api/order/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ order_id: o.order_id, table: o.table }),
  });
  // ไม่ต้องทำอะไรต่อ รอ .OrderAccepted broadcast → ทุกหน้าจะ dec badge และลบรายการให้อัตโนมัติ
}
</script>

<template>
    <Head title="Response" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <h2>Hello Response</h2>

            <div class="p-2 rounded-sm dark:border-gray-700 mt-4">
                <div class="mt-6 mb-4 flex justify-center items-center">
                    <p class="inline-block space-y-2 border-b border-gray-200 dark:border-gray-700 text-xl font-bold text-gray-900 dark:text-gray-100">List Menu</p>
                </div>
                <div class="p-4">
                    <h2 class="text-xl font-bold">Shop</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <!-- วนลูปแสดงการ์ดโต๊ะทั้งหมด -->
                        <div
                            v-for="t in tables"
                            :key="t"
                            class="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#303030] p-4"
                        >
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    โต๊ะ {{ t }}
                                </h3>

                                <!-- badge จำนวนออเดอร์ของโต๊ะ -->
                                <span
                                    v-if="ordersByTable[t]?.length"
                                    class="inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-red-600 text-white text-xs px-1"
                                    aria-label="จำนวนออเดอร์"
                                >
                                {{ ordersByTable[t].length > 99 ? '99+' : ordersByTable[t].length }}
                                </span>
                            </div>

                            <!-- รายการออเดอร์ -->
                            <ul :id="`orders-table-${t}`" class="space-y-2 mt-3">
                                <li v-for="(o, idx) in ordersByTable[t]" :key="o.order_id" class="...">
                                    <p class="...">[Order #{{ idx+1 }}] {{ o.order }} × {{ o.count }}</p>

                                    <div class="flex gap-2">
                                        <button class="px-2 py-1 rounded bg-blue-600 text-white"
                                        @click="accept(o)">รับ Order</button>
                                    </div>
                                </li>

                                <!-- สถานะว่าง -->
                                <li v-if="!(ordersByTable[t]?.length)" class="text-sm text-gray-500 dark:text-gray-400">
                                    ยังไม่มีออเดอร์ของโต๊ะนี้
                                </li>
                            </ul>

                            <!-- ปุ่มล้างโต๊ะ -->
                            <button
                                class="mt-3 text-xs bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1"
                                @click="clearTableOrders(t)"
                            >
                                ล้าง
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>