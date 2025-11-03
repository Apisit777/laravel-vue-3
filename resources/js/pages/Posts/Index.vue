<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import PlaceholderPattern from '@/components/PlaceholderPattern.vue';
import { ref, computed } from 'vue';

// import Vue3Select from 'vue3-select';
import 'vue3-select/dist/vue3-select.css';
import Select from 'primevue/select';

const counter = ref(0)
// const selectedCountry = ref();
// const countries = ref([
const tables = ref([
  { label: 'โต๊ะ A1', value: 'A1' },
  { label: 'โต๊ะ A2', value: 'A2' },
  { label: 'โต๊ะ B1', value: 'B1' },
  { label: 'โต๊ะ B2', value: 'B2' }
    // { name: 'Australia', code: 'AU' },
    // { name: 'Brazil', code: 'BR' },
    // { name: 'China', code: 'CN' },
    // { name: 'Egypt', code: 'EG' },
    // { name: 'France', code: 'FR' },
    // { name: 'Germany', code: 'DE' },
    // { name: 'India', code: 'IN' },
    // { name: 'Japan', code: 'JP' },
    // { name: 'Spain', code: 'ES' },
    // { name: 'United States', code: 'US' }
]);

// const tables = [
//   { value: 'A1', label: 'โต๊ะ A1' },
//   { value: 'A2', label: 'โต๊ะ A2' },
//   { value: 'B1', label: 'โต๊ะ B1' },
//   { value: 'B2', label: 'โต๊ะ B2' }
// ];

const increase = () => {
    counter.value = counter.value + 1
}

const searchText = ref('')

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Posts',
        href: '/posts',
    },
];

const selectedTable = ref('')  // กำหนดค่าเริ่มต้นให้กับ select

const STORAGE_KEY = 'ordersByTable';

const txtOrder = ref('');
const txtCount = ref<number>(1);
const txtTable = ref<string>('')

// ฟังก์ชันที่จะถูกเรียกเมื่อเลือกโต๊ะ
const handleTableChange = (selectedValue: any) => {
  console.log('Selected Table:', selectedValue);  // แสดงค่าโต๊ะที่เลือกใน log
  console.log('Table value:', selectedValue?.value);  // แสดงค่าที่เลือก (เช่น A1)
};

// กำหนดประเภทของข้อมูลใน orders ให้ชัดเจน
interface Order {
  name: string;
  order: string;
  count: number;
  table: string;
  ts: number; // timestamp
}

// ตัวแปรที่จะใช้คำนวณสรุปการสั่งซื้อ
const tableSummary = computed(() => {
  console.log('Current Table Selected:', txtTable.value);  // ตรวจสอบค่าของโต๊ะ
  const orders = loadOrders();
  const list = orders[txtTable.value] || [];
  const sum = list.reduce((acc: number, o: Order) => acc + (Number(o.count) || 0), 0);

  return list.length
    ? `ออเดอร์ที่เก็บไว้ของโต๊ะ ${txtTable.value}: ${list.length} รายการ (รวม ${sum})`
    : `ยังไม่มีออเดอร์ที่เก็บไว้ของโต๊ะ ${txtTable.value}`;
});

// ฟังก์ชันโหลดคำสั่งจาก localStorage
function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

// ฟังก์ชันบันทึกคำสั่งใน localStorage
function saveOrders(orders: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// ฟังก์ชันส่งออเดอร์
async function sendOrdering() {
  const order = txtOrder.value.trim()
  const count = Number(txtCount.value)
  const table = txtTable.value              // ← ได้เป็น string แน่ๆ

  console.log('Current Table Selected:', table);  // ตรวจสอบค่าของ table
  console.log('Sending Payload:', { name: 'bearbug', order, count, table })

  if (!table) {
    alert('กรุณาเลือกโต๊ะ');
    return;
  }
  if (!order) {
    alert('กรุณากรอกชื่อเมนู/ออเดอร์');
    return;
  }
  if (count <= 0) {
    alert('จำนวนต้องมากกว่า 0');
    return;
  }

  const info = {
    name: 'bearbug',
    order,
    count,
    table,
    ts: Date.now() // timestamp ไว้เรียงภายหลัง
  };

  // 1) เก็บลง localStorage แยกตามโต๊ะ
  const orders = loadOrders();
  if (!orders[table]) orders[table] = [];
  orders[table].push(info);
  saveOrders(orders);

  const orderId = `${table}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const payload = { order_id: orderId, name:'bearbug', order, count, table };
  // เก็บลง localStorage ด้วย order_id เดียวกัน แล้วส่งไป API

  // 2) ส่งไปร้าน (ใช้ fetch แทน socket)
  await fetch('/api/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  // 3) เคลียร์อินพุต/อัปเดตสรุป
  txtOrder.value = '';
  txtCount.value = 1;
  tableSummary.value;
  console.log('sent:', payload);
}

// ฟังก์ชันลบคำสั่งของโต๊ะปัจจุบัน
function clearCurrentTableOrders() {
  if (!txtTable.value) return alert('ยังไม่ได้เลือกโต๊ะ');
  if (!confirm(`ล้างรายการออเดอร์ที่เก็บไว้ของโต๊ะ ${txtTable.value}?`)) return;

  const orders = loadOrders();
  orders[txtTable.value] = [];
  saveOrders(orders);
  tableSummary.value;
}

</script>

<template>
    <Head title="Posts" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- <h2>Hello</h2> -->
            <div>
                Counter {{ counter }}
                <button @click="increase" class="text-gray-100 bg-[#303030] hover:bg-[#404040] font-bold py-1.5 px-4 mr-2 rounded">Add counter</button>
            </div>

            <div>
                {{ searchText }}
            </div>
            <div class="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6">
                <div class="md:col-span-3">
                    <!-- <label for="BRAND" class="mt-1 mb- text-sm font-medium text-gray-900 dark:text-white">Brand</label> -->
                    <input v-model="searchText" class="h-8 border-[#303030] dark:border focus:border-blue-500 rounded-sm px-4 w-full bg-gray-50 dark:bg-[#303030] text-center" />
                </div>

                <div class="md:col-span-3" >
                    <!-- <label for="">ค้นหา</label> -->
                    <input v-model="searchText" class="h-8 border-[#303030] dark:border focus:border-blue-500 rounded-sm px-4 w-full bg-gray-50 dark:bg-[#303030] text-center" />
                </div>
                <!-- <div class="md:col-span-6 text-center">
                    <button id="" class="text-gray-100 bg-[#303030] hover:bg-[#404040] font-bold py-1.5 px-2.5 mr-2 rounded group cursor-pointer btn-rotate" type="reset">
                        <svg class="hidden h-5 w-5 md:inline-block rotate"viewBox="0 0 100 100" version="1.1">
                            <path style="fill:#6597BB;stroke:#041E31;stroke-width:3;" d="M 93,62 C 83,82 65,96 48,96 32,96 19,89 15,79 L 5,90 5,53 40,53 29,63 c 0,0 5,14 26,14 16,0 38,-15 38,-15 z"/>
                            <path style="fill:#6597BB;stroke:#041E31;stroke-width:3;" d="M 5,38 C 11,18 32,4 49,4 65,4 78,11 85,21 L 95,10 95,47 57,47 68,37 C 68,37 63,23 42,23 26,23 5,38 5,38 z"/>
                        </svg>
                        Clear
                    </button>
                </div> -->
            </div>

            <div class="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6">
                <div class="md:col-span-3">
                    <label for="txt_table" class="block text-sm mb-1">จังหวัง</label>
                    <Select 
                        v-model="txtTable" 
                        :options="tables" 
                        filter 
                        optionLabel="label"
                        optionValue="value" 
                        placeholder="--- กรุณาเลือก ---" 
                        class="w-full"
                        :pt="{
                            root:    { class: 'select-root rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#303030]' },
                            trigger: { class: 'h-8 px-2' },
                            label:   { class: 'text-sm leading-none px-2' },
                            panel:   { class: 'bg-white dark:bg-[#232323] text-sm' },
                            item:    { class: 'px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-[#2e2e2e]' }
                        }"
                    >
                        
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <div>{{ slotProps.option.label }}</div>
                            </div>
                        </template>
                    </Select>
                </div>
                <div class="md:col-span-3" >
                    <label for="txt_table" class="block text-sm mb-1">อำเภอ</label>
                    <Select 
                        v-model="txtTable" 
                        :options="tables" 
                        filter 
                        optionLabel="label"
                        optionValue="value" 
                        placeholder="--- กรุณาเลือก ---" 
                        class="w-full"
                        :pt="{
                            root:    { class: 'select-root rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#303030]' },
                            trigger: { class: 'h-8 px-2' },
                            label:   { class: 'text-sm leading-none px-2' },
                            panel:   { class: 'bg-white dark:bg-[#232323] text-sm' },
                            item:    { class: 'px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-[#2e2e2e]' }
                        }"
                    >
                        
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <div>{{ slotProps.option.label }}</div>
                            </div>
                        </template>
                    </Select>
                </div>
                <div class="md:col-span-3" >
                    <label for="txt_table" class="block text-sm mb-1">ตำบล</label>
                    <Select 
                        v-model="txtTable" 
                        :options="tables" 
                        filter 
                        optionLabel="label"
                        optionValue="value" 
                        placeholder="--- กรุณาเลือก ---" 
                        class="w-full"
                        :pt="{
                            root:    { class: 'select-root rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#303030]' },
                            trigger: { class: 'h-8 px-2' },
                            label:   { class: 'text-sm leading-none px-2' },
                            panel:   { class: 'bg-white dark:bg-[#232323] text-sm' },
                            item:    { class: 'px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-[#2e2e2e]' }
                        }"
                    >
                        
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <div>{{ slotProps.option.label }}</div>
                            </div>
                        </template>
                    </Select>
                </div>

                <div class="md:col-span-3">
                    <label for="">รหัสไปรษณีย์</label>
                    <input type="text" name="" id="" class="h-9 border-[#303030] dark:border focus:border-blue-500 mt-1 rounded-sm px-4 w-full bg-gray-50 dark:bg-[#303030] text-center" />
                </div>
            </div>

            <div class="justify-center items-center">
                <div class="mt-5 flex justify-items-start">
                    <p class="inline-block space-y-2 border-b border-gray-200 dark:border-gray-700 text-xl font-bold text-gray-900 dark:text-gray-100">Customer Order</p>
                </div>
                <form class="" action="" method="POST" id="update_product_account">
                    <div class='w-12/12 relative'>
                        <div class="p-4">
                            <ul class="relative m-0 w-full list-none overflow-hidden p-0 transition-[height] duration-200 ease-in-out" data-twe-stepper-init="" data-twe-stepper-type="vertical">
                                <li data-twe-stepper-step-ref="" class="relative h-fit after:absolute after:left-[1.20rem] after:top-[2.2rem] after:mt-px after:h-[calc(100%-2.2rem)] after:w-px after:bg-neutral-200 after:content-[''] dark:after:bg-white/10" data-twe-stepper-step-completed="">
                                    <div data-twe-stepper-head-ref="" class="setpcollep  flex cursor-pointer items-center p-1 leading-[1.3rem] no-underline after:bg-neutral-200 after:content-[''] hover:bg-stone-50 dark:after:bg-white/10 dark:hover:bg-white/[.025]" tabindex="0">
                                        <span data-twe-stepper-head-icon-ref="" class="bg_step_color me-3 flex h-[1.938rem] w-[1.938rem] items-center justify-center rounded-full text-sm  !bg-primary-100 !text-primary-700 dark:!bg-slate-900 dark:!text-primary-500">
                                            1
                                        </span>
                                        <span data-twe-stepper-head-text-ref="" class="after:absolute after:flex after:text-[0.8rem] text-black/50 dark:text-white/50 font-medium !text-black/50 dark:!text-white/50">
                                            Order
                                        </span>
                                    </div>
                                    <div data-twe-stepper-content-ref="" class="transition-[height, margin-bottom, padding-top, padding-bottom] left-0 overflow-hidden  ps-[1.75rem] duration-100 ease-in-out text-gray-900 dark:text-white" >
                                        <div class="grid grid-cols-5 gap-10">
                                            <div class="form col-span-5">
                                                <div class="relative w-full overflow-hidden">
                                                    <input type="checkbox" class="setcheckbox peer absolute top-0 inset-x-0 w-full h-12 opacity-0 cursor-pointer">
                                                    <div class="bg-[#d7d8db] dark:bg-[#303030] text-white h-12 w-full pl-5 flex items-center">
                                                        <h1 class="text-gray-900 dark:text-white text-lg">
                                                            Order
                                                        </h1>
                                                    </div>
                                                    <div class="absolute top-3 right-3 text-white transition-tranform duration-500 rotate-180 peer-checked:rotate-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div class="bg-gray-200 dark:bg-[#202020] overflow-hidden transition-all duration-500 max-h-0 peer-checked:max-h-full">
                                                        <div class="lg:col-span-4 xl:grid-cols-4 p-2">
                                                            <div class="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6">
                                                                <div class="md:col-span-3">
                                                                    <label for="txt_order">Order</label>
                                                                    <input type="text" name="txt_order" id="txt_order" v-model="txtOrder" class="h-8 border-[#303030] dark:border focus:border-blue-500 rounded-sm px-4 w-full bg-gray-50 dark:bg-[#303030] text-center" />
                                                                </div>

                                                                <div class="md:col-span-3" >
                                                                    <label for="txt_count">Count</label>
                                                                    <input type="text" name="txt_count" id="txt_count" v-model="txtCount" class="h-8 border-[#303030] dark:border focus:border-blue-500 rounded-sm px-4 w-full bg-gray-50 dark:bg-[#303030] text-center" />
                                                                </div>
                                                                <div class="md:col-span-3" >
                                                                    <label for="txt_table" class="block text-sm mb-1">Table</label>
                                                                    <Select 
                                                                        v-model="txtTable" 
                                                                        :options="tables" 
                                                                        filter 
                                                                        optionLabel="label"
                                                                        optionValue="value" 
                                                                        placeholder="--- กรุณาเลือก ---" 
                                                                        class="w-full"
                                                                        :pt="{
                                                                            root:    { class: 'select-root rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#303030]' },
                                                                            trigger: { class: 'h-8 px-2' },
                                                                            label:   { class: 'text-sm leading-none px-2' },
                                                                            panel:   { class: 'bg-white dark:bg-[#232323] text-sm' },
                                                                            item:    { class: 'px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-[#2e2e2e]' }
                                                                        }"
                                                                        @change="handleTableChange">
                                                                        
                                                                        <template #option="slotProps">
                                                                            <div class="flex items-center">
                                                                                <div>{{ slotProps.option.label }}</div>
                                                                            </div>
                                                                        </template>
                                                                    </Select>

                                                                    <!-- :pt="{
                                                                            root:     { class: 'h-8 text-sm border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#303030]' },
                                                                            trigger:  { class: 'h-8 px-2' },
                                                                            label:    { class: 'text-sm leading-none px-2' },
                                                                            panel:    { class: 'bg-white dark:bg-[#232323] text-sm' },
                                                                            item:     { class: 'px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-[#2e2e2e]' }
                                                                        }" -->
                                                                </div>
                                                            </div>
                                                            <ul class="pt-2.5 mt-5 space-y-2 font-medium border-t-2 border-gray-200 dark:border-gray-700 relative"></ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <ul class="pt-2.5 mt-5 space-y-2 font-medium border-t-2 border-gray-200 dark:border-gray-700 relative"></ul>
                            <div id="loader" class="loading absolute hidden bg-[#e4e4e4e3] dark:bg-[#2e2d2dd5]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 animate-spin dark:text-white">
                                    <path d="M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 0 1-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004a5.252 5.252 0 0 1 6.126 3.537ZM8.12 8.464c.307-.338.838-.235 1.066.16l1.732 3a.75.75 0 0 1 0 .75l-1.732 3c-.229.397-.76.5-1.067.161A5.23 5.23 0 0 1 6.75 12a5.23 5.23 0 0 1 1.37-3.536ZM10.878 17.13c-.447-.098-.623-.608-.394-1.004l1.733-3.002a.75.75 0 0 1 .65-.375h3.465c.457 0 .81.407.672.842a5.252 5.252 0 0 1-6.126 3.539Z" />
                                    <path fill-rule="evenodd" d="M21 12.75a.75.75 0 1 0 0-1.5h-.783a8.22 8.22 0 0 0-.237-1.357l.734-.267a.75.75 0 1 0-.513-1.41l-.735.268a8.24 8.24 0 0 0-.689-1.192l.6-.503a.75.75 0 1 0-.964-1.149l-.6.504a8.3 8.3 0 0 0-1.054-.885l.391-.678a.75.75 0 1 0-1.299-.75l-.39.676a8.188 8.188 0 0 0-1.295-.47l.136-.77a.75.75 0 0 0-1.477-.26l-.136.77a8.36 8.36 0 0 0-1.377 0l-.136-.77a.75.75 0 1 0-1.477.26l.136.77c-.448.121-.88.28-1.294.47l-.39-.676a.75.75 0 0 0-1.3.75l.392.678a8.29 8.29 0 0 0-1.054.885l-.6-.504a.75.75 0 1 0-.965 1.149l.6.503a8.243 8.243 0 0 0-.689 1.192L3.8 8.216a.75.75 0 1 0-.513 1.41l.735.267a8.222 8.222 0 0 0-.238 1.356h-.783a.75.75 0 0 0 0 1.5h.783c.042.464.122.917.238 1.356l-.735.268a.75.75 0 0 0 .513 1.41l.735-.268c.197.417.428.816.69 1.191l-.6.504a.75.75 0 0 0 .963 1.15l.601-.505c.326.323.679.62 1.054.885l-.392.68a.75.75 0 0 0 1.3.75l.39-.679c.414.192.847.35 1.294.471l-.136.77a.75.75 0 0 0 1.477.261l.137-.772a8.332 8.332 0 0 0 1.376 0l.136.772a.75.75 0 1 0 1.477-.26l-.136-.771a8.19 8.19 0 0 0 1.294-.47l.391.677a.75.75 0 0 0 1.3-.75l-.393-.679a8.29 8.29 0 0 0 1.054-.885l.601.504a.75.75 0 0 0 .964-1.15l-.6-.503c.261-.375.492-.774.69-1.191l.735.267a.75.75 0 1 0 .512-1.41l-.734-.267c.115-.439.195-.892.237-1.356h.784Zm-2.657-3.06a6.744 6.744 0 0 0-1.19-2.053 6.784 6.784 0 0 0-1.82-1.51A6.705 6.705 0 0 0 12 5.25a6.8 6.8 0 0 0-1.225.11 6.7 6.7 0 0 0-2.15.793 6.784 6.784 0 0 0-2.952 3.489.76.76 0 0 1-.036.098A6.74 6.74 0 0 0 5.251 12a6.74 6.74 0 0 0 3.366 5.842l.009.005a6.704 6.704 0 0 0 2.18.798l.022.003a6.792 6.792 0 0 0 2.368-.004 6.704 6.704 0 0 0 2.205-.811 6.785 6.785 0 0 0 1.762-1.484l.009-.01.009-.01a6.743 6.743 0 0 0 1.18-2.066c.253-.707.39-1.469.39-2.263a6.74 6.74 0 0 0-.408-2.309Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="md:col-span-3  mt-4">
                                <div class="items-start">
                                    <button type="button" @click.prevent="sendOrdering" class="text-gray-100 bg-[#303030] hover:bg-[#404040] font-bold py-1 px-2 mr-2 cursor-pointer rounded group">
                                        <svg fill="currentColor" class="size-5 hidden h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 md:inline-block" 
                                            version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                                            viewBox="0 0 495.003 495.003" xml:space="preserve">
                                            <g id="XMLID_51_">
                                                <path id="XMLID_53_" d="M164.711,456.687c0,2.966,1.647,5.686,4.266,7.072c2.617,1.385,5.799,1.207,8.245-0.468l55.09-37.616
                                                    l-67.6-32.22V456.687z"/>
                                                <path id="XMLID_52_" d="M492.431,32.443c-1.513-1.395-3.466-2.125-5.44-2.125c-1.19,0-2.377,0.264-3.5,0.816L7.905,264.422
                                                    c-4.861,2.389-7.937,7.353-7.904,12.783c0.033,5.423,3.161,10.353,8.057,12.689l125.342,59.724l250.62-205.99L164.455,364.414
                                                    l156.145,74.4c1.918,0.919,4.012,1.376,6.084,1.376c1.768,0,3.519-0.322,5.186-0.977c3.637-1.438,6.527-4.318,7.97-7.956
                                                    L494.436,41.257C495.66,38.188,494.862,34.679,492.431,32.443z"/>
                                            </g>
                                        </svg>
                                        Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>

    /* ทำงานเฉพาะโหมดมืด */
    .dark [data-pc-name="select"][data-pc-section="root"] {
        /* background-color: #10B981; */
    background-color: #303030;
    color: #e5e7eb;          /* text-gray-200/100 */
    border-color: #374151;   /* border-gray-700 */
    }
    .dark [data-pc-name="select"][data-pc-section="panel"] {
    background-color: #232323;
    border-color: #374151;
    }
    .dark [data-pc-name="select"][data-pc-section="item"] {
    color: #e5e7eb;
    }
    .dark [data-pc-name="select"][data-pc-section="item"]:hover {
    background-color: #2a2a2a;
    }
    .dark [data-pc-name="select"][data-pc-section="filterInput"] {
    background-color: #1f1f1f;
    color: #e5e7eb;
    border-color: #374151;
    }

</style>
