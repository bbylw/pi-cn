<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const trustFlow = `# 项目信任流程
1. 启动 Pi 时检测项目资源
2. 根据 defaultProjectTrust 设置决定行为
3. 保存决策到 ~/.pi/agent/trust.json`

const containerOptions = [
  { name: 'Gondolin', desc: '本地 Linux 微型虚拟机，工具路由到 VM' },
  { name: 'Docker', desc: '整个 Pi 进程在容器中运行' },
  { name: 'OpenShell', desc: '策略控制的沙箱环境' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">安全</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 是一个本地编码 Agent，以启动它的用户权限运行。了解如何安全地使用 Pi。
        </p>
      </div>

      <!-- Project Trust -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">项目信任</h2>
        <p class="text-surface-300 mb-4">
          项目信任控制 Pi 是否加载项目本地设置、资源、包和扩展。它不是沙箱，不会限制模型在工作目录中的操作。
        </p>
        
        <div class="glass-card p-6 mb-6">
          <h3 class="text-lg font-semibold text-surface-100 mb-3">Pi 认为需要信任的项目资源</h3>
          <ul class="space-y-2 text-surface-300">
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <code class="text-brand-400">.pi/settings.json</code>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <code class="text-brand-400">.pi/extensions</code>、<code class="text-brand-400">.pi/skills</code>、<code class="text-brand-400">.pi/prompts</code>、<code class="text-brand-400">.pi/themes</code>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <code class="text-brand-400">.pi/SYSTEM.md</code> 或 <code class="text-brand-400">.pi/APPEND_SYSTEM.md</code>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              项目 <code class="text-brand-400">.agents/skills</code>
            </li>
          </ul>
        </div>

        <CodeBlock :code="trustFlow" language="bash" filename="信任流程" />

        <div class="mt-4 glass-card p-4">
          <h4 class="font-semibold text-surface-100 mb-2">defaultProjectTrust 设置</h4>
          <ul class="space-y-2 text-surface-300 text-sm">
            <li><code class="text-brand-400">"ask"</code>（默认）— 有 UI 时询问是否信任项目</li>
            <li><code class="text-brand-400">"always"</code> — 始终信任项目资源</li>
            <li><code class="text-brand-400">"never"</code> — 忽略项目资源</li>
          </ul>
        </div>
      </section>

      <!-- No Built-in Sandbox -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">无内置沙箱</h2>
        <div class="glass-card p-6">
          <p class="text-surface-300 mb-4">
            Pi 不包含内置沙箱。内置工具可以读取文件、写入文件、编辑文件，并以 Pi 进程的权限运行 shell 命令。扩展是以相同权限运行的 TypeScript 模块。
          </p>
          <p class="text-surface-300">
            这是有意为之。Pi 设计用于在本地源码树上操作，调用项目工具链，并与用户现有的开发环境集成。真正的隔离需要来自操作系统或虚拟化/容器边界。
          </p>
        </div>
      </section>

      <!-- Running Untrusted Work -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">运行不受信任的工作</h2>
        <p class="text-surface-300 mb-4">
          对于不受信任的仓库、你不打算密切监控的生成的代码，或无人值守的自动化，请在隔离环境中运行 Pi。
        </p>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="opt in containerOptions" :key="opt.name" class="glass-card p-4">
            <h4 class="font-semibold text-surface-100 mb-1">{{ opt.name }}</h4>
            <p class="text-surface-400 text-sm">{{ opt.desc }}</p>
          </div>
        </div>

        <div class="mt-6 glass-card p-6">
          <h3 class="text-lg font-semibold text-surface-100 mb-3">常见隔离模式</h3>
          <ul class="space-y-2 text-surface-300">
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span>将整个 <code class="text-brand-400">pi</code> 进程运行在容器/沙箱中</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span>在主机上运行 Pi，同时将内置工具执行路由到 Gondolin 微型 VM</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span>仅挂载 Agent 应该访问的工作区路径</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span>传递最低所需 API Key 或使用短期凭证</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span>在任务不需要时限制网络访问</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span>在将结果复制回受信任系统之前审查差异和输出</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Reporting Security Issues -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">报告安全问题</h2>
        <p class="text-surface-300">
          要报告安全问题，请遵循仓库的 <a href="https://github.com/earendil-works/pi-mono/blob/main/SECURITY.md" target="_blank" class="text-brand-400 hover:text-brand-300">安全政策</a>。
          不要为敏感的安全报告创建公开 issue。
        </p>
      </section>
    </div>
  </div>
</template>
