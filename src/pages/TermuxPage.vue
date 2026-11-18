<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const updateCode = `pkg update && pkg upgrade`;

const depsCode = `pkg install nodejs git`;

const installCode = `npm install -g --ignore-scripts @earendil-works/pi-coding-agent`;

const versionCode = `pi --version`;

const startCode = `cd /path/to/working-folder
pi`;

const storageCode = `termux-setup-storage`;

const apiCode = `pkg install termux-api`;

const clipboardCode = `printf 'Pi clipboard test' | termux-clipboard-set
termux-clipboard-get`;

const agentsCode = `# Termux environment

- Pi runs in Termux on Android.
- Shared Android storage is under \`/storage/emulated/0\`.
- Open URLs with \`termux-open-url "https://example.com"\`.
- Open files with \`termux-open <path>\`.
- Do not access shared storage unless the task requires it.`;

const notFoundCode = `npm prefix -g
command -v pi`;
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">
          在 Android 上用 Termux 运行 Pi
        </h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 可以通过
          <a
            href="https://termux.dev/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 hover:text-brand-300"
            >Termux</a
          >
          （终端模拟器与 Linux 环境）在 Android 上运行，支持文本输入、文件工具与 shell 命令。
          借助 Termux:API，Pi 可以通过 Android 剪贴板复制粘贴文本；剪贴板图片粘贴不受支持。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">准备工作</h2>
        <p class="text-surface-300 text-sm mb-2">
          从
          <a
            href="https://github.com/termux/termux-app#installation"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 hover:text-brand-300"
            >GitHub 或 F-Droid</a
          >
          安装 Termux，不要使用已废弃的 Google Play 版本。
        </p>
        <p class="text-surface-300 text-sm">
          <a
            href="https://github.com/termux/termux-api#installation"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 hover:text-brand-300"
            >Termux:API</a
          >
          是可选的，仅当你希望 Pi 读写 Android 剪贴板文本，或 shell 命令需要 Android 设备 API
          时才安装。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">安装 Pi</h2>
        <ol class="space-y-4 text-surface-300 text-sm">
          <li>
            <p class="mb-2">1. 更新 Termux 包：</p>
            <CodeBlock :code="updateCode" language="bash" />
          </li>
          <li>
            <p class="mb-2">2. 安装 Node.js 与 Git：</p>
            <CodeBlock :code="depsCode" language="bash" />
          </li>
          <li>
            <p class="mb-2">3. 安装 Pi：</p>
            <CodeBlock :code="installCode" language="bash" />
          </li>
          <li>
            <p class="mb-2">4. 验证安装：</p>
            <CodeBlock :code="versionCode" language="bash" />
          </li>
          <li>
            <p class="mb-2">5. 进入工作目录并启动 Pi：</p>
            <CodeBlock :code="startCode" language="bash" />
          </li>
        </ol>
        <p class="text-surface-400 text-sm mt-4">
          之后按<router-link to="/quickstart" class="text-brand-400 hover:text-brand-300"
            >快速开始</router-link
          >
          连接模型并运行第一个任务。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">
          访问 Android 共享存储
        </h2>
        <p class="text-surface-300 text-sm mb-3">
          授予权限之前 Termux 无法访问共享存储，运行一次：
        </p>
        <CodeBlock :code="storageCode" language="bash" />
        <p class="text-surface-300 text-sm mt-3">
          批准后，共享存储位于 <code class="text-brand-400">/storage/emulated/0</code>，也可通过
          Termux 在 <code class="text-brand-400">~/storage/</code> 下创建的链接访问。只有当 Pi
          应能访问这些文件时才授予权限； Termux 中的命令与工具使用与 Termux 进程相同的存储权限。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">使用剪贴板命令</h2>
        <p class="text-surface-300 text-sm mb-3">
          Pi 用 <code class="text-brand-400">termux-clipboard-set</code> 复制文本，用
          <code class="text-brand-400">termux-clipboard-get</code> 实现剪贴板粘贴快捷键，shell
          命令也可以直接使用它们。
          安装 Termux:API 应用及其命令行包：
        </p>
        <CodeBlock :code="apiCode" language="bash" />
        <p class="text-surface-300 text-sm mt-4 mb-3">验证集成：</p>
        <CodeBlock :code="clipboardCode" language="bash" />
        <p class="text-surface-300 text-sm mt-3">
          第二条命令应输出 <code class="text-brand-400">Pi clipboard test</code>。Termux 剪贴板 API
          只支持文本， Pi 的粘贴快捷键会把文本插入编辑器，但无法附加剪贴板图片。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">
          添加 Termux 专用说明
        </h2>
        <p class="text-surface-300 text-sm mb-3">
          Pi 能检测到自己在 Termux 中运行，但无法推断你希望它如何与 Android
          交互。把与工作相关的环境信息写进
          <code class="text-brand-400">~/.pi/agent/AGENTS.md</code>：
        </p>
        <CodeBlock :code="agentsCode" language="markdown" />
        <p class="text-surface-400 text-sm mt-3">
          在活动会话中修改该文件后运行 <code class="text-brand-400">/reload</code>。
        </p>
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">故障排查</h2>
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="text-surface-100 font-medium">剪贴板集成失败</dt>
            <dd class="text-surface-400 mt-1">
              确认两部分都已安装：与 Termux 同来源的 Termux:API Android 应用，以及
              <code class="text-brand-400">termux-api</code> 命令行包。然后在 Pi
              之外运行上面的验证命令；
              若在那里就失败，先修复 Termux:API 安装。
            </dd>
          </div>
          <div>
            <dt class="text-surface-100 font-medium">共享存储报权限不足</dt>
            <dd class="text-surface-400 mt-1">
              运行 <code class="text-brand-400">termux-setup-storage</code>，批准 Android
              权限请求，再重试 <code class="text-brand-400">~/storage/</code> 或
              <code class="text-brand-400">/storage/emulated/0</code> 下的路径。
            </dd>
          </div>
          <div>
            <dt class="text-surface-100 font-medium">安装后找不到 Pi</dt>
            <dd class="text-surface-400 mt-1 mb-2">打开新的 Termux shell 并运行：</dd>
            <dd><CodeBlock :code="notFoundCode" language="bash" /></dd>
          </div>
        </dl>
        <p class="text-surface-400 text-sm mt-3">
          确认全局 npm 二进制目录在 PATH 中；若包缺失则重新安装 Pi。
        </p>
      </section>
    </div>
  </div>
</template>
