<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const cliRef = `# 基本用法
pi                               # 在当前目录启动
pi -c                            # 继续最近的会话
pi -r                            # 浏览之前的会话
pi -p "query"                    # 非交互模式（一次性）
pi --name "my task"              # 设置会话名称
pi --session <path|id>           # 打开特定会话

# 模式
pi --mode print                  # 打印模式（默认非交互）
pi --mode json                   # JSON 事件流模式
pi --mode rpc                    # RPC 模式（stdin/stdout）

# 扩展
pi -e ./extension.ts             # 加载扩展文件
pi install npm:@foo/pi-tools     # 从 npm 安装包
pi install git:github.com/user/repo  # 从 git 安装`

const slashCommands = `/login              # 登录提供商
/logout             # 登出
/model              # 切换模型
/reload             # 重载扩展和上下文文件
/new                # 新会话
/resume             # 恢复会话
/tree               # 浏览会话树
/fork               # 从当前点分叉
/clone              # 克隆会话
/export             # 导出为 HTML
/share              # 上传到 GitHub Gist
/clear              # 清除当前会话上下文`

const contextFiles = `# AGENTS.md - 项目指令（启动时加载）
# 搜索路径：~/.pi/agent/ → 父目录 → 当前目录

# SYSTEM.md - 替换或追加默认系统提示

# 示例 AGENTS.md：
# - 代码更改后运行 npm run check
# - 不要在生产环境运行迁移
# - 保持回复简洁`

const keybindings = `Enter                # 发送消息（转向）
Alt+Enter            # 排队后续消息
Ctrl+C               # 取消当前生成
Ctrl+D               # 退出
Ctrl+L               # 选择模型
Ctrl+P               # 循环切换模型
Shift+Tab            # 循环思考级别
Ctrl+K               # 搜索文档
@                    # 模糊搜索文件
!command             # 运行 shell 命令
!!command            # 运行命令（不添加到上下文）`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">使用指南</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          了解 Pi 的交互模式、斜杠命令、上下文文件和 CLI 参考。
        </p>
      </div>

      <!-- Interactive Mode -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">交互模式</h2>
        <p class="text-surface-300 mb-4">
          Pi 的交互模式提供完整的终端 UI 体验。启动后，你可以输入请求、使用斜杠命令、引用文件和运行 shell 命令。
        </p>
        <div class="glass-card p-6">
          <h3 class="text-lg font-semibold text-surface-100 mb-3">核心概念</h3>
          <ul class="space-y-2 text-surface-300">
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span><strong class="text-surface-100">转向（Steer）</strong>：在 Agent 运行时按 Enter 发送新消息，中断当前执行</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span><strong class="text-surface-100">后续（Follow-up）</strong>：Alt+Enter 排队消息，等待当前执行完成</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span><strong class="text-surface-100">Shell 命令</strong>：!command 运行命令并将输出发送给模型</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span><strong class="text-surface-100">文件引用</strong>：@ 触发文件模糊搜索</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- CLI Reference -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">CLI 参考</h2>
        <CodeBlock :code="cliRef" language="bash" filename="命令行选项" />
      </section>

      <!-- Slash Commands -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">斜杠命令</h2>
        <CodeBlock :code="slashCommands" language="text" filename="内置命令" />
      </section>

      <!-- Context Files -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">上下文文件</h2>
        <p class="text-surface-300 mb-4">
          Pi 在启动时从多个位置加载上下文文件，让你可以给 Agent 提供项目级和全局指令。
        </p>
        <CodeBlock :code="contextFiles" language="markdown" filename="上下文文件加载顺序" />
        <div class="mt-4 glass-card p-4">
          <h4 class="font-semibold text-surface-100 mb-2">加载优先级</h4>
          <ol class="list-decimal list-inside text-surface-300 text-sm space-y-1">
            <li><code class="text-brand-400">~/.pi/agent/AGENTS.md</code> — 全局指令</li>
            <li>父目录中的 <code class="text-brand-400">AGENTS.md</code> 或 <code class="text-brand-400">CLAUDE.md</code></li>
            <li>当前目录中的 <code class="text-brand-400">AGENTS.md</code> 或 <code class="text-brand-400">CLAUDE.md</code></li>
          </ol>
        </div>
      </section>

      <!-- Keybindings -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">快捷键</h2>
        <CodeBlock :code="keybindings" language="text" filename="默认快捷键" />
      </section>

      <!-- Sessions -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">会话管理</h2>
        <p class="text-surface-300 mb-4">
          Pi 的会话以树形结构存储。你可以回溯到任意先前的消息，从那里继续，所有分支都存在于单个文件中。
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="glass-card p-4">
            <h4 class="font-semibold text-surface-100 mb-2">/tree</h4>
            <p class="text-surface-400 text-sm">浏览会话树，导航到任意先前的节点</p>
          </div>
          <div class="glass-card p-4">
            <h4 class="font-semibold text-surface-100 mb-2">/fork</h4>
            <p class="text-surface-400 text-sm">从当前节点创建新分支</p>
          </div>
          <div class="glass-card p-4">
            <h4 class="font-semibold text-surface-100 mb-2">/export</h4>
            <p class="text-surface-400 text-sm">导出会话为 HTML 文件</p>
          </div>
          <div class="glass-card p-4">
            <h4 class="font-semibold text-surface-100 mb-2">/share</h4>
            <p class="text-surface-400 text-sm">上传到 GitHub Gist 并获取分享链接</p>
          </div>
        </div>
      </section>

      <!-- Compaction -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">上下文压缩</h2>
        <p class="text-surface-300 mb-4">
          当接近上下文限制时，Pi 会自动总结旧消息。压缩行为完全可通过扩展自定义：
        </p>
        <ul class="space-y-2 text-surface-300">
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span>
            <span>基于主题的压缩</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span>
            <span>代码感知摘要</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span>
            <span>使用不同的摘要模型</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
