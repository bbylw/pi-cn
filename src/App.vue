<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";
import FooterBar from "./components/FooterBar.vue";
import PageNeighbors from "./components/PageNeighbors.vue";
import BackToTop from "./components/BackToTop.vue";
import DocLayout from "./components/DocLayout.vue";
import { docOrder } from "./data/docs";

const route = useRoute();
const isDocArticle = computed(() => docOrder.some((entry) => entry.path === route.path));
</script>

<template>
  <div class="min-h-screen flex flex-col bg-mesh">
    <a href="#main-content" class="skip-link">跳到主要内容</a>
    <NavBar />
    <main id="main-content" class="flex-1" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <DocLayout v-if="isDocArticle" :key="route.path">
            <component :is="Component" />
          </DocLayout>
          <component v-else :is="Component" />
        </transition>
      </router-view>
      <PageNeighbors />
    </main>
    <FooterBar />
    <BackToTop />
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
