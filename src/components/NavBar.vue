<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navItems = [
  { path: '/', label: '首页' },
  { path: '/quickstart', label: '快速开始' },
  { path: '/usage', label: '使用指南' },
  { path: '/providers', label: '模型提供商' },
  { path: '/extensions', label: '扩展技能' },
  { path: '/packages', label: '生态包' },
  { path: '/docs', label: '文档' },
]

const docDropdown = [
  { path: '/security', label: '安全' },
  { path: '/sessions', label: '会话管理' },
  { path: '/compaction', label: '上下文压缩' },
  { path: '/containerization', label: '容器化' },
  { path: '/settings', label: '设置' },
  { path: '/sdk', label: 'SDK' },
]

const externalLinks = [
  { url: 'https://github.com/earendil-works/pi', label: 'GitHub' },
  { url: 'https://discord.com/invite/3cU7Bz4UPx', label: 'Discord' },
  { url: 'https://www.npmjs.com/package/@earendil-works/pi-coding-agent', label: 'npm' },
]
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-surface-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <span class="text-surface-950 font-display font-bold text-lg">π</span>
          </div>
          <span class="font-display font-semibold text-xl text-surface-50">Pi</span>
        </router-link>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link text-sm"
            :class="{ 'nav-link-active': route.path === item.path || (item.path !== '/' && route.path.startsWith(item.path)) }"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- External Links -->
        <div class="hidden md:flex items-center gap-3">
          <a
            v-for="link in externalLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 text-surface-400 hover:text-brand-400 transition-colors"
            :title="link.label"
          >
            <svg v-if="link.label === 'GitHub'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <svg v-else-if="link.label === 'Discord'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"/>
            </svg>
          </a>
        </div>

        <!-- Mobile menu button -->
        <button
          class="md:hidden p-2 text-surface-400 hover:text-surface-100"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-surface-800 bg-surface-950/95 backdrop-blur-xl">
        <div class="px-4 py-3 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="block nav-link"
            :class="{ 'nav-link-active': route.path === item.path }"
            @click="mobileMenuOpen = false"
          >
            {{ item.label }}
          </router-link>
          <div class="border-t border-surface-800 my-2"></div>
          <div class="px-2 py-1 text-surface-500 text-xs font-medium">文档</div>
          <router-link
            v-for="item in docDropdown"
            :key="item.path"
            :to="item.path"
            class="block nav-link pl-4"
            :class="{ 'nav-link-active': route.path === item.path }"
            @click="mobileMenuOpen = false"
          >
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </transition>
  </header>
</template>
