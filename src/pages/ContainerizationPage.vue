<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const methods = [
  {
    method: "纯 Docker",
    where: "容器",
    isolated: "Pi、内置工具、! 命令和扩展",
    cred: "凭证传入容器",
    best: "简单直接的本地容器边界",
  },
  {
    method: "Docker Sandboxes",
    where: "托管沙箱",
    isolated: "Pi、内置工具、! 命令和扩展",
    cred: "提供商凭证留在主机，由代理替换",
    best: "不暴露真实提供商 Key 的托管本地隔离",
  },
  {
    method: "OpenShell",
    where: "本地或远程沙箱",
    isolated: "Pi、内置工具、! 命令和扩展",
    cred: "策略控制的凭证与推理路由",
    best: "文件系统、进程、网络和凭证策略",
  },
  {
    method: "Gondolin 扩展",
    where: "主机",
    isolated: "内置工具和 ! 命令",
    cred: "Pi 的凭证留在主机，但命令继承主机环境变量",
    best: "用本地微型 VM 执行工具，同时保留主机界面",
  },
];

const dockerfile = `FROM node:24-bookworm-slim

RUN apt-get update \\
  && apt-get install -y --no-install-recommends bash ca-certificates git ripgrep \\
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g --ignore-scripts @earendil-works/pi-coding-agent

WORKDIR /workspace
ENTRYPOINT ["pi"]`;

const dockerBuild = `docker build -t pi-sandbox -f Dockerfile.pi .`;

const dockerRun = `docker run --rm -it \\
  -e ANTHROPIC_API_KEY \\
  -v "$PWD:/workspace" \\
  -v pi-agent-home:/root/.pi/agent \\
  pi-sandbox`;

const sbxToken = `sbx secret rm anthropic

sbx secret set-custom \\
  --host api.anthropic.com \\
  --env ANTHROPIC_OAUTH_TOKEN \\
  --placeholder 'sk-ant-oat01-{rand}'`;

const sbxRun = `sbx run --kit "docker.io/sbx/pi-kit:latest" pi

# 已有沙箱中以非交互方式运行
sbx exec <sandbox-name> -- pi -p "list the failing tests"`;

const openshellCode = `openshell gateway add <gateway-url> --name <name>
openshell gateway select <name>

openshell sandbox create --name pi-sandbox --from pi -- pi

# 远程沙箱需要显式传输文件
openshell sandbox upload pi-sandbox ./working-folder /workspace`;

const gondolinInstall = `mkdir -p ~/.pi/agent/extensions
cp -R packages/coding-agent/examples/extensions/gondolin ~/.pi/agent/extensions/gondolin
cd ~/.pi/agent/extensions/gondolin
npm install --ignore-scripts`;

const gondolinRun = `cd /path/to/working-folder
pi -e ~/.pi/agent/extensions/gondolin`;

const exposure = [
  "读写挂载的主机目录允许 Pi 修改这些主机文件。",
  "挂载 ~/.pi/agent 会暴露你的 Pi 凭证、设置、扩展和会话。",
  "传入容器的环境变量对容器内的进程可见。",
  "网络访问可能让代码或工具输出离开环境。",
  "仅隔离工具不会约束主机上的 Pi 进程，也不会约束不使用隔离后端的扩展工具。",
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">在隔离环境中运行 Pi</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          用隔离环境限制模型生成的命令能访问或影响的文件、凭证、进程和网络服务。
          你既可以隔离整个 Pi 进程，也可以让 Pi 留在主机上，只把选定工具路由到隔离环境。
        </p>
      </div>

      <!-- Choose -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择隔离方式</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-3 text-surface-300 font-medium">方式</th>
                <th class="text-left py-3 px-3 text-surface-300 font-medium">Pi 运行位置</th>
                <th class="text-left py-3 px-3 text-surface-300 font-medium">隔离内容</th>
                <th class="text-left py-3 px-3 text-surface-300 font-medium">凭证处理</th>
                <th class="text-left py-3 px-3 text-surface-300 font-medium">适用场景</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in methods" :key="m.method" class="border-b border-surface-800/50">
                <td class="py-3 px-3 text-surface-100 font-medium">{{ m.method }}</td>
                <td class="py-3 px-3 text-surface-300">{{ m.where }}</td>
                <td class="py-3 px-3 text-surface-300">{{ m.isolated }}</td>
                <td class="py-3 px-3 text-surface-300">{{ m.cred }}</td>
                <td class="py-3 px-3 text-surface-400">{{ m.best }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          方式决定了扩展在哪里运行。整个 Pi 进程在隔离环境中运行时，它的扩展也在其中运行；
          主机上的 Pi 通过 Gondolin
          委派内置工具时，其他扩展工具仍在主机上运行，除非它们也委派自己的工作。
        </p>
      </section>

      <!-- Exposure -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">决定 Pi 能访问什么</h2>
        <p class="text-surface-300 mb-3">隔离的进程仍可能影响你暴露给它的资源：</p>
        <ul class="space-y-2">
          <li
            v-for="e in exposure"
            :key="e"
            class="text-surface-300 text-sm flex items-start gap-2"
          >
            <span class="text-brand-400 mt-1">•</span><span>{{ e }}</span>
          </li>
        </ul>
        <p class="text-surface-400 text-sm mt-3">
          只暴露任务所需的工作文件夹、凭证和网络目标。不希望写入影响主机时，使用只读挂载，或把文件复制进出环境。
        </p>
      </section>

      <!-- Plain Docker -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">
          使用纯 Docker 运行 Pi
        </h2>
        <p class="text-surface-300 mb-3">
          纯 Docker 提供最简单的整进程容器边界。先创建
          <code class="text-brand-400">Dockerfile.pi</code>：
        </p>
        <CodeBlock :code="dockerfile" language="dockerfile" filename="Dockerfile.pi" />
        <p class="text-surface-300 text-sm mt-4 mb-2">在该文件所在目录构建镜像：</p>
        <CodeBlock :code="dockerBuild" language="bash" />
        <p class="text-surface-300 text-sm mt-4 mb-2">从你想让 Pi 访问的工作文件夹启动：</p>
        <CodeBlock :code="dockerRun" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          把 <code class="text-brand-400">ANTHROPIC_API_KEY</code> 换成你的提供商需要的凭证。命名卷
          <code class="text-brand-400">pi-agent-home</code>
          在多次运行之间保留容器内的设置、凭证和会话。
          除非容器应当访问主机的 Pi 配置和凭证，否则不要挂载主机的
          <code class="text-brand-400">~/.pi/agent</code>。
          在 Pi 内运行 <code class="text-brand-400">!pwd</code>，应显示
          <code class="text-brand-400">/workspace</code>。
        </p>
      </section>

      <!-- Docker Sandboxes -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">
          使用 Docker Sandboxes 运行 Pi
        </h2>
        <p class="text-surface-300 mb-3">
          <a
            href="https://docs.docker.com/ai/sandboxes/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 hover:text-brand-300"
            >Docker Sandboxes</a
          >
          在托管沙箱中运行完整的 Pi
          进程。它的代理可以把真实提供商凭证留在主机上，在请求离开沙箱时替换。
          请在创建沙箱前配置凭证，不要在沙箱内运行
          <code class="text-brand-400">/login</code>，那会把真实凭证写进沙箱。
        </p>
        <p class="text-surface-300 text-sm mb-2">
          使用 Claude Pro 或 Max 令牌时，在装有 Claude Code 的机器上用
          <code class="text-brand-400">claude setup-token</code> 生成。
          若已配置 <code class="text-brand-400">anthropic</code> secret，先移除它，避免代理在 bearer
          token 之外又加上 API Key 头：
        </p>
        <CodeBlock :code="sbxToken" language="bash" />
        <p class="text-surface-400 text-sm mt-2">
          <code class="text-brand-400">sbx secret set-custom</code>
          从标准输入读取真实令牌，沙箱只看到 OAuth 形式的占位符。
          使用 Anthropic API Key 时改用
          <code class="text-brand-400">sbx secret set anthropic</code>。
        </p>
        <div class="mt-4">
          <CodeBlock :code="sbxRun" language="bash" />
        </div>
      </section>

      <!-- OpenShell -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">
          使用 OpenShell 运行 Pi
        </h2>
        <p class="text-surface-300 mb-3">
          <a
            href="https://docs.nvidia.com/openshell/about/overview"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 hover:text-brand-300"
            >NVIDIA OpenShell</a
          >
          提供本地或远程沙箱，带文件系统、进程、网络、凭证和推理策略。
        </p>
        <CodeBlock :code="openshellCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          远程 gateway 不会绑定挂载主机工作文件夹，请在沙箱内克隆仓库或显式传输文件。 OpenShell
          的推理路由可以让原始模型凭证留在沙箱之外；配置后把 Pi 指向网关暴露的 OpenAI 兼容或
          Anthropic 兼容端点。
        </p>
      </section>

      <!-- Gondolin -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">
          通过 Gondolin 路由工具
        </h2>
        <p class="text-surface-300 mb-3">
          <a
            href="https://github.com/earendil-works/gondolin"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 hover:text-brand-300"
            >Gondolin</a
          >
          是本地 Linux 微型 VM。示例扩展把 Pi
          进程和基于文件的提供商凭证留在主机上，同时把内置工具和用户的
          <code class="text-brand-400">!</code> 命令路由进 VM。VM
          内的命令继承主机进程环境，因此通过环境变量提供的提供商 Key 可能在其中可见；
          除非移除敏感变量或修改扩展的环境处理，不要把这种模式当作凭证边界。
        </p>
        <p class="text-surface-400 text-sm mb-3">
          Gondolin 需要 Node.js 23.6 或更新版本，以及由系统包管理器安装的 QEMU。从 Pi
          源码检出中安装扩展：
        </p>
        <CodeBlock :code="gondolinInstall" language="bash" />
        <p class="text-surface-300 text-sm mt-4 mb-2">从你想挂载的工作文件夹启动 Pi：</p>
        <CodeBlock :code="gondolinRun" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          扩展把主机工作文件夹挂载为 VM 中的 <code class="text-brand-400">/workspace</code>，并覆盖
          <code class="text-brand-400">read</code>、<code class="text-brand-400">write</code>、<code
            class="text-brand-400"
            >edit</code
          >、 <code class="text-brand-400">bash</code>、<code class="text-brand-400">grep</code
          >、<code class="text-brand-400">find</code> 和
          <code class="text-brand-400">ls</code>。<code class="text-brand-400">/workspace</code>
          下的文件改动会写回主机。
          其他扩展工具仍在主机上运行，除非显式委派；添加可能绕过 VM 边界的工具前，请先检查 Gondolin
          示例。
        </p>
      </section>
    </div>
  </div>
</template>
