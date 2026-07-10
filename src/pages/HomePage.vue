<script setup lang="ts">
import { ref } from 'vue'
import CodeBlock from '../components/CodeBlock.vue'

const installTab = ref<'npm' | 'curl' | 'pnpm' | 'bun'>('npm')

const installCommands = {
  npm: 'npm install -g --ignore-scripts @earendil-works/pi-coding-agent',
  curl: 'curl -fsSL https://pi.dev/install.sh | sh',
  pnpm: 'pnpm add -g --ignore-scripts @earendil-works/pi-coding-agent',
  bun: 'bun add -g --ignore-scripts @earendil-works/pi-coding-agent',
}

const features = [
  {
    icon: '⚡',
    title: '极简核心',
    description: 'Pi 保持核心精简，没有内置的子 Agent、计划模式或权限弹窗。用扩展构建你需要的功能。'
  },
  {
    icon: '🔧',
    title: 'TypeScript 扩展',
    description: '通过 TypeScript 模块扩展 Pi：自定义工具、命令、事件拦截、自定义 UI 组件。'
  },
  {
    icon: '🎨',
    title: '深度定制',
    description: '扩展、技能、提示模板、主题、Pi 包——按你的方式塑造 Pi。'
  },
  {
    icon: '🌐',
    title: '15+ 提供商',
    description: 'Anthropic、OpenAI、Google、Azure、Bedrock、Mistral、Groq 等。API Key 或 OAuth 认证。'
  },
  {
    icon: '🌳',
    title: '树状会话',
    description: '会话以树形结构存储，可回溯到任意节点继续。支持导出 HTML 和分享。'
  },
  {
    icon: '🧩',
    title: '上下文工程',
    description: '最小系统提示、AGENTS.md、压缩、技能、提示模板、动态上下文注入。'
  },
]

const providers = [
  { name: 'Anthropic', color: '#d97706' },
  { name: 'OpenAI', color: '#10b981' },
  { name: 'Google', color: '#3b82f6' },
  { name: 'Azure', color: '#0ea5e9' },
  { name: 'Mistral', color: '#f97316' },
  { name: 'Groq', color: '#ef4444' },
  { name: 'xAI', color: '#8b5cf6' },
  { name: 'DeepSeek', color: '#06b6d4' },
]

const demoCode = `$ pi
> Summarize this repository

Reading project structure...
Analyzing 247 files across 18 directories

This is a TypeScript monorepo with:
- 3 packages: ai, agent-core, coding-agent
- Test coverage: 87%
- Last deploy: 2 hours ago

Run checks with: npm run check`
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-20 sm:py-32">
      <!-- Background effects -->
      <div class="absolute inset-0 bg-mesh"></div>
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-4xl mx-auto">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
            <span class="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            <span class="text-brand-300 text-sm font-medium">v2.0 现已发布</span>
          </div>

          <!-- Title -->
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6">
            <span class="text-surface-50">有许多 Agent 框架</span>
            <br />
            <span class="text-gradient">但这个属于你</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-xl sm:text-2xl text-surface-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Pi 是一个极简终端编码 Agent 框架。
            <br class="hidden sm:block" />
            让你的工作流适应 Pi，而非相反。
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <router-link to="/quickstart" class="btn-primary text-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              快速开始
            </router-link>
            <router-link to="/docs" class="btn-secondary text-lg">
              阅读文档
            </router-link>
          </div>

          <!-- Install Command -->
          <div class="max-w-2xl mx-auto">
            <div class="glass-card glow-border overflow-hidden">
              <!-- Tabs -->
              <div class="flex border-b border-surface-700/50">
                <button
                  v-for="tab in (['npm', 'curl', 'pnpm', 'bun'] as const)"
                  :key="tab"
                  class="px-4 py-2.5 text-sm font-medium transition-colors"
                  :class="installTab === tab ? 'text-brand-400 border-b-2 border-brand-400 bg-brand-400/5' : 'text-surface-400 hover:text-surface-200'"
                  @click="installTab = tab"
                >
                  {{ tab }}
                </button>
              </div>
              <!-- Command -->
              <div class="p-4 flex items-center justify-between gap-4">
                <code class="text-surface-100 font-mono text-sm sm:text-base">
                  $ {{ installCommands[installTab] }}
                </code>
                <button
                  class="shrink-0 p-2 text-surface-400 hover:text-brand-400 hover:bg-brand-400/10 rounded-lg transition-colors"
                  @click="navigator.clipboard.writeText(installCommands[installTab])"
                  title="复制命令"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Terminal Demo -->
    <section class="py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <div class="glass-card overflow-hidden glow-border">
            <!-- Terminal header -->
            <div class="flex items-center gap-2 px-4 py-3 border-b border-surface-700/50 bg-surface-900/50">
              <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span class="ml-3 text-surface-400 text-sm font-mono">Pi Terminal</span>
            </div>
            <!-- Terminal content -->
            <pre class="p-6 text-sm leading-relaxed overflow-x-auto"><code class="text-surface-200 font-mono">{{ demoCode }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="section-title mb-4">为什么选择 Pi？</h2>
          <p class="section-subtitle mx-auto">
            Pi 不是封闭的产品。如果你需要某个命令、工具、提供商、工作流或 UI 调整，直接让 Pi 来构建它。
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="glass-card p-6 hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="text-3xl mb-4">{{ feature.icon }}</div>
            <h3 class="text-lg font-semibold text-surface-50 mb-2">{{ feature.title }}</h3>
            <p class="text-surface-400 text-sm leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Providers Section -->
    <section class="py-16 sm:py-24 bg-surface-900/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="section-title mb-4">15+ 提供商，数百个模型</h2>
          <p class="section-subtitle mx-auto">
            通过 API Key 或 OAuth 认证。使用 /model 或 Ctrl+L 在会话中切换模型。
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-4">
          <div
            v-for="provider in providers"
            :key="provider.name"
            class="px-6 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-200 font-medium hover:border-brand-500/30 transition-colors"
            :style="{ borderLeftColor: provider.color, borderLeftWidth: '3px' }"
          >
            {{ provider.name }}
          </div>
        </div>

        <div class="text-center mt-8">
          <router-link to="/providers" class="text-brand-400 hover:text-brand-300 font-medium">
            查看所有提供商 →
          </router-link>
        </div>
      </div>
    </section>

    <!-- Four Modes -->
    <section class="py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="section-title mb-4">四种使用模式</h2>
          <p class="section-subtitle mx-auto">
            从交互式 TUI 到程序化 SDK，Pi 适应你的工作方式。
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass-card p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-surface-50 mb-2">交互式</h3>
            <p class="text-surface-400 text-sm">完整的 TUI 体验</p>
          </div>

          <div class="glass-card p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-surface-50 mb-2">Print/JSON</h3>
            <p class="text-surface-400 text-sm">pi -p "query" 用于脚本</p>
          </div>

          <div class="glass-card p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </div>
            <h3 class="font-semibold text-surface-50 mb-2">RPC</h3>
            <p class="text-surface-400 text-sm">stdin/stdout JSONL 协议</p>
          </div>

          <div class="glass-card p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <h3 class="font-semibold text-surface-50 mb-2">SDK</h3>
            <p class="text-surface-400 text-sm">嵌入到你的应用中</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 sm:py-24">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="glass-card p-12 glow-border">
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-surface-50 mb-4">
            开始你的 Pi 之旅
          </h2>
          <p class="text-surface-300 text-lg mb-8 max-w-2xl mx-auto">
            一条命令安装，一分钟上手。让 Pi 适应你的工作流。
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <router-link to="/quickstart" class="btn-primary text-lg">
              立即开始
            </router-link>
            <a href="https://github.com/earendil-works/pi" target="_blank" rel="noopener noreferrer" class="btn-secondary text-lg">
              查看源码
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
