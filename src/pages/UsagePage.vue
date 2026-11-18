<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const shellCode = `!git status`

const steering = [
  { want: '调整当前任务', action: '输入消息并按 Enter' },
  { want: '在当前任务之后追加工作', action: '输入消息并按 Alt+Enter' },
  { want: '把排队消息放回编辑器', action: '按 Alt+Up' },
  { want: '停止当前任务', action: '按 Escape' },
]

const exportCode = `/export      # 导出为 HTML 或 JSONL
/share       # 上传会话并获取查看链接`

const diagnostics = `/debug   # 把渲染行与当前会话消息写入 pi-debug.log`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">在终端中使用 Pi</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          在你想工作的文件夹中运行 <code class="text-brand-400">pi</code>。Pi 用这个文件夹发现文件、指令和配置，并归组保存的会话。
          如果还没有安装或选择模型，请先阅读 <router-link to="/quickstart" class="text-brand-400 hover:text-brand-300">快速开始</router-link>。
        </p>
      </div>

      <section class="mb-8 glass-card p-5">
        <p class="text-surface-300 text-sm">
          转录区显示你的提示、Pi 的响应、工具调用、结果和错误。你在编辑器中编写提示和命令。
          页脚显示当前文件夹、会话、模型、上下文用量，以及累计用量和成本。
        </p>
      </section>

      <!-- Enter a prompt -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">输入提示</h2>
        <p class="text-surface-300 mb-3">
          输入请求并按 <code class="text-brand-400">Enter</code> 发送。<code class="text-brand-400">Shift+Enter</code> 换行，
          <code class="text-brand-400">Ctrl+G</code> 在你配置的外部编辑器中编写更长的提示。
        </p>
        <p class="text-surface-300 mb-2">要在提示中加入文件或图片：</p>
        <ul class="space-y-2 text-surface-300 text-sm">
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>输入 <code class="text-brand-400">@</code> 搜索文件并加入提示。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>按 <code class="text-brand-400">Tab</code> 补全路径。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>在支持的终端中粘贴图片或拖入图片。</span></li>
        </ul>
      </section>

      <!-- Follow work -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">跟进 Pi 的工作</h2>
        <p class="text-surface-300 mb-3">
          Pi 工作时会显示每次工具调用和结果。<code class="text-brand-400">Ctrl+O</code> 展开或折叠工具输出，
          <code class="text-brand-400">Ctrl+T</code> 显示或隐藏思考块。
        </p>
        <p class="text-surface-300 mb-3">
          启动标题列出 Pi 加载的指令和资源；编辑器边框表示当前思考级别；页脚随模型使用上下文和上报用量而更新。
        </p>
        <p class="text-surface-400 text-sm">
          Pi 不会在每次工具调用前询问。请检查命令和被修改的文件，对不可信或无人值守的工作使用沙箱，参见
          <router-link to="/security" class="text-brand-400 hover:text-brand-300">安全</router-link>。
        </p>
      </section>

      <!-- Change direction -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">改变方向</h2>
        <p class="text-surface-300 mb-3">Pi 工作时你仍然可以发送输入：</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">你的目标</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in steering" :key="s.want" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ s.want }}</td>
                <td class="py-3 px-4 text-surface-300">{{ s.action }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          用 Enter 发送的消息会等当前响应及其工具调用完成后进入，用于指导下一次响应；用 Alt+Enter 发送的后续消息会等 Pi
          完成当前任务。中止会把排队的消息放回编辑器。Windows Terminal 保留了一些 Alt 快捷键，
          替代方案见终端的平台配置。
        </p>
      </section>

      <!-- Change model or settings -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">修改模型或设置</h2>
        <p class="text-surface-300 mb-3">输入 <code class="text-brand-400">/</code> 搜索可用命令。最常用的命令：</p>
        <ul class="space-y-2 text-surface-300 text-sm">
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span><code class="text-brand-400">/model</code> 选择模型，<code class="text-brand-400">Ctrl+L</code> 打开同一个选择器。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span><code class="text-brand-400">/thinking</code> 选择当前模型使用的推理量，<code class="text-brand-400">Shift+Tab</code> 循环支持的级别。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span><code class="text-brand-400">/login</code> 和 <code class="text-brand-400">/logout</code> 管理提供商访问。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span><code class="text-brand-400">/settings</code> 修改常见偏好。</span></li>
        </ul>
        <p class="text-surface-400 text-sm mt-3">
          提示模板、技能和扩展可以向同一个菜单添加命令。完整清单见
          <router-link to="/slash-commands" class="text-brand-400 hover:text-brand-300">斜杠命令</router-link>。
        </p>
      </section>

      <!-- Continue or start over -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">继续或重新开始</h2>
        <p class="text-surface-300 mb-3">
          Pi 会自动保存会话，除非禁用了会话持久化。<code class="text-brand-400">/new</code> 开始新会话，
          <code class="text-brand-400">/resume</code> 打开其他已保存会话，<code class="text-brand-400">/name</code> 给会话起名，
          <code class="text-brand-400">/session</code> 显示会话文件、ID、消息数、token 用量和成本。
        </p>
        <p class="text-surface-300">
          想在不丢失现有工作的情况下探索另一种方案时，使用 <code class="text-brand-400">/tree</code>、<code class="text-brand-400">/fork</code>
          或 <code class="text-brand-400">/clone</code>。用 <code class="text-brand-400">/compact</code> 减少发送给模型的对话历史，
          详见 <router-link to="/sessions" class="text-brand-400 hover:text-brand-300">会话管理</router-link>。
          离开 Pi 后，在同一文件夹运行 <code class="text-brand-400">pi --continue</code> 可恢复最近的会话。
        </p>
      </section>

      <!-- Run a terminal command -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">运行终端命令</h2>
        <p class="text-surface-300 mb-3">在命令前加 <code class="text-brand-400">!</code> 运行它，并把输出加入对话：</p>
        <CodeBlock :code="shellCode" language="text" />
        <p class="text-surface-400 text-sm mt-2">
          使用 <code class="text-brand-400">!!</code> 可以在不把输出发给模型的情况下运行命令。
        </p>
      </section>

      <!-- Copy, export, share -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">复制、导出或分享结果</h2>
        <p class="text-surface-300 mb-3">
          按 <code class="text-brand-400">Ctrl+X</code> 或运行 <code class="text-brand-400">/copy</code> 复制最后一条 assistant 响应。
        </p>
        <CodeBlock :code="exportCode" language="text" />
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">/share</code> 上传会话并返回查看链接。默认情况下，Radius 认证会让产物对你所在的 Radius
          组织可见；否则 Pi 通过 GitHub CLI 创建私有 gist。<code class="text-brand-400">sessionShareDestination</code> 设置可以强制指定目标。
          分享前请检查会话，它可能包含提示、工具输出、文件内容以及对话中暴露的凭证。
        </p>
      </section>

      <!-- Adjust terminal -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">调整终端</h2>
        <p class="text-surface-300 mb-3">
          全屏模式（默认）保持编辑器和状态区固定，转录区在终端窗口内滚动；常规模式使用终端自身的回滚缓冲。
          通过 <code class="text-brand-400">/settings</code> 或 <code class="text-brand-400">--tui-mode</code> 选择模式。
        </p>
        <p class="text-surface-300">
          终端对鼠标输入、快捷键和内联图片的支持各不相同。运行 <code class="text-brand-400">/hotkeys</code> 查看当前会话生效的快捷键，
          完整清单见 <router-link to="/slash-commands" class="text-brand-400 hover:text-brand-300">斜杠命令</router-link> 与设置页。
        </p>
      </section>

      <!-- Diagnostics -->
      <section class="mb-12 glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">收集诊断信息</h2>
        <CodeBlock :code="diagnostics" language="text" />
        <p class="text-surface-400 text-sm mt-2">
          Pi 把渲染出的终端行和当前会话消息写入 agent 目录中的 <code class="text-brand-400">pi-debug.log</code>。
          分享前请先检查该文件，它可能包含提示、模型响应、工具输出、文件内容和终端数据。
        </p>
      </section>
    </div>
  </div>
</template>
