<script setup lang="ts">
const currentYear = new Date().getFullYear()

const footerLinks = [
  {
    title: '快速开始',
    links: [
      { label: '快速开始', path: '/quickstart' },
      { label: '使用指南', path: '/usage' },
      { label: '模型提供商', path: '/providers' },
      { label: '扩展与技能', path: '/extensions' },
    ]
  },
  {
    title: '进阶文档',
    links: [
      { label: '安全', path: '/security' },
      { label: '会话管理', path: '/sessions' },
      { label: '上下文压缩', path: '/compaction' },
      { label: '容器化', path: '/containerization' },
    ]
  },
  {
    title: '开发',
    links: [
      { label: '设置', path: '/settings' },
      { label: 'SDK', path: '/sdk' },
      { label: '生态包', path: '/packages' },
      { label: '文档中心', path: '/docs' },
    ]
  },
  {
    title: '社区',
    links: [
      { label: 'GitHub', url: 'https://github.com/earendil-works/pi' },
      { label: 'Discord', url: 'https://discord.com/invite/3cU7Bz4UPx' },
      { label: 'npm', url: 'https://www.npmjs.com/package/@earendil-works/pi-coding-agent' },
      { label: 'X (Twitter)', url: 'https://x.com/pidotdev' },
    ]
  }
]
</script>

<template>
  <footer class="border-t border-surface-800/50 bg-surface-950/50 backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-8">
        <!-- Brand -->
        <div class="md:col-span-1">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span class="text-surface-950 font-display font-bold text-lg">π</span>
            </div>
            <span class="font-display font-semibold text-xl text-surface-50">Pi</span>
          </div>
          <p class="text-surface-400 text-sm leading-relaxed">
            极简终端编码 Agent 框架。<br>让你的工作流适应 Pi，而非相反。
          </p>
        </div>

        <!-- Links -->
        <div v-for="section in footerLinks" :key="section.title">
          <h4 class="font-semibold text-surface-100 mb-4">{{ section.title }}</h4>
          <ul class="space-y-2">
            <li v-for="link in section.links" :key="link.label">
              <router-link
                v-if="link.path"
                :to="link.path"
                class="text-surface-400 hover:text-brand-400 text-sm transition-colors"
              >
                {{ link.label }}
              </router-link>
              <a
                v-else
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-surface-400 hover:text-brand-400 text-sm transition-colors"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-surface-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-surface-500 text-sm">
          © {{ currentYear }} Earendil Inc. & Contributors. MIT License.
        </p>
        <p class="text-surface-600 text-xs">
          pi.dev 域名由 <a href="https://exe.dev" target="_blank" class="text-brand-500 hover:text-brand-400">exe.dev</a> 慷慨捐赠
        </p>
      </div>
    </div>
  </footer>
</template>
