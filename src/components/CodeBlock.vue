<script setup lang="ts">
import { useClipboard } from "../composables/useClipboard";

const props = defineProps<{
  code: string;
  language?: string;
  filename?: string;
}>();

const { status, message, copy } = useClipboard();
</script>

<template>
  <div
    class="relative group rounded-xl overflow-hidden border border-surface-700/50 bg-surface-900"
  >
    <!-- Header -->
    <div
      v-if="filename || language"
      class="flex items-center justify-between gap-2 px-4 py-2 border-b border-surface-700/50 bg-surface-800/50"
    >
      <span class="text-sm text-surface-400 font-mono truncate">{{ filename || language }}</span>
      <span class="relative flex items-center shrink-0">
        <button
          type="button"
          class="min-w-6 min-h-6 p-1.5 rounded-md transition-colors"
          :class="
            status === 'failed'
              ? 'text-red-400 hover:bg-red-400/10'
              : 'text-surface-400 hover:text-brand-400 hover:bg-brand-400/10'
          "
          :aria-label="`复制${filename || language || ''}代码`"
          @click="copy(props.code)"
        >
          <svg
            v-if="status === 'idle'"
            class="w-4 h-4"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <svg
            v-else-if="status === 'copied'"
            class="w-4 h-4 text-green-400"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg
            v-else
            class="w-4 h-4"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <!-- 可见反馈同时是 live region；置于按钮之外才能被可靠朗读 -->
        <span
          role="status"
          class="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-1 whitespace-nowrap text-xs transition-opacity duration-150"
          :class="[
            status === 'failed' ? 'text-red-400' : 'text-green-400',
            message ? 'opacity-100' : 'opacity-0',
          ]"
          >{{ message }}</span
        >
      </span>
    </div>
    <!-- Code：tabindex 让键盘用户可以横向滚动长代码行 -->
    <pre
      class="p-4 overflow-x-auto text-sm"
      tabindex="0"
    ><code class="font-mono text-surface-200">{{ code }}</code></pre>
  </div>
</template>
