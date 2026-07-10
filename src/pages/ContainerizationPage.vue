<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const patterns = [
  { name: 'Gondolin', isolation: '内置工具和 ! 命令', best: '本地微型 VM 隔离，同时保持主机认证' },
  { name: '纯 Docker', isolation: '整个 Pi 进程在本地容器中', best: '简单的本地隔离' },
  { name: 'OpenShell', isolation: '整个 Pi 进程在策略控制的沙箱中', best: '本地或远程托管沙箱' },
]

const gondolinSetup = `# 复制扩展
cp -R packages/coding-agent/examples/extensions/gondolin ~/.pi/agent/extensions/gondolin
cd ~/.pi/agent/extensions/gondolin
npm install --ignore-scripts

# 运行
cd /path/to/project
pi -e ~/.pi/agent/extensions/gondolin`

const dockerfile = `FROM node:24-bookworm-slim

RUN apt-get update \\
  && apt-get install -y --no-install-recommends bash ca-certificates git ripgrep \\
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g --ignore-scripts @earendil-works/pi-coding-agent

WORKDIR /workspace
ENTRYPOINT ["pi"]`

const dockerRun = `docker build -t pi-sandbox -f Dockerfile.pi .

docker run --rm -it \\
  -e ANTHROPIC_API_KEY \\
  -v "$(pwd):/workspace" \\
  pi-sandbox`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">容器化</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 默认以所有权限运行，但在某些情况下，你可能希望对 Pi 可以写入的目录和访问权限有更多控制。
        </p>
      </div>

      <!-- Choose Pattern -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择模式</h2>
        <p class="text-surface-300 mb-4">有两种通用选项：</p>
        <ol class="list-decimal list-inside text-surface-300 mb-6 space-y-1">
          <li>将整个 <code class="text-brand-400">pi</code> 进程运行在隔离环境中</li>
          <li>在主机上运行 <code class="text-brand-400">pi</code>，同时将工具执行路由到隔离环境</li>
        </ol>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">模式</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">隔离内容</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">最适用</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in patterns" :key="p.name" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100 font-medium">{{ p.name }}</td>
                <td class="py-3 px-4 text-surface-300">{{ p.isolation }}</td>
                <td class="py-3 px-4 text-surface-300">{{ p.best }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Gondolin -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">Gondolin</h2>
        <p class="text-surface-300 mb-4">
          Gondolin 是一个本地 Linux 微型虚拟机。当你想要主机上的 Pi 但所有内置工具都路由到 VM 时，使用示例扩展。
        </p>
        <CodeBlock :code="gondolinSetup" language="bash" filename="Gondolin 设置" />
        <p class="text-surface-400 text-sm mt-3">
          扩展将主机 cwd 挂载到 VM 中的 <code class="text-brand-400">/workspace</code>，并覆盖 <code class="text-brand-400">read</code>、<code class="text-brand-400">write</code>、<code class="text-brand-400">edit</code>、<code class="text-brand-400">bash</code>、<code class="text-brand-400">grep</code>、<code class="text-brand-400">find</code> 和 <code class="text-brand-400">ls</code>。
        </p>
        <div class="mt-3 glass-card p-3">
          <p class="text-surface-400 text-sm">
            要求：Node.js >= 23.6.0，QEMU（需要通过包管理器安装）
          </p>
        </div>
      </section>

      <!-- Docker -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">纯 Docker</h2>
        <p class="text-surface-300 mb-4">
          当你想要最简单的本地容器边界时，将整个 Pi 进程运行在 Docker 中。
        </p>
        <CodeBlock :code="dockerfile" language="dockerfile" filename="Dockerfile.pi" />
        <div class="mt-4">
          <CodeBlock :code="dockerRun" language="bash" filename="构建和运行" />
        </div>
      </section>

      <!-- OpenShell -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">OpenShell</h2>
        <p class="text-surface-300">
          OpenShell 是一个策略控制的沙箱环境。将整个 Pi 进程运行在 OpenShell 网关中，实现更细粒度的访问控制。
          需要 OpenShell 网关。
        </p>
      </section>
    </div>
  </div>
</template>
