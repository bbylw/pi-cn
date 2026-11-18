<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import { docGroups, searchIndex, type DocEntry } from "../data/docs";

const router = useRouter();

const dialogRef = ref<HTMLDialogElement>();
const inputRef = ref<HTMLInputElement>();
const query = ref("");
const activeIndex = ref(0);
const listRef = ref<HTMLUListElement>();

const groupOf = new Map<string, string>();
for (const group of docGroups) {
  for (const item of group.items) groupOf.set(item.path, group.title);
}
groupOf.set("/docs", "总览");

const popularPaths = ["/quickstart", "/models", "/mcp", "/cli", "/settings", "/security"];
const popularEntries = popularPaths
  .map((path) => searchIndex.find((entry) => entry.path === path))
  .filter((entry): entry is DocEntry => Boolean(entry));

const results = computed<DocEntry[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return popularEntries;
  const terms = q.split(/\s+/);
  const scored: { entry: DocEntry; score: number }[] = [];
  for (const entry of searchIndex) {
    const label = entry.label.toLowerCase();
    const keywords = entry.keywords.toLowerCase();
    const desc = entry.desc.toLowerCase();
    const path = entry.path.toLowerCase();
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      if (label.includes(term)) score += 8;
      else if (keywords.includes(term)) score += 4;
      else if (desc.includes(term)) score += 2;
      else if (path.includes(term)) score += 1;
      else {
        matchedAll = false;
        break;
      }
    }
    if (matchedAll) scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 12).map((item) => item.entry);
});

/** 把文本按查询词切分为高亮片段，避免使用 v-html。 */
function segments(text: string): { text: string; hit: boolean }[] {
  const q = query.value.trim().toLowerCase();
  if (!q) return [{ text, hit: false }];
  const terms = q.split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();
  const hits: boolean[] = Array.from({ length: text.length }, () => false);
  for (const term of terms) {
    let from = 0;
    let index = lower.indexOf(term, from);
    while (index !== -1) {
      hits.fill(true, index, index + term.length);
      from = index + term.length;
      index = lower.indexOf(term, from);
    }
  }
  const parts: { text: string; hit: boolean }[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || hits[i] !== hits[start]) {
      parts.push({ text: text.slice(start, i), hit: hits[start] });
      start = i;
    }
  }
  return parts;
}

function open() {
  const dialog = dialogRef.value;
  if (!dialog || dialog.open) return;
  query.value = "";
  activeIndex.value = 0;
  dialog.showModal();
  // 部分浏览器 closedby 尚未支持：用指针位置补上点击外部关闭
  if (!("closedBy" in HTMLDialogElement.prototype) && !dialog.dataset.dismissBound) {
    dialog.dataset.dismissBound = "1";
    const outside = (event: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };
    let pressedOutside = false;
    dialog.addEventListener("pointerdown", (event) => {
      pressedOutside = outside(event);
    });
    dialog.addEventListener("pointerup", (event) => {
      if (pressedOutside && outside(event)) dialog.close();
    });
  }
  nextTick(() => inputRef.value?.focus());
}

function go(entry: DocEntry) {
  dialogRef.value?.close();
  router.push(entry.path);
}

function onKeydown(event: KeyboardEvent) {
  const count = results.value.length;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (!count) return;
    const delta = event.key === "ArrowDown" ? 1 : -1;
    activeIndex.value = (activeIndex.value + delta + count) % count;
    nextTick(() => {
      listRef.value
        ?.querySelector(`[data-index="${activeIndex.value}"]`)
        ?.scrollIntoView({ block: "nearest" });
    });
  } else if (event.key === "Enter") {
    event.preventDefault();
    const entry = results.value[activeIndex.value];
    if (entry) go(entry);
  }
}

function onInput() {
  activeIndex.value = 0;
}

defineExpose({ open });
</script>

<template>
  <dialog
    ref="dialogRef"
    class="dialog-animated w-[min(92vw,38rem)] rounded-2xl border border-surface-700 bg-surface-950/95 p-0 text-surface-100 shadow-2xl backdrop:bg-surface-950/70 m-auto mt-[12vh] mb-auto"
    closedby="any"
    aria-label="搜索文档"
  >
    <div class="flex items-center gap-3 border-b border-surface-800 px-4">
      <svg
        class="w-5 h-5 shrink-0 text-surface-500"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
        />
      </svg>
      <input
        ref="inputRef"
        id="doc-search-input"
        v-model="query"
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="doc-search-results"
        :aria-activedescendant="results.length ? `doc-search-opt-${activeIndex}` : undefined"
        aria-autocomplete="list"
        autocomplete="off"
        spellcheck="false"
        placeholder="搜索文档…（如：安装、MCP、快捷键）"
        class="w-full bg-transparent py-3.5 text-base placeholder:text-surface-500 focus:outline-none"
        @keydown="onKeydown"
        @input="onInput"
      />
      <kbd
        class="hidden sm:block shrink-0 rounded border border-surface-700 px-1.5 py-0.5 text-xs text-surface-500 font-mono"
        >Esc</kbd
      >
    </div>

    <div class="max-h-[55vh] overflow-y-auto p-2">
      <p v-if="!query.trim()" class="px-3 pt-2 pb-1 text-xs font-medium text-surface-500">
        常用文档
      </p>
      <ul id="doc-search-results" ref="listRef" role="listbox" aria-label="搜索结果">
        <li
          v-for="(entry, index) in results"
          :id="`doc-search-opt-${index}`"
          :key="entry.path"
          role="option"
          :aria-selected="index === activeIndex"
          :data-index="index"
          class="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5"
          :class="index === activeIndex ? 'bg-brand-400/10 text-brand-300' : 'text-surface-200'"
          @click="go(entry)"
          @mousemove="activeIndex = index"
        >
          <span class="min-w-0">
            <span class="block text-sm font-medium truncate">
              <template v-for="(part, partIndex) in segments(entry.label)" :key="partIndex"
                ><mark v-if="part.hit">{{ part.text }}</mark
                ><template v-else>{{ part.text }}</template></template
              >
            </span>
            <span class="block text-xs text-surface-500 truncate">
              <template v-for="(part, partIndex) in segments(entry.desc)" :key="partIndex"
                ><mark v-if="part.hit">{{ part.text }}</mark
                ><template v-else>{{ part.text }}</template></template
              >
            </span>
          </span>
          <span
            class="shrink-0 rounded-full border border-surface-700/70 px-2 py-0.5 text-xs text-surface-400"
            >{{ groupOf.get(entry.path) }}</span
          >
        </li>
      </ul>
      <p
        v-if="query.trim() && !results.length"
        class="px-3 py-8 text-center text-sm text-surface-500"
      >
        没有找到与“{{ query.trim() }}”相关的文档，试试“安装”“模型”或 “mcp”。
      </p>
    </div>

    <div
      class="flex items-center gap-4 border-t border-surface-800 px-4 py-2.5 text-xs text-surface-500"
    >
      <span><kbd class="font-mono">↑↓</kbd> 选择</span>
      <span><kbd class="font-mono">Enter</kbd> 打开</span>
      <span><kbd class="font-mono">Esc</kbd> 关闭</span>
    </div>
  </dialog>
</template>
