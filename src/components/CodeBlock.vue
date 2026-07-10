<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  code: string
  language?: string
  filename?: string
}>()

const copied = ref(false)

async function copyCode() {
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="relative group rounded-xl overflow-hidden border border-surface-700/50 bg-surface-900">
    <!-- Header -->
    <div v-if="filename || language" class="flex items-center justify-between px-4 py-2 border-b border-surface-700/50 bg-surface-800/50">
      <span v-if="filename" class="text-sm text-surface-400 font-mono">{{ filename }}</span>
      <span v-else class="text-sm text-surface-400 font-mono">{{ language }}</span>
      <button
        class="p-1.5 text-surface-400 hover:text-brand-400 hover:bg-brand-400/10 rounded-md transition-colors"
        @click="copyCode"
        title="复制"
      >
        <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <svg v-else class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </button>
    </div>
    <!-- Code -->
    <pre class="p-4 overflow-x-auto text-sm"><code class="font-mono text-surface-200">{{ code }}</code></pre>
  </div>
</template>
