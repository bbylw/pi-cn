<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const installCode = `npm install -g --ignore-scripts @earendil-works/pi-coding-agent`

const curlCode = `curl -fsSL https://pi.dev/install.sh | sh`

const uninstallCode = `# npm 或 curl 安装
npm uninstall -g @earendil-works/pi-coding-agent

# pnpm
pnpm remove -g @earendil-works/pi-coding-agent

# Yarn
yarn global remove @earendil-works/pi-coding-agent

# Bun
bun uninstall -g @earendil-works/pi-coding-agent`

const apiKeyCode = `export ANTHROPIC_API_KEY=sk-ant-...
pi`

const firstSessionCode = `cd /path/to/project
pi

# 然后输入你的请求：
# > Summarize this repository and tell me how to run its checks.`

const agentsMdCode = `# Project Instructions

- Run \`npm run check\` after code changes.
- Do not run production migrations locally.
- Keep responses concise.`

const referenceFilesCode = `pi @README.md "Summarize this"
pi @src/app.ts @src/app.test.ts "Review these together"`

const shellCommandCode = `# 在交互模式中：
!npm run lint

# 运行命令但不将输出添加到模型上下文中：
!!npm run lint`

const nonInteractiveCode = `pi -p "Summarize this codebase"
cat README.md | pi -p "Summarize this text"
pi -p @screenshot.png "What's in this image?"`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">快速开始</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          本页面将带你从安装到第一次 Pi 会话。
        </p>
      </div>

      <!-- Install Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">安装</h2>
        <p class="text-surface-300 mb-4">
          Pi 以 npm 包形式分发：
        </p>
        <CodeBlock :code="installCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">--ignore-scripts</code> 在安装期间禁用依赖生命周期脚本。Pi 的正常 npm 安装不需要安装脚本。
        </p>

        <div class="mt-6">
          <p class="text-surface-300 mb-3">在 Linux 或 macOS 上，你也可以使用安装脚本：</p>
          <CodeBlock :code="curlCode" language="bash" />
        </div>
      </section>

      <!-- Uninstall Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">卸载</h2>
        <p class="text-surface-300 mb-4">
          使用安装 Pi 时使用的包管理器。curl 安装器全局使用 npm，因此 curl 和 npm 安装都通过 npm 卸载：
        </p>
        <CodeBlock :code="uninstallCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          卸载 Pi 后，设置、凭证、会话和已安装的 Pi 包仍保留在 <code class="text-brand-400">~/.pi/agent/</code> 中。
        </p>
      </section>

      <!-- Authenticate Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">认证</h2>
        <p class="text-surface-300 mb-4">
          Pi 可以通过 <code class="text-brand-400">/login</code> 使用订阅提供商，或通过环境变量/认证文件使用 API Key 提供商。
        </p>

        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">选项 1：订阅登录</h3>
            <p class="text-surface-300 mb-3">启动 Pi 并运行：</p>
            <code class="block code-block text-brand-300">/login</code>
            <p class="text-surface-400 text-sm mt-2">
              然后选择一个提供商。内置订阅登录包括 Claude Pro/Max、ChatGPT Plus/Pro (Codex) 和 GitHub Copilot。
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">选项 2：API Key</h3>
            <p class="text-surface-300 mb-3">在启动 Pi 之前设置 API Key：</p>
            <CodeBlock :code="apiKeyCode" language="bash" />
            <p class="text-surface-400 text-sm mt-2">
              你也可以运行 <code class="text-brand-400">/login</code> 并选择 API Key 提供商，将密钥存储在 <code class="text-brand-400">~/.pi/agent/auth.json</code> 中。
            </p>
          </div>
        </div>
      </section>

      <!-- First Session Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">第一次会话</h2>
        <p class="text-surface-300 mb-4">
          启动 Pi 后，输入请求并按 Enter：
        </p>
        <CodeBlock :code="firstSessionCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          默认情况下，Pi 给模型四个工具：<code class="text-brand-400">read</code>（读取文件）、<code class="text-brand-400">write</code>（创建或覆盖文件）、<code class="text-brand-400">edit</code>（修补文件）、<code class="text-brand-400">bash</code>（运行 shell 命令）。
        </p>
      </section>

      <!-- Project Instructions Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">给 Pi 项目指令</h2>
        <p class="text-surface-300 mb-4">
          Pi 在启动时加载上下文文件。添加 <code class="text-brand-400">AGENTS.md</code> 文件来告诉它如何在项目中工作：
        </p>
        <CodeBlock :code="agentsMdCode" language="markdown" filename="AGENTS.md" />
        <p class="text-surface-400 text-sm mt-3">
          Pi 加载：
        </p>
        <ul class="list-disc list-inside text-surface-400 text-sm mt-2 space-y-1">
          <li><code class="text-brand-400">~/.pi/agent/AGENTS.md</code> — 全局指令</li>
          <li>父目录和当前目录中的 <code class="text-brand-400">AGENTS.md</code> 或 <code class="text-brand-400">CLAUDE.md</code></li>
        </ul>
      </section>

      <!-- Common Things Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">常用操作</h2>

        <div class="space-y-8">
          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">引用文件</h3>
            <p class="text-surface-300 mb-3">在编辑器中输入 <code class="text-brand-400">@</code> 进行模糊搜索文件，或在命令行传递文件：</p>
            <CodeBlock :code="referenceFilesCode" language="bash" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">运行 Shell 命令</h3>
            <p class="text-surface-300 mb-3">在交互模式中：</p>
            <CodeBlock :code="shellCommandCode" language="bash" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">切换模型</h3>
            <p class="text-surface-300">
              使用 <code class="text-brand-400">/model</code> 或 <code class="text-brand-400">Ctrl+L</code> 选择模型。使用 <code class="text-brand-400">Shift+Tab</code> 循环思考级别。使用 <code class="text-brand-400">Ctrl+P</code> / <code class="text-brand-400">Shift+Ctrl+P</code> 循环切换范围内的模型。
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">稍后继续</h3>
            <p class="text-surface-300 mb-3">会话自动保存：</p>
            <CodeBlock code="pi -c                  # 继续最近的会话
pi -r                  # 浏览之前的会话
pi --name 'my task'    # 在启动时设置会话显示名称
pi --session <path|id> # 打开特定会话" language="bash" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">非交互模式</h3>
            <p class="text-surface-300 mb-3">用于一次性提示：</p>
            <CodeBlock :code="nonInteractiveCode" language="bash" />
          </div>
        </div>
      </section>

      <!-- Next Steps -->
      <section class="glass-card p-8 glow-border">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-4">下一步</h2>
        <ul class="space-y-3">
          <li>
            <router-link to="/usage" class="text-brand-400 hover:text-brand-300">
              使用指南 → 交互模式、斜杠命令、会话、上下文文件和 CLI 参考
            </router-link>
          </li>
          <li>
            <router-link to="/providers" class="text-brand-400 hover:text-brand-300">
              模型提供商 → 认证和模型设置
            </router-link>
          </li>
          <li>
            <router-link to="/extensions" class="text-brand-400 hover:text-brand-300">
              扩展与技能 → 自定义 Pi 的行为
            </router-link>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
