<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const docSections = [
  {
    title: '从这里开始',
    icon: '🚀',
    links: [
      { label: '概览', path: '/docs', desc: 'Pi 文档总览' },
      { label: '快速开始', path: '/quickstart', desc: '安装、连接模型、完成第一个任务' },
      { label: 'Pi 如何工作', path: '/how-pi-works', desc: '工具、上下文、会话与 agent 循环' },
    ]
  },
  {
    title: '使用 Pi',
    icon: '⌨️',
    links: [
      { label: '终端使用', path: '/usage', desc: '输入、命令、快捷键和排队消息' },
      { label: '选择模型', path: '/models', desc: '订阅、API Key、本地模型与兼容端点' },
      { label: '会话与上下文', path: '/sessions', desc: '恢复、分支、压缩与分享' },
      { label: '安全运行', path: '/security', desc: '项目信任、隔离方式与恢复' },
      { label: '容器化', path: '/containerization', desc: 'Docker、Docker Sandboxes、OpenShell、Gondolin' },
    ]
  },
  {
    title: '终端与环境',
    icon: '🖥️',
    links: [
      { label: '配置终端', path: '/terminal-setup', desc: '修改键、滚动、链接、图片与 IME 问题' },
      { label: '配置 shell 命令', path: '/shell-aliases', desc: 'shellPath、命令前缀与 Bash 别名' },
      { label: '在 tmux 中运行', path: '/tmux', desc: '通过扩展键区分 Shift+Enter 与 Enter' },
      { label: '在 Windows 上运行', path: '/windows', desc: 'Git Bash、PowerShell 与 WSL' },
      { label: '在 Android 上运行', path: '/termux', desc: 'Termux 安装、共享存储与剪贴板' },
    ]
  },
  {
    title: '自定义 Pi',
    icon: '🎨',
    links: [
      { label: '配置', path: '/configuration', desc: 'agent 目录、项目 .pi 与上下文文件' },
      { label: '技能', path: '/skills', desc: '按需加载的专门指令与配套文件' },
      { label: '扩展', path: '/extensions', desc: 'TypeScript 模块扩展 Pi 的行为' },
      { label: 'Pi 包', path: '/packages', desc: '通过 npm 或 git 打包分发资源' },
      { label: 'MCP 服务器', path: '/mcp', desc: '连接 Model Context Protocol 服务器' },
      { label: '提示模板', path: '/prompt-templates', desc: '把 Markdown 文件变成可复用命令' },
      { label: '主题', path: '/themes', desc: '选择或自定义终端配色' },
      { label: '终端 UI', path: '/tui', desc: '用 pi-tui 构建自定义组件与浮层' },
      { label: '自定义提供商', path: '/custom-provider', desc: '注册端点、认证与自定义流式' },
    ]
  },
  {
    title: '在 Pi 上构建',
    icon: '⚙️',
    links: [
      { label: 'SDK', path: '/sdk', desc: '在 Node.js 或 Bun 应用中嵌入 Pi' },
      { label: '命令行', path: '/cli', desc: '全部命令与选项、打印/JSON/RPC 模式' },
      { label: '斜杠命令', path: '/slash-commands', desc: '交互会话中的内置命令' },
    ]
  },
  {
    title: '参考',
    icon: '📚',
    links: [
      { label: '设置', path: '/settings', desc: '全部设置项及默认值' },
      { label: '上下文压缩', path: '/compaction', desc: '阈值、保留边界、分支摘要与扩展钩子' },
      { label: '模型提供商', path: '/providers', desc: '认证方式与提供商专属配置' },
      { label: '键位绑定', path: '/keybindings', desc: '全部动作 ID 与默认按键' },
      { label: '会话文件格式', path: '/session-format', desc: 'JSONL 条目类型与树结构' },
      { label: 'JSON 事件流', path: '/json', desc: '流式事件、工具执行与压缩事件' },
      { label: 'RPC 模式', path: '/rpc', desc: '通过 stdin/stdout 控制 Pi 子进程' },
    ]
  }
]

const quickLinks = [
  { label: '快速开始', path: '/quickstart' },
  { label: '选择模型', path: '/models' },
  { label: 'MCP 服务器', path: '/mcp' },
  { label: '命令行', path: '/cli' },
  { label: '设置参考', path: '/settings' },
  { label: '安全', path: '/security' },
]

const externalDocs = [
  { label: 'GitHub 源码', url: 'https://github.com/earendil-works/pi' },
  { label: 'npm 包', url: 'https://www.npmjs.com/package/@earendil-works/pi-coding-agent' },
  { label: '模型目录', url: 'https://pi.dev/models' },
  { label: '包画廊', url: 'https://pi.dev/packages' },
  { label: 'Discord 社区', url: 'https://discord.com/invite/3cU7Bz4UPx' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">文档中心</h1>
        <p class="text-lg text-surface-400 max-w-2xl">
          从安装到扩展 Pi 的完整指南，内容跟随上游 <a href="https://github.com/earendil-works/pi" target="_blank" rel="noopener noreferrer" class="text-brand-400 hover:text-brand-300">earendil-works/pi</a> 的最新文档更新。
        </p>
      </div>

      <!-- Quick Links -->
      <div class="mb-12 flex flex-wrap items-center gap-3">
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
                :to="link.path"
                class="flex items-start justify-between gap-3 py-1.5 px-2 rounded-lg hover:bg-surface-800/50 transition-colors group"
              >
                <span class="text-surface-200 group-hover:text-brand-400 text-sm shrink-0">{{ link.label }}</span>
                <span class="text-surface-500 text-xs text-right hidden sm:block">{{ link.desc }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Start -->
      <section class="glass-card p-8 mb-12">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">第一次使用？</h2>
        <p class="text-surface-300 text-sm mb-4">
          Pi 在终端中运行并处理你机器上的文件。你需要一个受支持提供商提供的模型访问权限：订阅、API Key 或本地模型都可以。
        </p>
        <CodeBlock code="npm install -g --ignore-scripts @earendil-works/pi-coding-agent" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          macOS、Linux 和 Windows 也可以使用 <code class="text-brand-400">https://pi.dev/install.sh</code> 安装脚本，
          或通过 Nix 安装。详见 <router-link to="/quickstart" class="text-brand-400 hover:text-brand-300">快速开始</router-link>。
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
