<script setup lang="ts">
import AppLayout from '@/layouts/app/AppSidebarLayout.vue';
import type { BreadcrumbItemType } from '@/types';

import { onMounted } from 'vue';
import { ensureRealtimeReady } from '@/lib/realtime';

onMounted(() => {
  ensureRealtimeReady();   // ✅ ไม่ว่าเปลี่ยนหน้าไหน state จะไม่หาย/ไม่บวกซ้ำ
});

interface Props {
    breadcrumbs?: BreadcrumbItemType[];
}

withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
});
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <slot />
    </AppLayout>
</template>
