<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const checkCode = `tmux -V`

const confCode = `set -g extended-keys on
set -g extended-keys-format csi-u`

const restartCode = `tmux kill-server
tmux`

const oldConf = `set -g extended-keys on`

const issues = [
  { issue: '启动时编辑器出现 c0c/0c0c/0c0c 之类的文本（tmux#4749）', affects: 'tmux 3.6', remedy: '升级 tmux；改变 Pi 主题没有帮助。' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">在 tmux 中运行 Pi</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 可以在 tmux 内工作，但 tmux 可能把 <code class="text-brand-400">Shift+Enter</code>、
          <code class="text-brand-400">Ctrl+Enter</code> 和普通 <code class="text-brand-400">Enter</code>
          上报为同一个键。启用扩展键后 Pi 才能区分它们。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">检查 tmux 版本</h2>
        <CodeBlock :code="checkCode" language="bash" />
        <p class="text-surface-300 text-sm mt-3">
          tmux 3.5 及更新版本使用下面推荐的 CSI-u 配置；tmux 3.2 到 3.4 使用旧版配置。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">tmux 3.5 及更新版本</h2>
        <p class="text-surface-300 text-sm mb-3">在 <code class="text-brand-400">~/.tmux.conf</code> 中加入：</p>
        <CodeBlock :code="confCode" language="tmux" />
        <p class="text-surface-300 text-sm mt-4">
          当终端不直接提供 Kitty 键盘协议时，Pi 会请求扩展键上报。CSI-u 是把修改键可靠转发穿过 tmux 的最稳格式。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">重启 tmux</h2>
        <p class="text-surface-300 text-sm mb-3">
          配置作用于 tmux 服务器。要确保生效，请关闭所有 tmux 会话并启动新的服务器。若选择从命令行停止服务器，
          请先保存工作——该命令会终止该服务器管理的全部会话：
        </p>
        <CodeBlock :code="restartCode" language="bash" />
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">验证修改键</h2>
        <p class="text-surface-300 text-sm mb-2">在新的 tmux 会话中启动 Pi，确认：</p>
        <ol class="space-y-2 text-surface-300 text-sm list-decimal list-inside">
          <li><code class="text-brand-400">Shift+Enter</code> 在编辑器中插入换行。</li>
          <li><code class="text-brand-400">Enter</code> 提交提示。</li>
          <li><code class="text-brand-400">Alt+Enter</code> 在 macOS 与 Linux 上排队后续消息；Windows 与 WSL 默认用 <code class="text-brand-400">Ctrl+Q</code>。</li>
        </ol>
        <p class="text-surface-400 text-sm mt-3">
          若这些键仍表现得像普通 <code class="text-brand-400">Enter</code>，请确认 tmux 之外的终端能上报修改键，
          参见 <router-link to="/terminal-setup" class="text-brand-400 hover:text-brand-300">配置终端</router-link>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">tmux 3.2 到 3.4</h2>
        <p class="text-surface-300 text-sm mb-3">这些版本支持扩展键但不支持 CSI-u，只加入：</p>
        <CodeBlock :code="oldConf" language="tmux" />
        <p class="text-surface-300 text-sm mt-4">
          Pi 支持这些版本使用的 xterm <code class="text-brand-400">modifyOtherKeys</code> 格式。重启 tmux 并重复验证步骤。
          更旧的版本请升级 tmux，或在 tmux 之外使用 Pi，而不要依赖修改后的 Enter 快捷键。
        </p>
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">已知问题</h2>
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
                <td class="py-3 px-4 text-surface-300">{{ i.affects }}</td>
                <td class="py-3 px-4 text-surface-400">{{ i.remedy }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
