<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const minimalCode = `import { createAgentSession } from "@earendil-works/pi-coding-agent";

const { session } = await createAgentSession();

try {
  await session.prompt("What files are in the current directory?");
  console.log(session.getLastAssistantText());
} finally {
  session.dispose();
}`

const inMemoryCode = `import { createAgentSession, SessionManager } from "@earendil-works/pi-coding-agent";

const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
});`

const subscribeCode = `const unsubscribe = session.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

try {
  await session.prompt("Explain this repository");
} finally {
  unsubscribe();
}`

const examples = [
  { name: 'Minimal', purpose: '创建、提示、观察并释放一个会话' },
  { name: 'Custom model', purpose: '选择模型与思考级别' },
  { name: 'System prompt', purpose: '替换或追加系统提示' },
  { name: 'Skills', purpose: '发现、过滤和添加技能' },
  { name: 'Tools', purpose: '选择内置工具及其工作目录' },
  { name: 'Extensions', purpose: '加载基于文件和内联的扩展' },
  { name: 'Context files', purpose: '添加或替换项目指令' },
  { name: 'Prompt templates', purpose: '添加文件式提示模板' },
  { name: 'Credentials', purpose: '配置凭证与模型存储' },
  { name: 'Settings', purpose: '提供基于文件或内存的设置' },
  { name: 'Sessions', purpose: '控制会话持久化与恢复' },
  { name: 'Full control', purpose: '替换默认的发现与状态服务' },
  { name: 'Session runtime', purpose: '安全地替换活动会话' },
  { name: 'Codemode and MCP', purpose: '添加 codemode、tool_search 和 MCP 扩展' },
]

const boundaries = [
  { key: 'modelRuntime / model / thinkingLevel / scopedModels', desc: '控制模型访问与选择' },
  { key: 'settingsManager', desc: '提供合并后的设置或内存配置' },
  { key: 'sessionManager', desc: '提供持久化或内存中的对话历史' },
  { key: 'resourceLoader', desc: '提供扩展、技能、提示模板、主题和上下文文件' },
  { key: 'tools / noTools / excludeTools / customTools', desc: '控制启用的工具集' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">SDK</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          <code class="text-brand-400">@earendil-works/pi-coding-agent</code> 把 Pi 嵌入 Node.js 或 Bun 进程，
          以 TypeScript 直接访问命令行应用使用的 agent、会话、工具、模型和资源。
          适合进程内集成；需要与语言无关或隔离的子进程时，使用 CLI 集成（打印、JSON 或 RPC 模式）。
        </p>
      </div>

      <!-- Minimal -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">最小示例</h2>
        <CodeBlock :code="minimalCode" language="typescript" />
        <p class="text-surface-400 text-sm mt-3">
          这段代码使用工作目录、发现的资源、已保存的设置和已配置的凭证；<code class="text-brand-400">prompt()</code>
          在运行结束时 resolve。
        </p>
      </section>

      <!-- Session lifecycle -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">会话生命周期</h2>
        <p class="text-surface-300 mb-3">
          <code class="text-brand-400">createAgentSession()</code> 创建一个 <code class="text-brand-400">AgentSession</code>。
          会话拥有一次对话、它的模型与工具、排队消息、压缩状态和扩展运行时。
          通过 <code class="text-brand-400">session.messages</code>、<code class="text-brand-400">session.model</code>、
          <code class="text-brand-400">session.thinkingLevel</code>、<code class="text-brand-400">session.systemPrompt</code> 和
          <code class="text-brand-400">session.getActiveToolNames()</code> 读取当前状态。
          <code class="text-brand-400">session.systemPrompt</code> 是只读的，返回当前生效的系统提示，包括尚未发送给模型的改动。
        </p>

        <h3 class="text-lg font-semibold text-surface-100 mb-2 mt-4">会话存储</h3>
        <p class="text-surface-300 text-sm mb-3">
          会话默认持久化。<code class="text-brand-400">SessionManager</code> 拥有持久化或内存中的条目树并跟踪活动叶子；
          分支只改变叶子，不删除被放弃的分支。Pi 重建模型上下文时，由 manager 选择活动分支并应用压缩。
          manager 对最终模型上下文是权威来源：要恢复外部历史，请用包含这些条目的 manager 构造会话，
          直接给 <code class="text-brand-400">session.agent.state.messages</code> 赋值不会替换持久化上下文。
        </p>
        <CodeBlock :code="inMemoryCode" language="typescript" />
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">cwd</code> 选择用于项目资源发现、上下文文件、会话分组和内置工具路径的工作区；
          与 <code class="text-brand-400">process.cwd()</code> 不同时请显式传入。
          <code class="text-brand-400">session.dispose()</code> 会中止进行中的工作、让扩展上下文失效、断开与 agent 的连接并移除事件监听。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          <code class="text-brand-400">AgentSessionRuntime</code> 增加了 <code class="text-brand-400">newSession()</code>、
          <code class="text-brand-400">switchSession()</code>、<code class="text-brand-400">fork()</code> 和
          <code class="text-brand-400">importFromJsonl()</code>。每次操作都会替换活动的
          <code class="text-brand-400">AgentSession</code> 并为目标工作目录重建服务；运行时替换后，订阅属于旧的会话，必须重新绑定。
        </p>
      </section>

      <!-- Prompting -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">提示</h2>
        <p class="text-surface-300 mb-3">
          <code class="text-brand-400">prompt()</code> 在普通用户消息进入 agent 之前处理扩展命令并展开基于文件的提示模板。
          对被接受的 agent 运行，它在运行结束（含自动重试）后 resolve。
        </p>
        <p class="text-surface-300 mb-3">
          会话已在流式输出时发送的提示必须说明它应当转向当前运行还是跟随其后，不指定时 <code class="text-brand-400">prompt()</code>
          会拒绝而不是猜测。<code class="text-brand-400">steer()</code> 和 <code class="text-brand-400">followUp()</code>
          直接暴露这两种行为；输入被排队（包括被扩展转换后）时返回 <code class="text-brand-400">"queued"</code>，
          被扩展消费时返回 <code class="text-brand-400">"handled"</code>。
          <code class="text-brand-400">abort()</code> 停止当前操作并等待会话空闲，<code class="text-brand-400">waitForIdle()</code> 只等待。
        </p>
      </section>

      <!-- Events -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">订阅事件</h2>
        <p class="text-surface-300 mb-3">需要流式输出时，在提示之前订阅：</p>
        <CodeBlock :code="subscribeCode" language="typescript" />
        <p class="text-surface-400 text-sm mt-3">
          会话事件报告消息更新、工具执行、队列、压缩、重试和运行生命周期变化。
          <code class="text-brand-400">message_end</code> 包含权威的完整消息；<code class="text-brand-400">agent_end</code>
          标记一次底层 agent 运行的结束，但自动恢复或排队工作仍可能继续。
          需要知道 Pi 不会自动继续时，使用 <code class="text-brand-400">agent_settled</code>。
        </p>
      </section>

      <!-- Configure -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">配置会话</h2>
        <p class="text-surface-300 mb-3">
          没有覆盖时，工厂会创建 <code class="text-brand-400">ModelRuntime</code>、基于文件的
          <code class="text-brand-400">SettingsManager</code>、持久化的 <code class="text-brand-400">SessionManager</code>、
          <code class="text-brand-400">DefaultResourceLoader</code> 和已配置的默认工具。每个边界都可以显式提供：
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">选项</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">作用</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in boundaries" :key="b.key" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ b.key }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ b.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          想保留标准发现流程并做部分覆盖时使用 <code class="text-brand-400">DefaultResourceLoader</code>；
          主机完全掌握资源存储和发现时提供自定义 <code class="text-brand-400">ResourceLoader</code>。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          CLI 把 <code class="text-brand-400">codemode</code>、<code class="text-brand-400">tool_search</code> 和 MCP 作为内置扩展加载，
          SDK 会话不会。把 <code class="text-brand-400">createCodemodeExtension()</code>、
          <code class="text-brand-400">createToolSearchExtension()</code> 和 <code class="text-brand-400">createMcpExtension()</code>
          加入 <code class="text-brand-400">DefaultResourceLoader</code> 的 <code class="text-brand-400">extensionFactories</code>。
          MCP 扩展在 <code class="text-brand-400">session_start</code> 时连接服务器，因此要调用
          <code class="text-brand-400">session.bindExtensions()</code>。
        </p>
      </section>

      <!-- Examples -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">示例</h2>
        <p class="text-surface-400 text-sm mb-3">仓库中 <code class="text-brand-400">packages/coding-agent/examples/sdk/</code> 下的示例会随仓库一起类型检查：</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="e in examples" :key="e.name" class="glass-card p-3">
            <h4 class="text-surface-100 font-medium text-sm">{{ e.name }}</h4>
            <p class="text-surface-400 text-xs mt-0.5">{{ e.purpose }}</p>
          </div>
        </div>
      </section>

      <!-- Resources -->
      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">相关文档</h2>
        <ul class="space-y-2 text-surface-300 text-sm">
          <li><router-link to="/models" class="text-brand-400 hover:text-brand-300">选择模型</router-link> 与 <router-link to="/providers" class="text-brand-400 hover:text-brand-300">提供商</router-link> 说明模型选择与凭证。</li>
          <li><router-link to="/configuration" class="text-brand-400 hover:text-brand-300">配置</router-link> 与 <router-link to="/settings" class="text-brand-400 hover:text-brand-300">设置</router-link> 说明发现流程和每个设置。</li>
          <li><router-link to="/sessions" class="text-brand-400 hover:text-brand-300">会话与上下文</router-link> 说明会话行为与恢复。</li>
          <li><router-link to="/skills" class="text-brand-400 hover:text-brand-300">技能</router-link> 与 <router-link to="/extensions" class="text-brand-400 hover:text-brand-300">扩展</router-link> 说明可提供的资源。</li>
          <li><router-link to="/cli" class="text-brand-400 hover:text-brand-300">命令行</router-link> 说明打印、JSON 和 RPC 这几种进程外替代方案。</li>
        </ul>
      </section>
    </div>
  </div>
</template>
