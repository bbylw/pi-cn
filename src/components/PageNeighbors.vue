<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { getDocNeighbors } from "../data/docs";

const route = useRoute();
const neighbors = computed(() => getDocNeighbors(route.path));
</script>

<template>
  <nav
    v-if="neighbors.prev || neighbors.next"
    class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
    aria-label="上一页 / 下一页"
  >
    <div class="grid grid-cols-2 gap-3 sm:gap-4">
      <router-link
        v-if="neighbors.prev"
        :to="neighbors.prev.path"
        class="glass-card group p-3 sm:p-4 min-w-0 hover:border-brand-500/30 active:border-brand-500/40 transition-colors"
        rel="prev"
      >
        <span class="block text-xs text-surface-500 mb-1">← 上一页</span>
        <span
          class="block text-sm font-medium text-surface-200 group-hover:text-brand-400 truncate"
        >
          {{ neighbors.prev.label }}
        </span>
      </router-link>
      <span v-else aria-hidden="true"></span>
      <router-link
        v-if="neighbors.next"
        :to="neighbors.next.path"
        class="glass-card group p-3 sm:p-4 min-w-0 text-right col-start-2 hover:border-brand-500/30 active:border-brand-500/40 transition-colors"
        rel="next"
      >
        <span class="block text-xs text-surface-500 mb-1">下一页 →</span>
        <span
          class="block text-sm font-medium text-surface-200 group-hover:text-brand-400 truncate"
        >
          {{ neighbors.next.label }}
        </span>
      </router-link>
    </div>
  </nav>
</template>
