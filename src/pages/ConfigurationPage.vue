<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const agentDir = [
  { path: "<agent-dir>/settings.json", role: "用户级设置，包括偏好、默认值、资源路径和 Pi 包声明" },
  { path: "<agent-dir>/keybindings.json", role: "自定义终端 UI 与应用快捷键" },
  { path: "<agent-dir>/mcp.json", role: "在所有项目中都可用的 MCP 服务器" },
  { path: "<agent-dir>/models.json", role: "兼容端点、模型和模型覆盖" },
  { path: "<agent-dir>/auth.json", role: "已保存的 API Key 与 OAuth 凭证" },
  {
    path: "<agent-dir>/AGENTS.override.md、AGENTS.md、CLAUDE.md",
    role: "跨工作目录生效的用户指令",
  },
  { path: "<agent-dir>/SYSTEM.md", role: "替换 Pi 默认的系统提示" },
  { path: "<agent-dir>/APPEND_SYSTEM.md", role: "在系统提示后追加指令" },
  { path: "<agent-dir>/extensions/", role: "用户扩展" },
  { path: "<agent-dir>/skills/", role: "用户技能及配套文件" },
  { path: "<agent-dir>/prompts/", role: "作为斜杠命令的用户提示模板" },
  { path: "<agent-dir>/themes/", role: "用户主题文件" },
];

const projectDir = [
  { path: ".pi/settings.json", role: "项目级设置、资源路径和 Pi 包声明" },
  { path: ".pi/mcp.json", role: "项目 MCP 服务器" },
  { path: ".pi/SYSTEM.md", role: "替换项目系统提示" },
  { path: ".pi/APPEND_SYSTEM.md", role: "追加项目专用指令" },
  { path: ".pi/extensions/", role: "项目扩展" },
  { path: ".pi/skills/", role: "项目技能及配套文件" },
  { path: ".pi/prompts/", role: "作为斜杠命令的项目提示模板" },
  { path: ".pi/themes/", role: "项目主题文件" },
];

const contextExample = `# AGENTS.md - 项目指令

- 代码更改后运行 \`npm run check\`。
- 不要在本地运行生产环境迁移。
- 保持回复简洁。`;
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">配置</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 支持用户级和项目级配置。用户级配置位于 agent 目录（默认
          <code class="text-brand-400">~/.pi/agent</code>），
          项目配置位于工作目录下的 <code class="text-brand-400">.pi</code>，在授予
          <router-link to="/security" class="text-brand-400 hover:text-brand-300"
            >项目信任</router-link
          >
          后加载。
          唯一的例外是 <code class="text-brand-400">sessionDir</code>，Pi
          在解析信任之前就会读取它，以便定位会话。
        </p>
      </div>

      <section class="mb-8 glass-card p-5">
        <p class="text-surface-300 text-sm">
          在交互模式中用
          <code class="text-brand-400">/settings</code> 修改常见偏好；其他选项可以直接让 Pi
          修改配置或编辑相应文件。
          手动修改设置、快捷键、指令或资源后，运行 <code class="text-brand-400">/reload</code>。
        </p>
      </section>

      <!-- Agent directory -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">Agent 目录</h2>
        <p class="text-surface-300 mb-3">
          用 <code class="text-brand-400">PI_CODING_AGENT_DIR</code> 环境变量或 SDK 的
          <code class="text-brand-400">agentDir</code> 选项设置其位置。
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">路径</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">作用</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in agentDir" :key="row.path" class="border-b border-surface-800/50">
                <td class="py-3 px-4">
                  <code class="text-brand-400 text-xs">{{ row.path }}</code>
                </td>
                <td class="py-3 px-4 text-surface-300">{{ row.role }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Project .pi -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">
          项目 <code class="text-brand-400">.pi</code> 目录
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">路径</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">作用</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in projectDir" :key="row.path" class="border-b border-surface-800/50">
                <td class="py-3 px-4">
                  <code class="text-brand-400 text-xs">{{ row.path }}</code>
                </td>
                <td class="py-3 px-4 text-surface-300">{{ row.role }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          对 <code class="text-brand-400">SYSTEM.md</code> 和
          <code class="text-brand-400">APPEND_SYSTEM.md</code>，受信任的项目文件优先于 agent
          目录中的同名文件，内容不会合并。
        </p>
      </section>

      <!-- Context files -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">上下文文件</h2>
        <p class="text-surface-300 mb-3">
          上下文文件与项目 <code class="text-brand-400">.pi</code> 配置相互独立。Pi 从 agent
          目录、工作目录及其父目录加载它们，
          上下文文件在它所在目录及其任意子目录中运行 Pi 时生效。
        </p>
        <CodeBlock :code="contextExample" language="markdown" filename="AGENTS.md" />
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">AGENTS.override.md</code> 只替换同一目录下的
          <code class="text-brand-400">AGENTS.md</code> 或
          <code class="text-brand-400">CLAUDE.md</code>，不会屏蔽 agent 目录或其他目录的上下文文件。
          上下文文件的发现不需要项目信任。
        </p>
      </section>
    </div>
  </div>
</template>
