<script setup lang="ts">
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { urlIsActive } from '@/lib/utils'
import { type NavItem } from '@/types'
import { Link, usePage } from '@inertiajs/vue3'

import { computed } from 'vue'
import { useNotify } from '@/stores/notify'

const notify = useNotify()

// ✅ แตกออกมาเป็น computed ธรรมดา แล้วใช้ใน template
const total = computed(() => notify.total.value)
const badgeLabel = computed(() => notify.label.value)

defineProps<{ items: NavItem[] }>()
const page = usePage()

// debug (เฉพาะใน script ต้อง .value)
console.log('[NavMain] total =', total.value)
console.log('[NavMain] label =', badgeLabel.value)
</script>

<template>
  <SidebarGroup class="px-2 py-0">
    <SidebarGroupLabel>Platform</SidebarGroupLabel>

    <SidebarMenu>
      <SidebarMenuItem v-for="item in items" :key="item.title">
        <SidebarMenuButton
          as-child
          :is-active="urlIsActive(item.href, page.url)"
          :tooltip="item.title"
        >
          <Link :href="item.href" class="relative flex items-center gap-2">
            <component :is="item.icon" />
            <span class="truncate">{{ item.title }}</span>

            <!-- 🔔 โชว์เฉพาะเมนู /response -->
            <span
              v-if="item.href === '/response' && total > 0"
              class="ml-auto inline-flex items-center justify-center
                     rounded-full bg-red-600 text-white text-xs
                     w-5 h-5 px-1 leading-none text-center"
              aria-label="จำนวนการแจ้งเตือน"
            >
              {{ badgeLabel }}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>