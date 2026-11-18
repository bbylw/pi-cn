<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { docGroups } from "../data/docs";
import { useClipboard } from "../composables/useClipboard";

const route = useRoute();

const meta = computed(() => {
  for (const group of docGroups) {
    const item = group.items.find((entry) => entry.path === route.path);
    if (item) return { group: group.title, label: item.label };
  }
  return null;
});

interface TocItem {
  id: string;
  text: string;
}

const articleRef = ref<HTMLElement | null>(null);
const mobileTocRef = ref<HTMLDetailsElement | null>(null);
const toc = ref<TocItem[]>([]);
const activeId = ref("");
const progress = ref(0);
const { status, copy } = useClipboard();

let mutationObserver: MutationObserver | null = null;
let headingObserver: IntersectionObserver | null = null;
let scrollTicking = false;

function makeId(text: string, index: number, used: Set<string>): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = slug ? `sec-${slug}` : `sec-${index + 1}`;
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

function observeHeadings(els: Element[]) {
  headingObserver?.disconnect();
  headingObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeId.value = (entry.target as HTMLElement).id;
      }
    },
    { rootMargin: "-80px 0px -70% 0px" },
  );
  for (const el of els) headingObserver.observe(el);
}

function refresh() {
  const root = articleRef.value;
  if (!root) return;
  const els = Array.from(root.querySelectorAll("h2"));
  const used = new Set<string>();
  const list = els.map((el, index) => {
    // 注入锚点后 textContent 会包含 "#"，首次提取时缓存原始标题
    let text = el.dataset.tocText;
    if (!text) {
      text = (el.textContent || "").trim();
      el.dataset.tocText = text;
    }
    if (!el.id) el.id = makeId(text, index, used);
    else used.add(el.id);
    if (!el.querySelector(".heading-anchor")) {
      const anchor = document.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = `#${el.id}`;
      anchor.textContent = "#";
      anchor.setAttribute("aria-label", `复制本节链接：${text}`);
      el.appendChild(anchor);
    }
    return { id: el.id, text };
  });
  const key = list.map((item) => item.id + item.text).join("|");
  if (key !== toc.value.map((item) => item.id + item.text).join("|")) {
    toc.value = list;
    activeId.value = list[0]?.id ?? "";
    observeHeadings(els);
  }
}

function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.value = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    scrollTicking = false;
  });
}

function onArticleClick(event: MouseEvent) {
  const anchor = (event.target as HTMLElement).closest?.(".heading-anchor");
  if (anchor) {
    void copy(window.location.origin + route.path + anchor.getAttribute("href"));
  }
}

function closeMobileToc() {
  mobileTocRef.value?.removeAttribute("open");
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  // 页面组件懒加载 + 过渡动画，标题出现时机不定，用 MutationObserver 捕获
  mutationObserver = new MutationObserver(refresh);
  if (articleRef.value) {
    mutationObserver.observe(articleRef.value, { childList: true, subtree: true });
  }
  void nextTick(refresh);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  mutationObserver?.disconnect();
  headingObserver?.disconnect();
});
</script>

<template>
  <div>
    <div class="reading-progress" :style="{ inlineSize: `${progress}%` }" aria-hidden="true"></div>

    <div class="max-w-7xl mx-auto xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-10 xl:px-6">
      <div class="min-w-0">
        <nav
          v-if="meta"
          aria-label="面包屑"
          class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 -mb-6"
        >
          <ol class="flex items-center flex-wrap gap-1.5 text-xs text-surface-500">
            <li>
              <router-link to="/docs" class="hover:text-brand-400 transition-colors">
                文档中心
              </router-link>
            </li>
            <li aria-hidden="true">›</li>
            <li>{{ meta.group }}</li>
            <li aria-hidden="true">›</li>
            <li class="text-surface-300" aria-current="page">{{ meta.label }}</li>
          </ol>
        </nav>

        <div v-if="toc.length" class="xl:hidden max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 -mb-6">
          <details ref="mobileTocRef" class="toc-mobile glass-card">
            <summary
              class="flex items-center justify-between px-4 py-2.5 text-sm text-surface-300 cursor-pointer select-none"
            >
              <span>
                本页目录
                <span class="text-surface-500 text-xs">（{{ toc.length }} 节）</span>
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="footer-chevron w-4 h-4 text-surface-500"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <ul class="px-3 pb-3 space-y-0.5">
              <li v-for="item in toc" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  class="toc-mobile-link"
                  :class="{ 'toc-mobile-link-active': activeId === item.id }"
                  @click="closeMobileToc"
                >
                  {{ item.text }}
                </a>
              </li>
            </ul>
          </details>
        </div>

        <div ref="articleRef" @click="onArticleClick">
          <slot />
        </div>
      </div>

      <aside v-if="toc.length" class="hidden xl:block">
        <nav
          class="toc-scroll sticky top-20 pt-14 pb-8 max-h-[calc(100dvh-6rem)] overflow-y-auto"
          aria-label="本页目录"
        >
          <p class="text-xs font-semibold text-surface-400 tracking-wider mb-3">本页目录</p>
          <ul class="border-l border-surface-800">
            <li v-for="item in toc" :key="item.id">
              <a
                :href="`#${item.id}`"
                class="toc-link"
                :class="{ 'toc-link-active': activeId === item.id }"
                :aria-current="activeId === item.id ? 'location' : undefined"
              >
                {{ item.text }}
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </div>

    <Transition name="toast">
      <div v-if="status === 'copied'" class="copy-toast" role="status">节链接已复制</div>
    </Transition>
  </div>
</template>
