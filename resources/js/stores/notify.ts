// ✅ วาง ref ข้างนอกฟังก์ชัน -> ทุกที่แชร์ตัวเดียวกัน
import { ref, computed } from 'vue'

const NOTIFY_KEY = 'notify.byTable'

const byTable = ref<Record<string, number>>({})

const total = computed(() =>
  Object.values(byTable.value).reduce((a, b) => a + b, 0)
)
const label = computed(() => (total.value > 99 ? '99+' : String(total.value)))

function persist() {
  localStorage.setItem(NOTIFY_KEY, JSON.stringify(byTable.value))
}
function restore() {
  try {
    const raw = localStorage.getItem(NOTIFY_KEY)
    if (raw) byTable.value = JSON.parse(raw) || {}
  } catch {}
}

function inc(table: string, n = 1) {
  byTable.value[table] = (byTable.value[table] ?? 0) + n
  persist()
}
function dec(table: string, n = 1) {
  byTable.value[table] = Math.max(0, (byTable.value[table] ?? 0) - n)
  if (byTable.value[table] === 0) delete byTable.value[table]
  persist()
}
function reset() {
  byTable.value = {}
  persist()
}
function replace(map: Record<string, number>) {
  byTable.value = { ...map }
  persist()
}

export function useNotify() {
  return { total, label, byTable, inc, dec, reset, replace, restore }
}