<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const quickStartCode = `import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

export default function (pi: ExtensionAPI) {
  // 响应事件
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("Extension loaded!", "info");
  });

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName === "bash" && event.input.command?.includes("rm -rf")) {
      const ok = await ctx.ui.confirm("Dangerous!", "Allow rm -rf?");
      if (!ok) return { block: true, reason: "Blocked by user" };
    }
  });

  // 注册自定义工具
  pi.registerTool({
    name: "greet",
    label: "Greet",
    description: "Greet someone by name",
    parameters: Type.Object({
      name: Type.String({ description: "Name to greet" }),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      return {
        content: [{ type: "text", text: \`Hello, \${params.name}!\` }],
        details: {},
      };
    },
  });

  // 注册自定义命令
  pi.registerCommand({
    name: "hello",
    description: "Say hello",
    async execute(ctx) {
      ctx.ui.notify("Hello from extension!", "info");
    },
  });
}`

const extensionLocations = [
  { path: '~/.pi/agent/extensions/', desc: '全局扩展（所有项目）' },
  { path: '.pi/extensions/', desc: '项目级扩展' },
  { path: 'pi -e ./path.ts', desc: '临时加载（仅测试）' },
]

const capabilities = [
  { title: '自定义工具', desc: '注册 LLM 可通过 pi.registerTool() 调用的工具' },
  { title: '事件拦截', desc: '阻止或修改工具调用、注入上下文、自定义压缩' },
  { title: '用户交互', desc: '通过 ctx.ui 提示用户（select、confirm、input、notify）' },
  { title: '自定义 UI', desc: '通过 ctx.ui.custom() 实现完整的 TUI 组件' },
  { title: '自定义命令', desc: '通过 pi.registerCommand() 注册 /mycommand 命令' },
  { title: '会话持久化', desc: '通过 pi.appendEntry() 存储跨重启的状态' },
  { title: '自定义渲染', desc: '控制工具调用/结果和消息在 TUI 中的显示方式' },
]

const events = [
  { name: 'session_start / session_end', desc: '会话生命周期' },
  { name: 'agent_start / agent_end', desc: 'Agent 运行开始/结束' },
  { name: 'tool_call / tool_result', desc: '工具调用/结果（可拦截）' },
  { name: 'model_change', desc: '模型切换' },
  { name: 'user_bash', desc: '用户运行 !command' },
  { name: 'message_start / message_end', desc: '消息生成开始/结束' },
]

const useCases = [
  { title: '权限门控', desc: '在 rm -rf、sudo 等命令前确认' },
  { title: 'Git 检查点', desc: '每轮 stash，分支时恢复' },
  { title: '路径保护', desc: '阻止写入 .env、node_modules/' },
  { title: '自定义压缩', desc: '按你的方式总结对话' },
  { title: '交互式工具', desc: '问题、向导、自定义对话框' },
  { title: '有状态工具', desc: '待办列表、连接池' },
  { title: '外部集成', desc: '文件监听、webhook、CI 触发' },
  { title: '游戏', desc: '等待时玩贪吃蛇' },
]

const skills = [
  { title: '什么是技能', desc: '技能是带有指令和工具的能力包，按需加载。渐进式披露，不会破坏提示缓存。' },
  { title: '技能位置', desc: '~/.pi/agent/skills/ 或 .pi/skills/' },
  { title: '技能格式', desc: 'Markdown 文件，包含 frontmatter 元数据和指令' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">扩展与技能</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          扩展是 TypeScript 模块，可以扩展 Pi 的行为。它们可以订阅生命周期事件、注册自定义工具、添加命令等。
        </p>
      </div>

      <!-- Quick Start -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">快速开始</h2>
        <p class="text-surface-300 mb-4">
          创建 <code class="text-brand-400">~/.pi/agent/extensions/my-extension.ts</code>：
        </p>
        <CodeBlock :code="quickStartCode" language="typescript" filename="my-extension.ts" />
      </section>

      <!-- Extension Locations -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">扩展位置</h2>
        <div class="space-y-3">
          <div v-for="loc in extensionLocations" :key="loc.path" class="glass-card p-4 flex items-center justify-between">
            <code class="text-brand-400 text-sm">{{ loc.path }}</code>
            <span class="text-surface-400 text-sm">{{ loc.desc }}</span>
          </div>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          放置在自动发现位置的扩展可以通过 <code class="text-brand-400">/reload</code> 热重载。
        </p>
      </section>

      <!-- Capabilities -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">核心能力</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="cap in capabilities" :key="cap.title" class="glass-card p-4">
            <h4 class="font-semibold text-surface-100 mb-1">{{ cap.title }}</h4>
            <p class="text-surface-400 text-sm">{{ cap.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Events -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">事件系统</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">事件</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events" :key="event.name" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ event.name }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ event.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Use Cases -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">示例用例</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="useCase in useCases" :key="useCase.title" class="glass-card p-4">
            <h4 class="font-semibold text-surface-100 text-sm mb-1">{{ useCase.title }}</h4>
            <p class="text-surface-400 text-xs">{{ useCase.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">技能</h2>
        <p class="text-surface-300 mb-4">
          技能是 Agent Skills，用于可复用的按需能力。它们提供渐进式披露，不会破坏提示缓存。
        </p>
        <div class="space-y-4">
          <div v-for="skill in skills" :key="skill.title" class="glass-card p-4">
            <h4 class="font-semibold text-surface-100 mb-1">{{ skill.title }}</h4>
            <p class="text-surface-400 text-sm">{{ skill.desc }}</p>
          </div>
        </div>
      </section>

      <!-- ExtensionContext -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">ExtensionContext API</h2>
        <p class="text-surface-300 mb-4">
          通过 <code class="text-brand-400">ctx</code> 对象访问 Pi 的功能：
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="glass-card p-3">
            <code class="text-brand-400 text-sm">ctx.ui</code>
            <p class="text-surface-400 text-xs mt-1">用户交互（select、confirm、input、notify）</p>
          </div>
          <div class="glass-card p-3">
            <code class="text-brand-400 text-sm">ctx.sessionManager</code>
            <p class="text-surface-400 text-xs mt-1">会话管理</p>
          </div>
          <div class="glass-card p-3">
            <code class="text-brand-400 text-sm">ctx.model / ctx.modelRegistry</code>
            <p class="text-surface-400 text-xs mt-1">模型信息</p>
          </div>
          <div class="glass-card p-3">
            <code class="text-brand-400 text-sm">ctx.compact()</code>
            <p class="text-surface-400 text-xs mt-1">触发上下文压缩</p>
          </div>
          <div class="glass-card p-3">
            <code class="text-brand-400 text-sm">ctx.reload()</code>
            <p class="text-surface-400 text-xs mt-1">重载扩展</p>
          </div>
          <div class="glass-card p-3">
            <code class="text-brand-400 text-sm">ctx.abort()</code>
            <p class="text-surface-400 text-xs mt-1">中止当前执行</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
