<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const quickStartCode = `import { AuthStorage, createAgentSession, ModelRegistry, SessionManager } from "@earendil-works/pi-coding-agent";

// 设置凭证存储和模型注册表
const authStorage = AuthStorage.create();
const modelRegistry = ModelRegistry.create(authStorage);

const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
  authStorage,
  modelRegistry,
});

session.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

await session.prompt("What files are in the current directory?");`

const customSessionCode = `import { createAgentSession, SessionManager } from "@earendil-works/pi-coding-agent";

// 最小化：使用 DefaultResourceLoader 的默认值
const { session } = await createAgentSession();

// 自定义：覆盖特定选项
const { session } = await createAgentSession({
  model: myModel,
  tools: ["read", "bash"],
  sessionManager: SessionManager.inMemory(),
});`

const useCases = [
  { title: '自定义 UI', desc: '构建 Web、桌面或移动应用界面' },
  { title: '应用集成', desc: '将 Agent 功能集成到现有应用中' },
  { title: '自动化流水线', desc: '创建带 Agent 推理的自动化流水线' },
  { title: '子 Agent 工具', desc: '构建生成子 Agent 的自定义工具' },
  { title: '程序化测试', desc: '以编程方式测试 Agent 行为' },
]

const runModes = [
  { name: 'InteractiveMode', desc: '完整的 TUI 体验，与 CLI 相同' },
  { name: 'runPrintMode', desc: '非交互打印模式，用于脚本' },
  { name: 'runRpcMode', desc: 'RPC 模式，用于进程间通信' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">SDK</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          SDK 提供对 Pi Agent 能力的编程访问。用于在其他应用中嵌入 Pi、构建自定义界面或集成自动化工作流。
        </p>
      </div>

      <!-- Use Cases -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">示例用例</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="uc in useCases" :key="uc.title" class="glass-card p-4">
            <h4 class="font-semibold text-surface-100 text-sm mb-1">{{ uc.title }}</h4>
            <p class="text-surface-400 text-xs">{{ uc.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Quick Start -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">快速开始</h2>
        <CodeBlock :code="quickStartCode" language="typescript" filename="sdk-example.ts" />
      </section>

      <!-- Installation -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">安装</h2>
        <CodeBlock code="npm install @earendil-works/pi-coding-agent" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          SDK 包含在主包中，无需单独安装。
        </p>
      </section>

      <!-- Core Concepts -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">核心概念</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">createAgentSession()</h3>
            <p class="text-surface-300 mb-3">
              用于创建单个 AgentSession 的主要工厂函数。使用 ResourceLoader 提供扩展、技能、提示模板、主题和上下文文件。
            </p>
            <CodeBlock :code="customSessionCode" language="typescript" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">AgentSession</h3>
            <p class="text-surface-300">
              会话对象，提供 prompt() 方法发送消息，subscribe() 方法监听事件。
            </p>
          </div>
        </div>
      </section>

      <!-- Run Modes -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">运行模式</h2>
        <div class="space-y-4">
          <div v-for="mode in runModes" :key="mode.name" class="glass-card p-4">
            <h4 class="font-semibold text-surface-100 mb-1">{{ mode.name }}</h4>
            <p class="text-surface-400 text-sm">{{ mode.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Links -->
      <section class="glass-card p-6 glow-border">
        <h3 class="text-lg font-semibold text-surface-100 mb-3">更多资源</h3>
        <ul class="space-y-2 text-surface-300 text-sm">
          <li>
            <a href="https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/sdk" target="_blank" class="text-brand-400 hover:text-brand-300">
              SDK 示例 →
            </a>
          </li>
          <li>
            <a href="https://github.com/OpenClaw/OpenClaw" target="_blank" class="text-brand-400 hover:text-brand-300">
              OpenClaw 真实世界集成示例 →
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
