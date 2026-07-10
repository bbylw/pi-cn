<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const docSections = [
  {
    title: '从这里开始',
    icon: '🚀',
    links: [
      { label: '概览', path: '/docs', desc: 'Pi 文档总览' },
      { label: '快速开始', path: '/quickstart', desc: '安装、认证、运行第一个会话' },
      { label: '使用指南', path: '/usage', desc: '交互模式、斜杠命令、上下文文件' },
      { label: '模型提供商', path: '/providers', desc: '订阅和 API Key 设置' },
    ]
  },
  {
    title: '安全与会话',
    icon: '🔒',
    links: [
      { label: '安全', path: '/security', desc: '项目信任、沙箱边界' },
      { label: '容器化', path: '/containerization', desc: 'Gondolin、Docker、OpenShell' },
      { label: '会话管理', path: '/sessions', desc: '会话管理、分支、树导航' },
      { label: '上下文压缩', path: '/compaction', desc: '上下文压缩和分支摘要' },
      { label: '会话格式', path: '/session-format', desc: 'JSONL 会话文件格式' },
    ]
  },
  {
    title: '自定义',
    icon: '🎨',
    links: [
      { label: '扩展', path: '/extensions', desc: 'TypeScript 模块扩展 Pi 行为' },
      { label: '技能', path: '/extensions/#skills', desc: '可复用的按需能力' },
      { label: '提示模板', path: '/prompt-templates', desc: '可复用的 Markdown 提示' },
      { label: '主题', path: '/themes', desc: '内置和自定义终端主题' },
      { label: 'Pi 包', path: '/packages', desc: '打包和分享扩展' },
      { label: '自定义模型', path: '/models', desc: '添加支持的提供商 API 模型' },
      { label: '自定义提供商', path: '/custom-provider', desc: '实现自定义 API 和 OAuth' },
    ]
  },
  {
    title: '程序化使用',
    icon: '⚙️',
    links: [
      { label: 'SDK', path: '/sdk', desc: '在 Node.js 应用中嵌入 Pi' },
      { label: 'RPC 模式', path: '/rpc', desc: '通过 stdin/stdout JSONL 集成' },
      { label: 'JSON 事件流', path: '/json', desc: '结构化事件输出' },
      { label: 'TUI 组件', path: '/tui', desc: '为扩展构建自定义终端 UI' },
    ]
  },
  {
    title: '平台设置',
    icon: '💻',
    links: [
      { label: 'Windows', path: '/windows', desc: 'Windows 平台配置' },
      { label: 'Termux (Android)', path: '/termux', desc: 'Android Termux 配置' },
      { label: 'tmux', path: '/tmux', desc: 'tmux 集成' },
      { label: '终端设置', path: '/terminal-setup', desc: '终端配置' },
      { label: 'Shell 别名', path: '/shell-aliases', desc: 'Shell 别名配置' },
    ]
  },
  {
    title: '配置与开发',
    icon: '🔧',
    links: [
      { label: '设置', path: '/settings', desc: '全局和项目设置' },
      { label: '快捷键', path: '/keybindings', desc: '默认快捷键和自定义' },
      { label: '开发', path: '/development', desc: '本地设置、项目结构、调试' },
    ]
  }
]

const quickLinks = [
  { label: '安全策略', path: '/security' },
  { label: '容器化', path: '/containerization' },
  { label: '会话管理', path: '/sessions' },
  { label: '上下文压缩', path: '/compaction' },
  { label: 'SDK 参考', path: '/sdk' },
  { label: '设置', path: '/settings' },
]

const externalDocs = [
  { label: 'GitHub 源码', url: 'https://github.com/earendil-works/pi' },
  { label: 'npm 包', url: 'https://www.npmjs.com/package/@earendil-works/pi-coding-agent' },
  { label: 'Discord 社区', url: 'https://discord.com/invite/3cU7Bz4UPx' },
  { label: 'X (Twitter)', url: 'https://x.com/pidotdev' },
  { label: 'Press Kit', url: 'https://pi.dev/press-kit' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">文档中心</h1>
        <p class="text-lg text-surface-400 max-w-2xl mx-auto">
          配置和扩展 Pi 的完整指南和参考
        </p>
      </div>

      <!-- Quick Links -->
      <div class="mb-12 flex flex-wrap items-center justify-center gap-3">
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div v-for="section in docSections" :key="section.title" class="glass-card p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl">{{ section.icon }}</span>
            <h2 class="text-lg font-display font-semibold text-surface-50">{{ section.title }}</h2>
          </div>
          <ul class="space-y-2">
            <li v-for="link in section.links" :key="link.label">
              <router-link
                v-if="link.path.startsWith('/') && !link.path.includes('#')"
                :to="link.path"
                class="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-800/50 transition-colors group"
              >
                <span class="text-surface-200 group-hover:text-brand-400 text-sm">{{ link.label }}</span>
                <span class="text-surface-500 text-xs hidden sm:block">{{ link.desc }}</span>
              </router-link>
              <a
                v-else-if="link.path.includes('#')"
                :href="link.path"
                class="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-800/50 transition-colors group"
              >
                <span class="text-surface-200 group-hover:text-brand-400 text-sm">{{ link.label }}</span>
                <span class="text-surface-500 text-xs hidden sm:block">{{ link.desc }}</span>
              </a>
              <a
                v-else
                :href="link.path"
                class="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-800/50 transition-colors group"
              >
                <span class="text-surface-200 group-hover:text-brand-400 text-sm">{{ link.label }}</span>
                <span class="text-surface-500 text-xs hidden sm:block">{{ link.desc }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

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
