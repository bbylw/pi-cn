import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
    meta: { title: 'Pi - 极简编码 Agent 框架' }
  },
  {
    path: '/quickstart',
    name: 'Quickstart',
    component: () => import('../pages/QuickstartPage.vue'),
    meta: { title: '快速开始 - Pi' }
  },
  {
    path: '/usage',
    name: 'Usage',
    component: () => import('../pages/UsagePage.vue'),
    meta: { title: '使用指南 - Pi' }
  },
  {
    path: '/providers',
    name: 'Providers',
    component: () => import('../pages/ProvidersPage.vue'),
    meta: { title: '模型提供商 - Pi' }
  },
  {
    path: '/extensions',
    name: 'Extensions',
    component: () => import('../pages/ExtensionsPage.vue'),
    meta: { title: '扩展与技能 - Pi' }
  },
  {
    path: '/packages',
    name: 'Packages',
    component: () => import('../pages/PackagesPage.vue'),
    meta: { title: '生态包 - Pi' }
  },
  {
    path: '/docs',
    name: 'Docs',
    component: () => import('../pages/DocsPage.vue'),
    meta: { title: '文档 - Pi' }
  },
  // New documentation pages
  {
    path: '/security',
    name: 'Security',
    component: () => import('../pages/SecurityPage.vue'),
    meta: { title: '安全 - Pi' }
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: () => import('../pages/SessionsPage.vue'),
    meta: { title: '会话管理 - Pi' }
  },
  {
    path: '/compaction',
    name: 'Compaction',
    component: () => import('../pages/CompactionPage.vue'),
    meta: { title: '上下文压缩 - Pi' }
  },
  {
    path: '/containerization',
    name: 'Containerization',
    component: () => import('../pages/ContainerizationPage.vue'),
    meta: { title: '容器化 - Pi' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/SettingsPage.vue'),
    meta: { title: '设置 - Pi' }
  },
  {
    path: '/sdk',
    name: 'Sdk',
    component: () => import('../pages/SdkPage.vue'),
    meta: { title: 'SDK - Pi' }
  },
  // Redirects for pages not yet created
  {
    path: '/keybindings',
    redirect: '/usage'
  },
  {
    path: '/session-format',
    redirect: '/sessions'
  },
  {
    path: '/prompt-templates',
    redirect: '/extensions'
  },
  {
    path: '/themes',
    redirect: '/extensions'
  },
  {
    path: '/models',
    redirect: '/providers'
  },
  {
    path: '/custom-provider',
    redirect: '/providers'
  },
  {
    path: '/rpc',
    redirect: '/sdk'
  },
  {
    path: '/json',
    redirect: '/sdk'
  },
  {
    path: '/tui',
    redirect: '/extensions'
  },
  {
    path: '/windows',
    redirect: '/docs'
  },
  {
    path: '/termux',
    redirect: '/docs'
  },
  {
    path: '/tmux',
    redirect: '/docs'
  },
  {
    path: '/terminal-setup',
    redirect: '/docs'
  },
  {
    path: '/shell-aliases',
    redirect: '/docs'
  },
  {
    path: '/development',
    redirect: '/docs'
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'Pi - 极简编码 Agent 框架'
  next()
})

export default router
