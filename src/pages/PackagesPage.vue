<script setup lang="ts">
const packages = [
  {
    name: 'pi-mcp-adapter',
    author: 'nicobailon',
    desc: 'MCP 适配器，让 Pi 支持 Model Context Protocol',
    type: 'extension',
    version: '2.11.0',
    installs: '38.2K/mo',
  },
  {
    name: '@tintinweb/pi-subagents',
    author: 'tintinweb',
    desc: '智能 Claude Code 风格的自主子 Agent',
    type: 'extension',
    version: '0.13.0',
    installs: '37.4K/mo',
  },
  {
    name: '@ayulab/pi-rewind',
    author: 'ayu.exorcist',
    desc: '提供 /rewind 检查点导航功能',
    type: 'extension',
    version: '0.4.4',
    installs: '32.3K/mo',
  },
  {
    name: '@plannotator/pi-extension',
    author: 'backnotprop',
    desc: '交互式计划审查与注释，审查代码/PR',
    type: 'package',
    version: '0.22.0',
    installs: '28.5K/mo',
  },
  {
    name: 'pi-lens',
    author: 'apmantza',
    desc: '实时代码反馈 — LSP、lint、格式化、类型检查',
    type: 'extension',
    version: '3.8.67',
    installs: '27.3K/mo',
  },
  {
    name: 'bigpowers',
    author: 'danielvm',
    desc: '73 个 Agent 技能，17 年软件工程经验的方法论',
    type: 'skill',
    version: '2.76.2',
    installs: '27K/mo',
  },
  {
    name: '@juicesharp/rpiv-todo',
    author: 'juicesharp',
    desc: '模型待办列表，渲染为实时覆盖层',
    type: 'extension',
    version: '1.20.0',
    installs: '28.1K/mo',
  },
  {
    name: '@nitra/cursor',
    author: 'vitaliytv',
    desc: '下载 cursor 规则到本地仓库',
    type: 'package',
    version: '14.14.0',
    installs: '35.4K/mo',
  },
]

const installExamples = `# 从 npm 安装
pi install npm:@foo/pi-tools

# 从 git 安装
pi install git:github.com/badlogic/pi-doom

# 浏览更多包
# 访问 https://pi.dev/packages`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">生态包</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          打包和分享扩展、技能、提示和主题。从 npm 或 git 安装。
        </p>
      </div>

      <!-- Install Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">安装包</h2>
        <p class="text-surface-300 mb-4">
          使用 <code class="text-brand-400">pi install</code> 命令安装社区包：
        </p>
        <div class="glass-card p-6 glow-border">
          <pre class="font-mono text-surface-200 text-sm leading-relaxed">{{ installExamples }}</pre>
        </div>
      </section>

      <!-- Packages Grid -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">热门包</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="pkg in packages" :key="pkg.name" class="glass-card p-5 hover:border-brand-500/30 transition-all">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold text-surface-100 text-sm">{{ pkg.name }}</h3>
              <span class="px-2 py-0.5 text-xs rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                {{ pkg.type }}
              </span>
            </div>
            <p class="text-surface-400 text-sm mb-3">{{ pkg.desc }}</p>
            <div class="flex items-center justify-between text-xs text-surface-500">
              <span>by {{ pkg.author }}</span>
              <span>{{ pkg.installs }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Create Your Own -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">创建自己的包</h2>
        <p class="text-surface-300 mb-4">
          将扩展、技能、提示和主题打包为 Pi 包，通过 npm 或 git 分享：
        </p>
        <div class="glass-card p-6">
          <h4 class="font-semibold text-surface-100 mb-3">包结构</h4>
          <pre class="font-mono text-surface-300 text-sm leading-relaxed">my-pi-package/
├── package.json          # 包含 "pi" 配置
├── extensions/           # TypeScript 扩展
├── skills/               # 技能定义
├── prompts/              # 提示模板
└── themes/               # 主题文件</pre>
        </div>
      </section>

      <!-- Browse CTA -->
      <section class="glass-card p-8 glow-border text-center">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">浏览更多包</h2>
        <p class="text-surface-300 mb-6">
          访问 pi.dev/packages 查看完整的包目录
        </p>
        <a href="https://pi.dev/packages" target="_blank" rel="noopener noreferrer" class="btn-primary">
          浏览包目录
        </a>
      </section>
    </div>
  </div>
</template>
