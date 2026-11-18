<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { docGroups } from "../data/docs";
import SearchDialog from "./SearchDialog.vue";

const route = useRoute();

const navItems = [
  { path: "/", label: "首页" },
  { path: "/quickstart", label: "快速开始" },
  { path: "/usage", label: "使用指南" },
  { path: "/models", label: "模型" },
  { path: "/mcp", label: "MCP" },
  { path: "/skills", label: "技能" },
];

const externalLinks = [
  { url: "https://github.com/earendil-works/pi", label: "GitHub" },
  { url: "https://discord.com/invite/3cU7Bz4UPx", label: "Discord" },
  { url: "https://www.npmjs.com/package/@earendil-works/pi-coding-agent", label: "npm" },
];

const searchRef = ref<InstanceType<typeof SearchDialog>>();
const docsMenuRef = ref<HTMLDivElement>();
const docsWrapRef = ref<HTMLDivElement>();
const mobileMenuRef = ref<HTMLDivElement>();
const docsOpen = ref(false);
const mobileOpen = ref(false);
let hoverPreview = false;

function isNavActive(path: string) {
  return route.path === path || (path !== "/" && route.path.startsWith(path));
}

const docsActive = () =>
  route.path === "/docs" ||
  docGroups.some((group) => group.items.some((doc) => doc.path === route.path));

// polyfill 环境下 :popover-open 伪类不可用于 matches()，退回其提供的类名
function isPopoverOpen(element: HTMLElement) {
  try {
    return element.matches(":popover-open");
  } catch {
    return element.classList.contains("\\:popover-open");
  }
}

function showDocsMenu() {
  const menu = docsMenuRef.value;
  if (menu && typeof menu.showPopover === "function" && !isPopoverOpen(menu)) {
    menu.showPopover();
  }
}

function hideDocsMenu() {
  const menu = docsMenuRef.value;
  if (menu && typeof menu.hidePopover === "function" && isPopoverOpen(menu)) {
    menu.hidePopover();
  }
}

function hideMobileMenu() {
  const menu = mobileMenuRef.value;
  if (menu && typeof menu.hidePopover === "function" && isPopoverOpen(menu)) {
    menu.hidePopover();
  }
}

// 桌面端悬停预览：仅在支持 hover 的精确指针设备上启用。
// 离开时延迟关闭，指针跨过按钮与面板之间的空隙后重新进入即取消。
let hoverHideTimer: ReturnType<typeof setTimeout> | undefined;

function onDocsPointerEnter(event: PointerEvent) {
  clearTimeout(hoverHideTimer);
  if (hoverPreview) return;
  if (!matchMedia("(hover: hover)").matches || event.pointerType === "touch") return;
  hoverPreview = true;
  showDocsMenu();
}

function onDocsPointerLeave() {
  if (!hoverPreview) return;
  clearTimeout(hoverHideTimer);
  hoverHideTimer = setTimeout(() => {
    if (hoverPreview) {
      hoverPreview = false;
      hideDocsMenu();
    }
  }, 150);
}

function onDocsButtonClick(event: MouseEvent) {
  // 悬停预览中点击视为“固定打开”，而不是让原生 toggle 关闭它
  if (hoverPreview) {
    event.preventDefault();
    hoverPreview = false;
  }
}

function onDocsFocusOut(event: FocusEvent) {
  const wrap = docsWrapRef.value;
  if (wrap && event.relatedTarget instanceof Node && !wrap.contains(event.relatedTarget)) {
    hoverPreview = false;
    hideDocsMenu();
  }
}

function onDocsToggle(event: Event) {
  docsOpen.value = (event as ToggleEvent).newState === "open";
  if (!docsOpen.value) hoverPreview = false;
}

function onMobileToggle(event: Event) {
  mobileOpen.value = (event as ToggleEvent).newState === "open";
}

function openSearch() {
  hideMobileMenu();
  hideDocsMenu();
  searchRef.value?.open();
}

function onGlobalKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
}

watch(
  () => route.path,
  () => {
    hoverPreview = false;
    hideDocsMenu();
    hideMobileMenu();
  },
);

onMounted(() => document.addEventListener("keydown", onGlobalKeydown));
onUnmounted(() => {
  document.removeEventListener("keydown", onGlobalKeydown);
  clearTimeout(hoverHideTimer);
});
</script>

<template>
  <header
    class="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-surface-800/50"
  >
    <div class="docs-menu-anchor max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3" aria-label="Pi 首页">
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center"
            aria-hidden="true"
          >
            <span class="text-surface-950 font-display font-bold text-lg">π</span>
          </div>
          <span class="font-display font-semibold text-xl text-surface-50">Pi</span>
        </router-link>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1" aria-label="主导航">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link text-sm"
            :class="{ 'nav-link-active': isNavActive(item.path) }"
            :aria-current="isNavActive(item.path) ? 'page' : undefined"
          >
            {{ item.label }}
          </router-link>

          <!-- 文档下拉菜单：原生 popover，按上游 docs.json 的分组 -->
          <div
            ref="docsWrapRef"
            class="relative"
            @pointerenter="onDocsPointerEnter"
            @pointerleave="onDocsPointerLeave"
            @focusout="onDocsFocusOut"
          >
            <button
              type="button"
              class="nav-link text-sm flex items-center gap-1"
              :class="{ 'nav-link-active': docsActive() }"
              popovertarget="docs-menu"
              aria-controls="docs-menu"
              :aria-expanded="docsOpen"
              @click="onDocsButtonClick"
            >
              文档
              <svg
                class="w-3.5 h-3.5 transition-transform duration-150"
                :class="{ 'rotate-180': docsOpen }"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              id="docs-menu"
              ref="docsMenuRef"
              popover="auto"
              class="docs-menu-panel popover-animated w-[min(52rem,calc(100vw-2rem))] max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-xl border border-surface-800 bg-surface-950/95 backdrop-blur-xl p-5 shadow-2xl"
              @toggle="onDocsToggle"
            >
              <div class="grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-6">
                <div v-for="group in docGroups" :key="group.title">
                  <div class="mb-2 text-xs font-medium tracking-wide text-surface-500">
                    {{ group.title }}
                  </div>
                  <router-link
                    v-for="doc in group.items"
                    :key="doc.path"
                    :to="doc.path"
                    class="block rounded-md px-2 py-1 text-sm text-surface-300 hover:text-brand-400 hover:bg-surface-900 transition-colors"
                    :class="{ 'text-brand-400 bg-brand-400/10': route.path === doc.path }"
                    :aria-current="route.path === doc.path ? 'page' : undefined"
                  >
                    {{ doc.label }}
                  </router-link>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-surface-800/70">
                <router-link
                  to="/docs"
                  class="text-sm text-brand-400 hover:text-brand-300 font-medium"
                >
                  查看文档中心 →
                </router-link>
              </div>
            </div>
          </div>
        </nav>

        <!-- Search + External Links -->
        <div class="flex items-center gap-1 sm:gap-3">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-surface-700/70 bg-surface-900/60 px-2.5 py-1.5 text-sm text-surface-400 hover:text-brand-400 hover:border-brand-500/40 transition-colors"
            aria-label="搜索文档（Ctrl+K）"
            @click="openSearch"
          >
            <svg
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
                d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
              />
            </svg>
            <span class="hidden lg:inline">搜索文档</span>
            <kbd
              class="hidden lg:inline rounded border border-surface-700 px-1.5 text-xs font-mono text-surface-500"
              >Ctrl K</kbd
            >
          </button>

          <a
            v-for="link in externalLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden md:block p-2 text-surface-400 hover:text-brand-400 transition-colors"
            :aria-label="`${link.label}（新窗口打开）`"
          >
            <svg
              v-if="link.label === 'GitHub'"
              class="w-5 h-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            <svg
              v-else-if="link.label === 'Discord'"
              class="w-5 h-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"
              />
            </svg>
            <svg v-else class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"
              />
            </svg>
          </a>

          <!-- Mobile menu button -->
          <button
            type="button"
            class="md:hidden p-2 text-surface-400 hover:text-surface-100"
            popovertarget="mobile-menu"
            aria-controls="mobile-menu"
            :aria-expanded="mobileOpen"
            :aria-label="mobileOpen ? '关闭导航菜单' : '打开导航菜单'"
          >
            <svg
              v-if="!mobileOpen"
              class="w-6 h-6"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
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
        </div>
      </div>
    </div>

    <!-- Mobile menu：原生 popover，自带 Esc / 点击外部关闭 -->
    <div
      id="mobile-menu"
      ref="mobileMenuRef"
      popover="auto"
      class="popover-animated md:hidden fixed inset-x-0 top-16 bottom-auto m-0 w-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-surface-800 bg-surface-950/95 backdrop-blur-xl"
      @toggle="onMobileToggle"
    >
      <nav class="px-4 py-3 space-y-1" aria-label="移动端导航">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="block nav-link"
          :class="{ 'nav-link-active': isNavActive(item.path) }"
          :aria-current="isNavActive(item.path) ? 'page' : undefined"
        >
          {{ item.label }}
        </router-link>
        <div class="border-t border-surface-800 my-2"></div>
        <router-link
          to="/docs"
          class="block nav-link"
          :class="{ 'nav-link-active': route.path === '/docs' }"
          :aria-current="route.path === '/docs' ? 'page' : undefined"
        >
          文档
        </router-link>
        <template v-for="group in docGroups" :key="group.title">
          <div class="px-2 pt-2 pb-1 text-surface-500 text-xs font-medium">{{ group.title }}</div>
          <router-link
            v-for="doc in group.items"
            :key="doc.path"
            :to="doc.path"
            class="block nav-link pl-4"
            :class="{ 'nav-link-active': route.path === doc.path }"
            :aria-current="route.path === doc.path ? 'page' : undefined"
          >
            {{ doc.label }}
          </router-link>
        </template>
        <div class="border-t border-surface-800 my-2"></div>
        <div class="flex items-center gap-2 px-2 py-2">
          <a
            v-for="link in externalLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="nav-link text-sm"
            >{{ link.label }}</a
          >
        </div>
      </nav>
    </div>

    <SearchDialog ref="searchRef" />
  </header>
</template>
