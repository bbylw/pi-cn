<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import CodeBlock from "../components/CodeBlock.vue";
import { docGroups, docOrder } from "../data/docs";
import type { DocEntry } from "../data/docs";

// 与 docGroups 一一对应的分组图标（lucide 风格线性图标）
const groupIcons: string[][] = [
  // 入门 · rocket
  [
    "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",
    "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
    "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0",
    "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
  ],
  // 运行 Pi · terminal
  ["m4 17 6-6-6-6", "M12 19h8"],
  // 自定义 Pi · sliders
  [
    "M21 4h-7",
    "M10 4H3",
    "M21 12h-9",
    "M8 12H3",
    "M21 20h-5",
    "M12 20H3",
    "M14 2v4",
    "M8 10v4",
    "M16 18v4",
  ],
  // 在 Pi 上构建 · code
  ["m16 18 6-6-6-6", "m8 6-6 6 6 6"],
  // 参考 · book-open
  [
    "M12 7v14",
    "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
  ],
];

const query = ref("");
const filterRef = ref<HTMLInputElement | null>(null);

const terms = computed(() => query.value.trim().toLowerCase().split(/\s+/).filter(Boolean));

function matches(entry: DocEntry): boolean {
  if (!terms.value.length) return true;
  const haystack = `${entry.label} ${entry.desc} ${entry.keywords} ${entry.path}`.toLowerCase();
  return terms.value.every((term) => haystack.includes(term));
}

const filteredGroups = computed(() =>
  docGroups
    .map((group, index) => ({
      title: group.title,
      icon: groupIcons[index],
      items: group.items.filter(matches),
      total: group.items.length,
    }))
    .filter((group) => group.items.length > 0),
);

const matchCount = computed(() =>
  filteredGroups.value.reduce((sum, group) => sum + group.items.length, 0),
);

interface Segment {
  t: string;
  hit: boolean;
}

function segments(text: string): Segment[] {
  if (!terms.value.length) return [{ t: text, hit: false }];
  const lower = text.toLowerCase();
  const marks = Array.from({ length: text.length }, () => false);
  for (const term of terms.value) {
    let i = lower.indexOf(term);
    while (i !== -1) {
      for (let j = i; j < i + term.length; j++) marks[j] = true;
      i = lower.indexOf(term, i + term.length);
    }
  }
  const out: Segment[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = out[out.length - 1];
    if (last && last.hit === marks[i]) last.t += text[i];
    else out.push({ t: text[i], hit: marks[i] });
  }
  return out;
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (
    event.key === "/" &&
    !event.ctrlKey &&
    !event.metaKey &&
    target.tagName !== "INPUT" &&
    target.tagName !== "TEXTAREA" &&
    !target.isContentEditable
  ) {
    event.preventDefault();
    filterRef.value?.focus();
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

const quickLinks = [
  { label: "快速开始", path: "/quickstart" },
  { label: "选择模型", path: "/models" },
  { label: "MCP 服务器", path: "/mcp" },
  { label: "命令行", path: "/cli" },
  { label: "设置参考", path: "/settings" },
  { label: "安全", path: "/security" },
];

const externalDocs = [
  { label: "GitHub 源码", url: "https://github.com/earendil-works/pi" },
  { label: "npm 包", url: "https://www.npmjs.com/package/@earendil-works/pi-coding-agent" },
  { label: "模型目录", url: "https://pi.dev/models" },
  { label: "包画廊", url: "https://pi.dev/packages" },
  { label: "Discord 社区", url: "https://discord.com/invite/3cU7Bz4UPx" },
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">文档中心</h1>
        <p class="text-lg text-surface-400 max-w-2xl">
          从安装到扩展 Pi 的完整指南，共 {{ docOrder.length }} 篇，内容跟随上游
          <a
            href="https://github.com/earendil-works/pi"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 hover:text-brand-300"
            >earendil-works/pi</a
          >
          的最新文档更新。
        </p>
      </div>

      <!-- Live filter -->
      <div class="mb-8">
        <div class="relative max-w-xl">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="docs-filter-input"
            ref="filterRef"
            v-model="query"
            type="search"
            placeholder="筛选文档：标题、简介或关键词…"
            aria-label="筛选文档"
            class="w-full pl-10 pr-16 py-2.5 rounded-xl bg-surface-900/70 border border-surface-700/60 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500/50 focus:outline-none transition-colors"
          />
          <button
            v-if="query"
            type="button"
            aria-label="清空筛选"
            class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-colors"
            @click="query = ''"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              class="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          <kbd
            v-else
            class="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-surface-700 bg-surface-800/80 text-surface-500 text-xs font-mono pointer-events-none"
            aria-hidden="true"
            >/</kbd
          >
        </div>
        <p v-if="terms.length" class="mt-2 text-xs text-surface-500" role="status">
          匹配 {{ matchCount }} 篇文档
        </p>
      </div>

      <!-- Quick Links -->
      <div v-if="!terms.length" class="mb-10 flex flex-wrap items-center gap-3">
        <span class="text-xs text-surface-500">常用入口</span>
        <router-link
          v-for="link in quickLinks"
          :key="link.label"
          :to="link.path"
          class="px-4 py-2 rounded-lg bg-surface-800/50 border border-surface-700/50 text-surface-300 hover:text-brand-400 hover:border-brand-500/30 text-sm transition-all"
        >
          {{ link.label }}
        </router-link>
      </div>

      <!-- Doc Sections -->
      <div
        v-if="filteredGroups.length"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
      >
        <section
          v-for="group in filteredGroups"
          :key="group.title"
          class="glass-card p-6 flex flex-col"
        >
          <div class="flex items-center gap-3 mb-4">
            <span
              class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-4.5 h-4.5"
                aria-hidden="true"
              >
                <path v-for="(d, i) in group.icon" :key="i" :d="d" />
              </svg>
            </span>
            <h2 class="text-lg font-display font-semibold text-surface-50 flex-1">
              {{ group.title }}
            </h2>
            <span
              class="text-xs text-surface-500 font-mono px-2 py-0.5 rounded-full bg-surface-800/70 border border-surface-700/50"
            >
              {{ group.items.length }}<template v-if="terms.length">/{{ group.total }}</template>
            </span>
          </div>
          <ul class="space-y-1 -mx-2">
            <li v-for="link in group.items" :key="link.path">
              <router-link
                :to="link.path"
                class="group flex items-start gap-2 py-2 px-2 rounded-lg hover:bg-surface-800/50 transition-colors"
              >
                <span class="min-w-0 flex-1">
                  <span
                    class="block text-surface-200 group-hover:text-brand-400 text-sm font-medium transition-colors"
                  >
                    <template v-for="(seg, i) in segments(link.label)" :key="i">
                      <mark v-if="seg.hit">{{ seg.t }}</mark>
                      <template v-else>{{ seg.t }}</template>
                    </template>
                  </span>
                  <span class="block text-surface-500 text-xs mt-0.5 leading-relaxed">
                    <template v-for="(seg, i) in segments(link.desc)" :key="i">
                      <mark v-if="seg.hit">{{ seg.t }}</mark>
                      <template v-else>{{ seg.t }}</template>
                    </template>
                  </span>
                </span>
                <span
                  class="text-surface-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0"
                  aria-hidden="true"
                  >→</span
                >
              </router-link>
            </li>
          </ul>
        </section>
      </div>

      <!-- Empty state -->
      <div v-else class="glass-card p-10 mb-12 text-center">
        <p class="text-surface-300 mb-2">没有匹配「{{ query.trim() }}」的文档</p>
        <p class="text-surface-500 text-sm mb-5">
          试试更短的关键词，或按
          <kbd
            class="px-1.5 py-0.5 rounded border border-surface-700 bg-surface-800/80 font-mono text-xs"
            >Ctrl</kbd
          >
          +
          <kbd
            class="px-1.5 py-0.5 rounded border border-surface-700 bg-surface-800/80 font-mono text-xs"
            >K</kbd
          >
          使用全站搜索。
        </p>
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-surface-800 border border-surface-600 text-surface-200 hover:bg-surface-700 text-sm transition-colors"
          @click="query = ''"
        >
          清空筛选
        </button>
      </div>

      <!-- Start -->
      <section class="glass-card p-8 mb-12">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">第一次使用？</h2>
        <p class="text-surface-300 text-sm mb-4">
          Pi 在终端中运行并处理你机器上的文件。你需要一个受支持提供商提供的模型访问权限：订阅、API
          Key 或本地模型都可以。
        </p>
        <CodeBlock
          code="npm install -g --ignore-scripts @earendil-works/pi-coding-agent"
          language="bash"
        />
        <p class="text-surface-400 text-sm mt-3">
          macOS、Linux 和 Windows 也可以使用
          <code class="text-brand-400">https://pi.dev/install.sh</code> 安装脚本，
          或通过 Nix 安装。详见
          <router-link to="/quickstart" class="text-brand-400 hover:text-brand-300"
            >快速开始</router-link
          >。
        </p>
      </section>

      <!-- External Links -->
      <section class="glass-card p-8 glow-border">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-4">外部链接</h2>
        <div class="flex flex-wrap gap-4">
          <a
            v-for="link in externalDocs"
            :key="link.label"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="px-4 py-2 rounded-lg bg-surface-800/50 border border-surface-700/50 text-surface-300 hover:text-brand-400 hover:border-brand-500/30 text-sm transition-all"
          >
            {{ link.label }}
          </a>
        </div>
      </section>
    </div>
  </div>
</template>
