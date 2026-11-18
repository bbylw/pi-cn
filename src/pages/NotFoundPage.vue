<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { searchIndex } from "../data/docs";

const route = useRoute();

// 根据路径片段猜测用户想去的页面
const suggestions = computed(() => {
  const slug = route.path.replace(/^\//, "").toLowerCase();
  if (!slug) return [];
  return searchIndex
    .filter(
      (entry) =>
        entry.path.slice(1).includes(slug) ||
        slug.includes(entry.path.slice(1)) ||
        entry.keywords.toLowerCase().includes(slug),
    )
    .slice(0, 3);
});
</script>

<template>
  <div class="py-24 sm:py-32">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p class="font-mono text-brand-400 text-sm mb-4">404 · command not found</p>
      <h1 class="text-4xl sm:text-5xl font-display font-bold text-surface-50 mb-4">
        这个页面不存在
      </h1>
      <p class="text-surface-400 mb-8">
        <code class="font-mono text-surface-300">{{ route.path }}</code>
        没有对应的文档。它可能已被移动，或从未被翻译。
      </p>

      <div v-if="suggestions.length" class="mb-8">
        <p class="text-sm text-surface-500 mb-3">你想找的是不是：</p>
        <ul class="space-y-2">
          <li v-for="entry in suggestions" :key="entry.path">
            <router-link
              :to="entry.path"
              class="inline-block glass-card px-5 py-2.5 text-sm text-surface-200 hover:text-brand-400 hover:border-brand-500/30 transition-colors"
            >
              {{ entry.label }}
              <span class="text-surface-500 ml-2">{{ entry.desc }}</span>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <router-link to="/docs" class="btn-primary">浏览文档中心</router-link>
        <router-link to="/" class="btn-secondary">回到首页</router-link>
      </div>
      <p class="text-surface-500 text-sm mt-8">
        也可以在任意页面按 <kbd class="font-mono">Ctrl K</kbd> 搜索文档。
      </p>
    </div>
  </div>
</template>
