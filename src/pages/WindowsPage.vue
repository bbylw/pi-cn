<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const verifyCode = `!printf 'Bash is working\\n'`

const powershellSetting = `{
  "defaultTools": ["read", "powershell", "edit", "write"]
}`

const shellPath = `{
  "shellPath": "C:\\\\cygwin64\\\\bin\\\\bash.exe"
}`

const environments = [
  { env: '原生 Windows + Git Bash', cmd: '内置 bash 工具与 ! 命令使用 Git Bash', when: '文件与开发工具主要位于 Windows。' },
  { env: '原生 Windows + powershell 工具', cmd: '模型工具调用使用 PowerShell；! 命令仍可用 Bash', when: '任务依赖 PowerShell 模块或 Windows 原生命令。' },
  { env: 'WSL', cmd: '所选 WSL 发行版中的 Linux Bash 与工具', when: '文件与工具链已在 Linux 或 WSL 中。' },
]

const resolution = [
  '1. ~/.pi/agent/settings.json 中的 shellPath',
  '2. %ProgramFiles%\\Git\\bin\\bash.exe 处的 Git Bash',
  '3. %ProgramFiles(x86)%\\Git\\bin\\bash.exe 处的 Git Bash',
  '4. PATH 中的 bash.exe，包括 Cygwin、MSYS2 或旧版 WSL Bash',
]

const psDiscovery = [
  '1. PATH 中的 pwsh.exe',
  '2. %ProgramFiles%\\PowerShell\\7\\pwsh.exe',
  '3. PATH 中的 powershell.exe',
  '4. %SystemRoot%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
]

const terminals = [
  { term: 'Windows Terminal', conhost: '自带，较新', status: '推荐' },
  { term: 'VS Code、Tabby、WezTerm nightly', conhost: '自带，较新', status: '可用' },
  { term: 'Alacritty', conhost: '内置，除非 alacritty.exe 旁有 Windows Terminal 的 conpty.dll 与 OpenConsole.exe', status: '需要这些文件' },
  { term: 'WezTerm 20240203 及更早', conhost: '自带，较旧', status: '有已知问题' },
  { term: '经典控制台（cmd.exe 或非 Windows Terminal 的 PowerShell）、mintty（Git Bash）、ConEmu、Cmder、Hyper、Windows OpenSSH', conhost: '内置', status: '有已知问题' },
]

const issues = [
  { issue: '从全屏切到普通模式，或在全屏按 Ctrl+G 导致会话崩溃（#9186）', affects: '内置 conhost', remedy: '使用自带较新 conhost 的终端，或用 --tui-mode regular 启动 Pi' },
  { issue: '提示区出现 ;0;rgb:0000/0000/0000 之类的文本，BEL 打开外部编辑器（#10256）', affects: '内置 conhost 位于其他终端之后：mintty、Windows OpenSSH', remedy: '使用自带较新 conhost 的终端' },
  { issue: '提示区出现 79 或 55 之类的碎片（#10717）', affects: 'WezTerm 20240203', remedy: '使用 WezTerm nightly' },
  { issue: '普通模式下每次按键都在新行重绘输入行（#6300）', affects: '内置 conhost、经典控制台', remedy: '使用全屏模式（默认），或自带较新 conhost 的终端' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">在 Windows 上运行 Pi</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 可以作为原生 Windows 进程运行，也可以运行在 Windows Subsystem for Linux（WSL）中。原生 Windows 默认用
          Git Bash 执行 Bash 命令，并可选择让模型使用 PowerShell；WSL 中的 Pi 使用 Linux 环境与其中的 Bash。
          安装与认证请先按<router-link to="/quickstart" class="text-brand-400 hover:text-brand-300">快速开始</router-link>完成，
          本页用于选择和配置命令环境。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择原生 Windows 还是 WSL</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">环境</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">命令环境</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">适用场景</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in environments" :key="e.env" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ e.env }}</td>
                <td class="py-3 px-4 text-surface-300">{{ e.cmd }}</td>
                <td class="py-3 px-4 text-surface-400">{{ e.when }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">在原生 Windows 上使用 Git Bash</h2>
        <p class="text-surface-300 text-sm mb-3">
          对大多数原生 Windows 用户，安装 <a href="https://git-scm.com/download/win" target="_blank" rel="noopener noreferrer" class="text-brand-400 hover:text-brand-300">Git for Windows</a>
          就足够了。Pi 按以下顺序解析 Bash：
        </p>
        <ul class="space-y-1.5 text-surface-300 text-sm font-mono">
          <li v-for="r in resolution" :key="r">{{ r }}</li>
        </ul>
        <p class="text-surface-300 text-sm mt-4 mb-3">启动 Pi 并输入以下命令验证 shell：</p>
        <CodeBlock :code="verifyCode" language="text" />
        <p class="text-surface-400 text-sm mt-3">
          如果 Pi 找不到 Bash，会报告检查过的位置。安装 Git for Windows、把其他 Bash 可执行文件放入 PATH，
          或配置 <code class="text-brand-400">shellPath</code>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">让模型使用 PowerShell</h2>
        <p class="text-surface-300 text-sm mb-3">
          可选的 <code class="text-brand-400">powershell</code> 工具优先通过 <code class="text-brand-400">pwsh.exe</code>
          运行命令，再退回 Windows PowerShell。它用
          <code class="text-brand-400">-NoProfile -NonInteractive -ExecutionPolicy Bypass</code> 启动，
          管理员强制执行的执行策略仍可能优先。
        </p>
        <p class="text-surface-300 text-sm mb-2">PowerShell 的发现顺序：</p>
        <ul class="space-y-1.5 text-surface-300 text-sm font-mono mb-4">
          <li v-for="p in psDiscovery" :key="p">{{ p }}</li>
        </ul>
        <p class="text-surface-300 text-sm mb-3">
          要用 <code class="text-brand-400">powershell</code> 替换面向模型的 <code class="text-brand-400">bash</code> 工具，
          在 <code class="text-brand-400">~/.pi/agent/settings.json</code> 中加入：
        </p>
        <CodeBlock :code="powershellSetting" language="json" />
        <p class="text-surface-300 text-sm mt-3">
          <code class="text-brand-400">["-bash", "+powershell"]</code> 效果相同，并保留你配置的其他默认工具。
          重启 Pi 后让它运行一条无害的 PowerShell 命令。<code class="text-brand-400">!</code> 与
          <code class="text-brand-400">!!</code> 编辑器命令仍使用 Bash；<code class="text-brand-400">powershell</code>
          工具只在 Pi 作为原生 Windows 进程运行时可用。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">WSL</h2>
        <p class="text-surface-300 text-sm">
          Windows 上的 WSL 路径转换与 WSL 中额外的 Git 分支轮询只识别 <code class="text-brand-400">/mnt/&lt;drive&gt;</code>，
          不识别自定义挂载根。从 Windows 使用旧版 WSL <code class="text-brand-400">bash.exe</code> 启动器时，
          Pi 通过 stdin 发送命令，以避免命令行引号问题。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">自定义 Bash 可执行文件</h2>
        <p class="text-surface-300 text-sm mb-3">当 Bash 安装在 Pi 无法自动发现的位置时设置 <code class="text-brand-400">shellPath</code>：</p>
        <CodeBlock :code="shellPath" language="json" />
        <p class="text-surface-400 text-sm mt-3">
          JSON 用反斜杠表示转义序列，写 Windows 路径时每个反斜杠要写两次。
          命令前缀、别名与完整的 shell 解析行为见
          <router-link to="/shell-aliases" class="text-brand-400 hover:text-brand-300">配置 shell 命令</router-link>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择终端</h2>
        <p class="text-surface-300 text-sm mb-3">
          Windows 终端通过控制台宿主（conhost）运行 Pi。部分终端自带较新的副本，另一些使用 Windows 内置的旧版本，
          后者存在影响 Pi 的问题。推荐
          <a href="https://aka.ms/terminal" target="_blank" rel="noopener noreferrer" class="text-brand-400 hover:text-brand-300">Windows Terminal</a>，
          它始终附带较新的 conhost，也是 Pi 测试最充分的终端。
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">终端</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">Conhost</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in terminals" :key="t.term" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ t.term }}</td>
                <td class="py-3 px-4 text-surface-400">{{ t.conhost }}</td>
                <td class="py-3 px-4 text-surface-300">{{ t.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">配置 Windows Terminal</h2>
        <p class="text-surface-300 text-sm">
          Windows Terminal 会保留或改写部分修改键。配置 <code class="text-brand-400">Shift+Enter</code> 与
          <code class="text-brand-400">Alt+Enter</code> 见
          <router-link to="/terminal-setup" class="text-brand-400 hover:text-brand-300">配置终端</router-link>，
          Pi 在 Windows 与 WSL 上的快捷键默认值见
          <router-link to="/keybindings" class="text-brand-400 hover:text-brand-300">键位绑定</router-link>。
        </p>
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">已知问题</h2>
        <p class="text-surface-400 text-sm mb-3">
          这些问题来自 conhost。微软已在源码中修复，但未说明内置 conhost 何时获得修复。
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">问题</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">影响</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">解决</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in issues" :key="i.issue" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ i.issue }}</td>
                <td class="py-3 px-4 text-surface-400">{{ i.affects }}</td>
                <td class="py-3 px-4 text-surface-300">{{ i.remedy }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
