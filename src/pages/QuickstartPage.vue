<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const installUnixCode = `curl -fsSL https://pi.dev/install.sh | sh`

const installWindowsCode = `powershell -c "irm https://pi.dev/install.ps1 | iex"`

const installNpmCode = `npm install -g --ignore-scripts @earendil-works/pi-coding-agent`

const installNixCode = `nix profile add github:earendil-works/pi/stable`

const verifyCode = `pi --version`

const startCode = `cd /path/to/folder
pi`

const firstTaskCode = `> Summarize @meeting-notes.md and save the action items to action-items.md.

> Explain how this repository is structured and how to run its checks.

> Compare @previous.csv with @current.csv and summarize the important changes.`

const continueCode = `pi --continue`

const uninstallCode = `# npm 安装
npm uninstall -g @earendil-works/pi-coding-agent

# 安装脚本安装：再次运行并选择 "Uninstall Pi"
curl -fsSL https://pi.dev/install.sh | sh

# Nix 安装
nix profile remove pi`

const customize = [
  { need: '给某个目录的 Pi 持久指令', start: 'AGENTS.md', path: '/configuration' },
  { need: '从 / 菜单复用一段提示', start: '提示模板', path: '/extensions' },
  { need: '添加特定任务的指令和配套文件', start: '技能', path: '/skills' },
  { need: '添加可执行工具、命令或事件处理器', start: '扩展', path: '/extensions' },
  { need: '构建自定义终端组件', start: '终端 UI', path: '/extensions' },
  { need: '连接不受支持的模型服务', start: '自定义提供商', path: '/models' },
  { need: '安装或分发多个资源', start: 'Pi 包', path: '/packages' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">快速开始</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 运行在你的终端里，处理你机器上的文件。使用它需要一个受支持提供商提供的模型访问权限：
          订阅、API Key 或本地模型都可以。
        </p>
        <p class="text-surface-400 text-sm mt-3">
          原生 Windows 的配置见上游 Windows Setup 文档，Android 见 Termux Setup 文档。
        </p>
      </div>

      <!-- 1. Install -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">1. 安装 Pi</h2>
        <p class="text-surface-300 mb-3">在 macOS、Linux 或 Windows 上使用安装脚本：</p>
        <CodeBlock :code="installUnixCode" language="bash" filename="macOS / Linux" />
        <div class="mt-3">
          <CodeBlock :code="installWindowsCode" language="powershell" filename="Windows" />
        </div>
        <p class="text-surface-400 text-sm mt-3">
          两个安装脚本都会锁定所有依赖，并用 <code class="text-brand-400">pi update</code> 更新 Pi。
          也可以从 npm 安装（不锁定传递依赖），需要 Node.js 22.19 或更新版本：
        </p>
        <CodeBlock :code="installNpmCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          正常的 npm 安装不需要依赖生命周期脚本。
        </p>
        <p class="text-surface-300 text-sm mt-4 mb-2">
          使用 Nix（macOS 或 Linux）时，可从 Pi 的 flake 安装最新版本，Nix 会从源码构建：
        </p>
        <CodeBlock :code="installNixCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          较旧的 Nix 使用 <code class="text-brand-400">nix profile install</code>。更新用
          <code class="text-brand-400">nix profile upgrade pi</code>；<code class="text-brand-400">pi update</code> 无法更新 Nix 安装。
          要固定版本，可使用 <code class="text-brand-400">github:earendil-works/pi/v1.0.0</code> 这样的标签。
        </p>
        <p class="text-surface-300 text-sm mt-4 mb-2">验证安装：</p>
        <CodeBlock :code="verifyCode" language="bash" />
      </section>

      <!-- 2. Start -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">2. 启动 Pi</h2>
        <p class="text-surface-300 mb-3">切换到想让 Pi 工作的文件夹，然后启动：</p>
        <CodeBlock :code="startCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          工作文件夹帮助 Pi 发现相关文件、指令和配置，也用于归组保存的会话。界面显示对话、用于输入提示和命令的编辑器，
          以及包含当前文件夹、模型和会话状态的页脚。
        </p>
      </section>

      <!-- 3. Choose a model -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">3. 选择模型</h2>
        <p class="text-surface-300 mb-3">
          <strong class="text-surface-100">模型</strong>生成 Pi 的响应，<strong class="text-surface-100">提供商</strong>
          是 Pi 访问该模型所使用的服务或账号。在 Pi 中运行：
        </p>
        <code class="block code-block text-brand-300">/login</code>
        <p class="text-surface-400 text-sm mt-3">
          选择提供商，然后按提示使用订阅或保存 API Key。之后用 <code class="text-brand-400">/model</code> 选择其他可用模型。
          支持的提供商、环境变量认证、本地模型和自定义端点见
          <router-link to="/models" class="text-brand-400 hover:text-brand-300">选择模型</router-link>。
        </p>
      </section>

      <!-- 4. Give Pi a task -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">4. 给 Pi 一个任务</h2>
        <p class="text-surface-300 mb-3">
          Pi 会显示它执行的每次文件读取、搜索、命令和编辑，不会在每次工具调用前询问。输入与你的工作匹配的任务，例如：
        </p>
        <CodeBlock :code="firstTaskCode" language="text" />
        <p class="text-surface-400 text-sm mt-3">
          在编辑器中输入 <code class="text-brand-400">@</code> 可以搜索文件，而不必输入完整路径。
          Pi 完成后，检查它的响应和被修改的文件。重要工作请使用版本控制或备份；对不可信或无人值守的工作，使用容器或其他沙箱，
          参见 <router-link to="/security" class="text-brand-400 hover:text-brand-300">安全</router-link>。
        </p>
      </section>

      <!-- Continue later -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">稍后继续</h2>
        <p class="text-surface-300 mb-3">Pi 会自动保存会话。退出后，在同一工作文件夹中恢复最近的会话：</p>
        <CodeBlock :code="continueCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          使用 <code class="text-brand-400">/resume</code> 选择其他已保存的会话。会话命名、分支、压缩、导出和分享见
          <router-link to="/sessions" class="text-brand-400 hover:text-brand-300">会话管理</router-link>。
        </p>
      </section>

      <!-- Next steps -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">下一步</h2>
        <ul class="space-y-2 mb-6">
          <li><router-link to="/usage" class="text-brand-400 hover:text-brand-300 text-sm">使用指南 → 输入、命令、快捷键和排队消息</router-link></li>
          <li><router-link to="/configuration" class="text-brand-400 hover:text-brand-300 text-sm">配置 → 让 Pi 在某个文件夹中始终遵循的指令</router-link></li>
          <li><router-link to="/models" class="text-brand-400 hover:text-brand-300 text-sm">选择模型与提供商</router-link></li>
          <li><router-link to="/how-pi-works" class="text-brand-400 hover:text-brand-300 text-sm">Pi 如何工作 → 工具、上下文、会话与 agent 循环</router-link></li>
        </ul>

        <h3 class="text-lg font-display font-semibold text-surface-50 mb-3">选择自定义 Pi 的方式</h3>
        <p class="text-surface-400 text-sm mb-3">从能满足需求的最小机制开始：</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">需求</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">从这里开始</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in customize" :key="c.need" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-300">{{ c.need }}</td>
                <td class="py-3 px-4">
                  <router-link :to="c.path" class="text-brand-400 hover:text-brand-300">{{ c.start }}</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Uninstall -->
      <section class="glass-card p-8">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-4">卸载 Pi</h2>
        <p class="text-surface-300 text-sm mb-3">使用安装 Pi 时所用的方式卸载：</p>
        <CodeBlock :code="uninstallCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          以上方式都不会删除 <code class="text-brand-400">~/.pi/agent/</code> 中的配置、凭证、会话或已安装的 Pi 包。
        </p>
      </section>
    </div>
  </div>
</template>
