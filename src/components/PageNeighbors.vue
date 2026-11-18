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
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <router-link
        v-if="neighbors.prev"
        :to="neighbors.prev.path"
        class="glass-card group p-4 hover:border-brand-500/30 transition-colors"
        rel="prev"
      >
        <span class="block text-xs text-surface-500 mb-1">← 上一页</span>
        <span class="block text-sm font-medium text-surface-200 group-hover:text-brand-400">
          {{ neighbors.prev.label }}
        </span>
      </router-link>
      <span v-else aria-hidden="true"></span>
      <router-link
        v-if="neighbors.next"
        :to="neighbors.next.path"
        class="glass-card group p-4 text-right hover:border-brand-500/30 transition-colors sm:col-start-2"
        rel="next"
      >
        <span class="block text-xs text-surface-500 mb-1">下一页 →</span>
        <span class="block text-sm font-medium text-surface-200 group-hover:text-brand-400">
          {{ neighbors.next.label }}
        </span>
      </router-link>
    </div>
  </nav>
</template>
