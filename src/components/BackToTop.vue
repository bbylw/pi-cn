<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const visible = ref(false);
let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    visible.value = window.scrollY > 600;
    ticking = false;
  });
}

function scrollToTop() {
  // behavior: auto 跟随 CSS scroll-behavior，reduced-motion 时自动变为瞬时
  window.scrollTo({ top: 0, behavior: "auto" });
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <Transition name="fab">
    <button
      v-show="visible"
      type="button"
      class="back-to-top"
      aria-label="回到顶部"
      @click="scrollToTop"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  inset-inline-end: max(1rem, env(safe-area-inset-right));
  inset-block-end: calc(1rem + env(safe-area-inset-bottom));
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  background-color: rgba(24, 24, 27, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-surface-700);
  color: var(--color-surface-300);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s,
    translate 0.2s;
}

.back-to-top:hover {
  color: var(--color-brand-400);
  border-color: rgba(245, 158, 11, 0.4);
}

.back-to-top:active {
  translate: 0 1px;
}

.fab-enter-active,
.fab-leave-active {
  transition:
    opacity 0.2s ease,
    translate 0.2s ease;
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  translate: 0 8px;
}
</style>
