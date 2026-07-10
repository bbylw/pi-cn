<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const settingsLocations = [
  { path: '~/.pi/agent/settings.json', scope: '全局（所有项目）' },
  { path: '.pi/settings.json', scope: '项目（当前目录）' },
]

const modelSettings = [
  { setting: 'defaultProvider', type: 'string', desc: '默认提供商（如 "anthropic"、"openai"）' },
  { setting: 'defaultModel', type: 'string', desc: '默认模型 ID' },
  { setting: 'defaultThinkingLevel', type: 'string', desc: '"off"、"minimal"、"low"、"medium"、"high"、"xhigh"、"max"' },
  { setting: 'hideThinkingBlock', type: 'boolean', default: 'false', desc: '在输出中隐藏思考块' },
]

const uiSettings = [
  { setting: 'theme', type: 'string', default: '"dark"', desc: '主题名称（"dark"、"light" 或自定义）' },
  { setting: 'externalEditor', type: 'string', desc: 'Ctrl+G 外部编辑器命令' },
  { setting: 'quietStartup', type: 'boolean', default: 'false', desc: '隐藏启动标题' },
  { setting: 'defaultProjectTrust', type: 'string', default: '"ask"', desc: '回退项目信任行为' },
  { setting: 'treeFilterMode', type: 'string', default: '"default"', desc: '/tree 的默认过滤器' },
]

const compactionSettings = [
  { setting: 'reserveTokens', type: 'number', default: '16384', desc: '保留给 LLM 响应的 token 数' },
  { setting: 'keepRecentTokens', type: 'number', default: '20000', desc: '压缩时保留的最近 token 数' },
  { setting: 'branchSummaryEnabled', type: 'boolean', default: 'true', desc: '启用分支摘要' },
]

const exampleSettings = `{
  "defaultProvider": "anthropic",
  "defaultModel": "claude-sonnet-4-5",
  "defaultThinkingLevel": "medium",
  "theme": "dark",
  "defaultProjectTrust": "ask",
  "reserveTokens": 16384,
  "keepRecentTokens": 20000,
  "externalEditor": "code --wait"
}`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">设置</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 使用 JSON 设置文件，项目设置覆盖全局设置。
        </p>
      </div>

      <!-- Settings Locations -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">设置文件位置</h2>
        <div class="space-y-3">
          <div v-for="loc in settingsLocations" :key="loc.path" class="glass-card p-4 flex items-center justify-between">
            <code class="text-brand-400 text-sm">{{ loc.path }}</code>
            <span class="text-surface-400 text-sm">{{ loc.scope }}</span>
          </div>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          直接编辑或使用 <code class="text-brand-400">/settings</code> 进行常见选项配置。
        </p>
      </section>

      <!-- Model & Thinking -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">模型与思考</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">设置</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">类型</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">默认值</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in modelSettings" :key="s.setting" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ s.setting }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ s.type }}</td>
                <td class="py-3 px-4 text-surface-400">{{ s.default || '-' }}</td>
                <td class="py-3 px-4 text-surface-300">{{ s.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- UI & Display -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">UI 与显示</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">设置</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">类型</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">默认值</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in uiSettings" :key="s.setting" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ s.setting }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ s.type }}</td>
                <td class="py-3 px-4 text-surface-400">{{ s.default || '-' }}</td>
                <td class="py-3 px-4 text-surface-300">{{ s.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Compaction -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">压缩</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">设置</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">类型</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">默认值</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in compactionSettings" :key="s.setting" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ s.setting }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ s.type }}</td>
                <td class="py-3 px-4 text-surface-400">{{ s.default || '-' }}</td>
                <td class="py-3 px-4 text-surface-300">{{ s.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Example -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">示例配置</h2>
        <CodeBlock :code="exampleSettings" language="json" filename="~/.pi/agent/settings.json" />
      </section>

      <!-- Project Overrides -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">项目覆盖</h2>
        <p class="text-surface-300">
          项目设置文件 <code class="text-brand-400">.pi/settings.json</code> 可以覆盖任何全局设置。
          这对于为特定项目配置不同的默认模型或主题很有用。
        </p>
      </section>
    </div>
  </div>
</template>
