<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const shellTable = [
  { source: '模型调用内置 bash 工具', shell: 'Pi 解析出的 Bash 可执行文件' },
  { source: '你输入 !command 或 !!command', shell: '同一个解析出的 Bash 可执行文件' },
  { source: '模型调用可选的 powershell 工具', shell: 'PowerShell 7（pwsh.exe）或 Windows PowerShell' },
  { source: '扩展提供或替换 shell 工具', shell: '该扩展实现的操作' },
]

const pathCode = `{
  "shellPath": "~/.local/bin/bash"
}`

const prefixCode = `{
  "shellCommandPrefix": "export CI=1"
}`

const aliasFile = `alias ll='ls -la'
alias gs='git status --short'`

const aliasConfig = `{
  "shellCommandPrefix": "shopt -s expand_aliases\\nsource ~/.bash_aliases"
}`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">配置 shell 命令</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 为每条 Bash 命令启动一个独立的非交互 shell。非交互 Bash 默认不展开别名，通常也不会加载与交互终端相同的启动文件。
          用 <code class="text-brand-400">shellPath</code> 选择 Bash 可执行文件，用
          <code class="text-brand-400">shellCommandPrefix</code> 在每条命令前执行初始化。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">Pi 使用哪个 shell</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">命令来源</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">Shell</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in shellTable" :key="s.source" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ s.source }}</td>
                <td class="py-3 px-4 text-surface-300">{{ s.shell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          Pi 通常以 <code class="text-brand-400">bash -c</code> 调用 Bash。在 Unix 上依次使用
          <code class="text-brand-400">/bin/bash</code>、<code class="text-brand-400">PATH</code> 中的
          <code class="text-brand-400">bash</code>，最后在 Bash 不可用时退回 <code class="text-brand-400">sh</code>。
          原生 Windows 先检查配置路径，再找 Git Bash，最后找 <code class="text-brand-400">PATH</code> 中的
          <code class="text-brand-400">bash.exe</code>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择 Bash 可执行文件</h2>
        <p class="text-surface-300 text-sm mb-3">
          需要指定可执行文件时，在 <code class="text-brand-400">~/.pi/agent/settings.json</code> 中设置：
        </p>
        <CodeBlock :code="pathCode" language="json" />
        <p class="text-surface-300 text-sm mt-4">Windows 上使用正斜杠或转义反斜杠：</p>
        <CodeBlock code='{ "shellPath": "C:\\\\cygwin64\\\\bin\\\\bash.exe" }' language="json" />
        <p class="text-surface-400 text-sm mt-3">修改后运行 <code class="text-brand-400">/reload</code>。</p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">在每条命令前执行初始化</h2>
        <p class="text-surface-300 text-sm mb-3">
          <code class="text-brand-400">shellCommandPrefix</code> 会同时作用于内置 <code class="text-brand-400">bash</code> 工具
          和你输入的 <code class="text-brand-400">!</code>、<code class="text-brand-400">!!</code> 命令：
        </p>
        <CodeBlock :code="prefixCode" language="json" />
        <p class="text-surface-300 text-sm mt-4">
          Pi 用换行连接前缀与请求的命令。前缀对每条命令都会重新执行，因此要保持快速且不含交互提示。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">启用 Bash 别名</h2>
        <p class="text-surface-300 text-sm mb-3">
          把 Pi 需要的别名放在 Bash 兼容文件中，而不是解析整个交互式 shell 配置。创建
          <code class="text-brand-400">~/.bash_aliases</code>：
        </p>
        <CodeBlock :code="aliasFile" language="bash" />
        <p class="text-surface-300 text-sm mt-4 mb-3">再配置 Pi 启用别名展开并加载该文件：</p>
        <CodeBlock :code="aliasConfig" language="json" />
        <p class="text-surface-300 text-sm mt-4">
          运行 <code class="text-brand-400">/reload</code>，然后在 Pi 中验证别名：
        </p>
        <CodeBlock code="!ll" language="text" />
        <p class="text-surface-300 text-sm mt-4">
          输出应与 <code class="text-brand-400">ls -la</code> 相同。别名必须使用 Bash 兼容语法；
          不要把任意 <code class="text-brand-400">.zshrc</code> 引入 Bash，因为 zsh 的选项、函数与插件可能无法正确解析或运行。
        </p>
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">故障排查</h2>
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="text-surface-100 font-medium">前缀对 ! 生效，但对扩展工具无效</dt>
            <dd class="text-surface-400 mt-1"><code class="text-brand-400">shellCommandPrefix</code> 只配置 Pi 内置的 Bash 执行。替换 bash 工具或自带 shell 操作的扩展自行控制初始化，请查阅该扩展文档。</dd>
          </div>
          <div>
            <dt class="text-surface-100 font-medium">找不到 shopt</dt>
            <dd class="text-surface-400 mt-1">Pi 退回了 <code class="text-brand-400">sh</code>，或 <code class="text-brand-400">shellPath</code> 指向非 Bash shell。安装 Bash 或把 <code class="text-brand-400">shellPath</code> 指到 Bash 可执行文件。</dd>
          </div>
          <div>
            <dt class="text-surface-100 font-medium">某条初始化命令在等待输入</dt>
            <dd class="text-surface-400 mt-1">从 <code class="text-brand-400">shellCommandPrefix</code> 中移除交互式命令。前缀会在每条 Bash 命令前的非交互进程中运行。</dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>
