<script setup lang="ts">
const runModes = [
  {
    mode: "直接以其操作系统用户的权限运行",
    protected:
      "该用户无法访问的任何内容。专用账号可以收窄权限，但 Pi 仍与其他用户共享操作系统和网络。",
  },
  {
    mode: "完全运行在容器、虚拟机或沙箱中",
    protected:
      "你没有暴露给该环境的主机文件与进程。若在其中提供凭证和网络服务，它们仍然可访问。这通常是实践中最强的选择。",
  },
  {
    mode: "Pi 留在隔离环境之外，只把内置工具放进去",
    protected:
      "主机资源不受通过这些工具执行的操作影响。Pi 本身和其他扩展仍在边界之外，因此这是较窄的隔离形式。",
  },
];

const trustResources = [
  ".pi/settings.json",
  ".pi/mcp.json",
  ".pi/extensions、.pi/skills、.pi/prompts 或 .pi/themes",
  ".pi/SYSTEM.md 或 .pi/APPEND_SYSTEM.md",
  "当前目录或祖先目录中的项目 .agents/skills",
];

const trustGranted = [
  "项目设置",
  "来自 .pi/mcp.json 的项目 MCP 服务器",
  ".pi 下的扩展、技能、提示模板、主题和系统提示文件",
  "通过项目设置配置但缺失的包",
  "项目本地和项目包中的扩展",
];

const trustDecision = [
  "命令行的 --approve 或 --no-approve 覆盖优先生效。",
  "用户级和命令行扩展可以处理 project_trust 事件，第一个返回 yes 或 no 的扩展拥有决定权。",
  "若没有扩展决定，Pi 查找当前目录或其父目录的已保存决定，最近的生效。",
  '若没有已保存决定，Pi 遵循全局 defaultProjectTrust 设置，默认是 "ask"。',
];

const practices = [
  "只给 Pi 访问任务所需的文件和服务。",
  "重大改动前使用快照、备份或版本控制。",
  "加载扩展和包之前先检查它们，扩展在 Pi 进程内执行。",
  "优先使用范围窄、有效期短的凭证。",
  "把结果应用到其他系统之前检查 diff 和生成内容。",
  "导出或分享会话前先检查，其中可能包含提示、工具参数、命令输出、文件内容和对话中暴露的凭证。",
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">安全运行 Pi</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          把模型生成的命令和代码视为不可信。Pi
          能以启动它的账号权限读取、修改和执行文件，且不会在每次工具调用前请求批准。
          扩展、包安装器、语言服务器等子进程拥有相同权限，除非操作系统或虚拟化边界加以限制。
        </p>
      </div>

      <section class="mb-12 glass-card p-5">
        <p class="text-surface-300 text-sm">
          文件、注释、指令、命令输出和模型响应都可能通过提示注入操控模型。项目信任控制启动时加载哪些项目资源，
          但不会让这些内容或由此产生的操作变安全。安全来自限制 Pi
          在生成操作错误或恶意时能访问和影响的文件、凭证、进程与网络服务。
          观察转录、使用项目信任和检查改动都不构成安全边界。
        </p>
      </section>

      <!-- Choose how to run -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择运行 Pi 的方式</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">运行方式</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">仍受保护的内容</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in runModes" :key="m.mode" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ m.mode }}</td>
                <td class="py-3 px-4 text-surface-300">{{ m.protected }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          工作文件夹控制资源发现和工具的默认位置，但不能阻止命令访问 Pi 进程可用的其他路径。
          无论选择哪种方式，只提供任务必需的的文件和服务；尽量把凭证留在环境之外，或使用范围窄、有效期短的凭证；
          命令不需要网络时限制网络访问。各隔离方式的配置和限制见
          <router-link to="/containerization" class="text-brand-400 hover:text-brand-300"
            >容器化</router-link
          >。
        </p>
      </section>

      <!-- Project trust -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">理解项目信任</h2>
        <p class="text-surface-300 mb-3">
          项目信任控制 Pi
          是否加载工作文件夹提供的大部分设置和资源，避免文件夹在你批准之前悄悄加载可执行扩展。
        </p>
        <p class="text-surface-300 mb-3">
          项目信任不是完整的启动边界。Pi 在解析项目信任之前，会在选择或创建会话时读取项目的
          <code class="text-brand-400">sessionDir</code>
          设置。拒绝信任会阻止其余项目设置和受保护资源加载，但无法撤销最初的那次会话目录查找。
          项目信任也不限制工具调用能访问或影响什么：启动之后，已启用的工具仍使用 Pi
          进程的操作系统权限。
        </p>

        <h3 class="text-lg font-semibold text-surface-100 mb-2">受项目信任保护的资源</h3>
        <p class="text-surface-400 text-sm mb-2">
          当 Pi 在当前工作目录发现以下任一资源时，需要做出项目信任决定：
        </p>
        <ul class="space-y-1 mb-4">
          <li
            v-for="r in trustResources"
            :key="r"
            class="text-surface-300 text-sm flex items-start gap-2"
          >
            <code class="text-brand-400 shrink-0">{{ r }}</code>
          </li>
        </ul>
        <p class="text-surface-400 text-sm mb-4">
          空的 <code class="text-brand-400">.pi</code> 目录不需要项目信任。
        </p>

        <h3 class="text-lg font-semibold text-surface-100 mb-2">授予信任允许 Pi 加载</h3>
        <ul class="space-y-1 mb-4">
          <li
            v-for="g in trustGranted"
            :key="g"
            class="text-surface-300 text-sm flex items-start gap-2"
          >
            <span class="text-brand-400 mt-1">•</span><span>{{ g }}</span>
          </li>
        </ul>
        <p class="text-surface-300 text-sm mb-4">
          拒绝信任会跳过这些受保护资源，仅保留上面提到的初始
          <code class="text-brand-400">sessionDir</code> 查找。
          <code class="text-brand-400">AGENTS.override.md</code>、<code class="text-brand-400"
            >AGENTS.md</code
          >
          和
          <code class="text-brand-400">CLAUDE.md</code>
          等上下文文件无论项目信任如何都会加载，除非禁用上下文加载。
          即使拒绝信任，也应把文件夹中的指令当作不可信输入。
        </p>

        <h3 class="text-lg font-semibold text-surface-100 mb-2">Pi 如何做出信任决定</h3>
        <ol class="space-y-2">
          <li v-for="(step, i) in trustDecision" :key="step" class="flex items-start gap-3">
            <span
              class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-medium shrink-0"
              >{{ i + 1 }}</span
            >
            <span class="text-surface-300 text-sm">{{ step }}</span>
          </li>
        </ol>
        <p class="text-surface-300 text-sm mt-3">
          已保存的决定使用规范化路径，存放在
          <code class="text-brand-400">~/.pi/agent/trust.json</code>。
          使用 <code class="text-brand-400">/trust</code> 为后续 Pi 进程保存决定。
        </p>

        <h3 class="text-lg font-semibold text-surface-100 mb-3 mt-4">没有交互提示时的项目信任</h3>
        <p class="text-surface-300 text-sm">
          打印、JSON 和 RPC 模式无法显示内置信任提示。若没有命令行覆盖、扩展或已保存决定适用：
          <code class="text-brand-400">defaultProjectTrust: "always"</code> 会加载受保护的项目资源；
          <code class="text-brand-400">"ask"</code> 或
          <code class="text-brand-400">"never"</code> 会跳过它们。
          自动化运行需要一次明确决定时，使用 <code class="text-brand-400">--approve</code> 或
          <code class="text-brand-400">--no-approve</code>。
        </p>
      </section>

      <!-- Reduce impact -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">降低影响并便于恢复</h2>
        <p class="text-surface-400 text-sm mb-3">
          这些做法不能替代隔离，但能减少暴露或让恢复更容易：
        </p>
        <ul class="space-y-2">
          <li
            v-for="p in practices"
            :key="p"
            class="text-surface-300 text-sm flex items-start gap-2"
          >
            <span class="text-brand-400 mt-1">•</span><span>{{ p }}</span>
          </li>
        </ul>
      </section>

      <!-- Report -->
      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">报告安全问题</h2>
        <p class="text-surface-300 text-sm">
          遵循仓库的
          <a
            href="https://github.com/earendil-works/pi/blob/main/SECURITY.md"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 hover:text-brand-300"
            >Security Policy</a
          >。
          安全敏感报告请勿开公开 issue。预期内的本地 agent
          行为、来自不可信内容的提示注入、缺少内置沙箱，以及用户自行安装的扩展或技能的行为，
          通常不在安全边界之内，除非报告展示了权限边界绕过或本地用户本不应拥有的访问。
        </p>
      </section>
    </div>
  </div>
</template>
