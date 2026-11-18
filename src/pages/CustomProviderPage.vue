<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const choose = [
  { need: '为受支持 API 添加模型', use: 'models.json' },
  { need: '修改已有提供商的端点或请求头', use: 'models.json 或很小的提供商扩展' },
  { need: '动态发现模型', use: '带 refreshModels 的提供商' },
  { need: '添加 /login 流程', use: '带原生或旧版 OAuth 配置的提供商' },
  { need: '实现不受支持的传输协议', use: '带 stream 或 streamSimple 的提供商' },
]

const redirectCode = `import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerProvider("anthropic", {
    baseUrl: "https://gateway.example.com/anthropic",
    headers: {
      "X-Gateway-Key": "$GATEWAY_API_KEY",
    },
  });
}`

const endpointCode = `import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerProvider("acme", {
    name: "Acme AI",
    baseUrl: "https://api.acme.example/v1",
    apiKey: "$ACME_API_KEY",
    api: "openai-completions",
    models: [
      {
        type: "chat",
        id: "acme-chat",
        name: "Acme Chat",
        reasoning: false,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 128000,
        maxTokens: 8192,
      },
    ],
  });
}`

const mixedCode = `pi.registerProvider("media-tools", {
  apiKey: "$MEDIA_TOOLS_API_KEY",
  models: [
    {
      type: "image",
      id: "image-v1",
      name: "Image V1",
      api: "media-images",
      baseUrl: "https://media.example.com/v1",
      input: ["text"],
      output: ["image"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    {
      type: "classifier",
      id: "classifier-v1",
      name: "Classifier V1",
      api: "media-classifier",
      baseUrl: "https://media.example.com/v1",
      input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 64000,
    },
  ],
  images: {
    "media-images": { generateImages: async (model, context, options) => result },
  },
  classifiers: {
    "media-classifier": { classify: async (model, context, options) => result },
  },
});`

const keySyntax = [
  { syntax: '$NAME 与 ${NAME}', meaning: '读取环境变量' },
  { syntax: '!command（前导）', meaning: '使用命令输出' },
  { syntax: '$$', meaning: '输出字面量 $' },
  { syntax: '$!', meaning: '输出字面量前导 !' },
]

const streamSteps = [
  '创建带 provider、model、时间戳、pending stop reason、内容与归零用量的 assistant 消息。',
  '请求准备成功后在内容事件之前发出一个 start 事件。',
  '边更新消息边发出配对的文本、思考与工具调用事件。',
  '完成用量、成本、内容与 stop reason。',
  '恰好发出一个终止 done 或 error 事件并关闭流。',
  '把取消转换成 aborted 结果。',
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">自定义提供商</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          提供商扩展把 Pi 连接到需要自定义认证、模型发现、请求处理或流式实现的模型服务。
          如果服务已经使用受支持的 API，请改用
          <code class="text-brand-400">models.json</code> 配置。提供商扩展运行在 Pi 内部，
          可以查看凭证、提示、工具定义、模型响应与用量，应视为受信任代码，避免记录密钥或提供商负载。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择最小的集成方式</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">需求</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">使用</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in choose" :key="c.need" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ c.need }}</td>
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ c.use }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          提供商扩展就是一种扩展，因此遵循相同的加载、信任、重载与错误行为。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">注册提供商</h2>
        <p class="text-surface-300 text-sm mb-3">
          在扩展工厂中调用 <code class="text-brand-400">pi.registerProvider()</code>。Pi 会在启动继续之前等待异步工厂，
          因此在那里注册的提供商可用于启动时的模型选择与 <code class="text-brand-400">pi --list-models</code>。
          注册有两种形式：注册来自 <code class="text-brand-400">@earendil-works/pi-ai</code> 的完整
          <code class="text-brand-400">Provider</code>，具备原生认证、过滤、发现、刷新与流式行为；
          或用 <code class="text-brand-400">ProviderConfig</code> 注册提供商名，即现有扩展使用的旧版配置形式。
          新的集成若不止是静态端点与模型元数据，优先使用完整提供商。Pi 会把
          <code class="text-brand-400">models.json</code> 覆盖层组合在已注册的原生提供商之上。
        </p>
        <p class="text-surface-300 text-sm mb-3">
          仅为已有提供商注册 <code class="text-brand-400">baseUrl</code> 或
          <code class="text-brand-400">headers</code> 会保留其内置模型；在旧版形式中提供
          <code class="text-brand-400">models</code> 会替换该提供商在 chat、image 与 classifier 操作中的模型。
          省略 <code class="text-brand-400">type</code> 表示 <code class="text-brand-400">"chat"</code>；
          图像与分类模型需要显式判别字段，并通过 <code class="text-brand-400">images</code>、
          <code class="text-brand-400">classifiers</code> 按 <code class="text-brand-400">api</code> 值提供实现。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">重定向已有提供商</h2>
        <p class="text-surface-300 text-sm mb-3">
          只注册需要改变的字段，这样会保留提供商的内置目录、认证、API 实现与兼容设置：
        </p>
        <CodeBlock :code="redirectCode" language="typescript" />
        <p class="text-surface-400 text-sm mt-3">
          这种形式适用于保留上游协议的代理或网关。不要把内置模型列表复制进扩展，那会把小小的端点覆盖
          变成容易漂移的目录替换。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">注册兼容端点</h2>
        <p class="text-surface-300 text-sm mb-3">
          服务实现了受支持协议但有自己模型目录时，注册端点以及该服务实际暴露的模型：
        </p>
        <CodeBlock :code="endpointCode" language="typescript" />
        <p class="text-surface-300 text-sm mt-4">
          不需要可执行扩展行为时优先用 <code class="text-brand-400">models.json</code>；当注册依赖运行时发现、
          自定义认证或与其他扩展功能共享代码时再用扩展。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">注册混合操作模型</h2>
        <p class="text-surface-300 text-sm mb-3">混合操作提供商可以把非 chat 模型及其实现一起注册：</p>
        <CodeBlock :code="mixedCode" language="typescript" />
        <p class="text-surface-300 text-sm mt-3">
          模型级 <code class="text-brand-400">baseUrl</code> 优先于提供商端点。未提供
          <code class="text-brand-400">models</code> 列表时，每种操作的内置模型都会保留。
          不同操作中相同的模型 ID 仍然彼此独立，包括各自的模型级请求头。
          初始扩展加载之后再发起的调用立即生效；用
          <code class="text-brand-400">pi.unregisterProvider()</code> 移除动态提供商并恢复被替换的内置行为。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">提供认证</h2>
        <p class="text-surface-300 text-sm mb-3">
          静态提供商可以从字面量、环境变量插值或命令解析 API Key，语法与
          <code class="text-brand-400">models.json</code> 相同：
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">语法</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">含义</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in keySyntax" :key="k.syntax" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ k.syntax }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ k.meaning }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          集成需要存储凭证、自定义解析、提供商作用域环境或多登录方式时，使用原生提供商认证。
          OAuth 提供商提供显示名、登录流程、token 刷新与 access token 解析，注册后出现在
          <code class="text-brand-400">/login</code> 中，Pi 把返回的凭证存到
          <code class="text-brand-400">~/.pi/agent/auth.json</code>。OAuth 回调与 UI 无关，可以打开授权 URL、
          显示设备码、报告进度、请求输入或让用户选择登录方式；网络请求期间要尊重取消与传入的 abort signal。
          在设备码界面按 Enter（<code class="text-brand-400">tui.select.confirm</code>）可打开登录 URL 并复制代码，
          提供商可用 <code class="text-brand-400">openBrowserOnConfirm: false</code> 或
          <code class="text-brand-400">copyCodeOnConfirm: false</code> 禁用其中任一动作。
          永远不要把 access token、refresh token、授权头或完整提供商响应写入普通日志。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">提供与刷新模型</h2>
        <p class="text-surface-300 text-sm">
          每个模型需要 ID、显示名、输入能力与成本元数据。chat 与 classifier 模型还需要上下文窗口，
          chat 模型需要输出上限与推理支持，图像模型声明输出模态。除非某个模型需要覆盖，API 实现应在提供商级别选择。
          当 Pi 应保持空闲提示缓存热度时，把 <code class="text-brand-400">promptCache.short</code> 或
          <code class="text-brand-400">promptCache.long</code> 设为该提供商尽力而为的缓存存活秒数；
          不设置即为该保留层级禁用缓存预热。兼容标志描述受支持 API 中已验证的差异，
          不要仅凭端点声称兼容就开启，应针对实际服务器确认请求字段与响应行为。
          可用目录来自在线服务时使用 <code class="text-brand-400">refreshModels</code>，并把
          <code class="text-brand-400">context.signal</code> 传给阻塞 I/O，以便调用方取消刷新。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          两种注册形式的刷新契约不同：完整 <code class="text-brand-400">Provider</code> 不返回任何值，
          而是调用 <code class="text-brand-400">context.publish({ update })</code> 安装由提供商持有的模型状态，
          随后其同步 <code class="text-brand-400">getModels()</code> 暴露最新列表；
          旧版 <code class="text-brand-400">ProviderConfig.refreshModels</code> 返回混合操作的模型定义，
          Pi 用返回列表替换该注册的在线模型并应用请求的持久化。只有需要跨运行保留的目录数据才持久化：
          llama.cpp 这类在线服务可以只更新内存列表，远程目录则可以保留快照用于离线启动。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">复用受支持的流式 API</h2>
        <p class="text-surface-300 text-sm">
          提供商协议匹配时应使用 Pi AI 的 API 实现。受支持的实现覆盖 Anthropic Messages、
          OpenAI Chat Completions 与 Responses、Google Generative AI 与 Vertex、Azure OpenAI Responses、
          Mistral Conversations 与 Bedrock Converse。提供商仍可自定义认证、base URL、请求头、模型过滤与发现，
          同时把请求转换与流式实现交给现有 API。这比复制流实现更安全，因为它保留 Pi 的消息转换、工具处理、
          用量核算、取消与兼容行为。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">实现自定义流式</h2>
        <p class="text-surface-300 text-sm mb-3">
          只有当现有 API 实现无法表达该服务时才实现 <code class="text-brand-400">streamSimple</code>，
          并先研究 <code class="text-brand-400">packages/ai/src/api</code> 下的实现。流接收规范化的
          <code class="text-brand-400">TranscriptContext</code>：系统提示与工具声明位于转录的系统消息中，
          因此要用 <code class="text-brand-400">getCurrentSystemPrompt(context.messages)</code> 与
          <code class="text-brand-400">getCurrentTools(context.messages)</code> 读取；支持中途系统消息的模型可以就地接收，
          否则调用 <code class="text-brand-400">collapseSystemMessages(context)</code> 把后续系统消息折叠到首条。
        </p>
        <p class="text-surface-300 text-sm mb-2">自定义流必须：</p>
        <ol class="space-y-1.5 text-surface-300 text-sm list-decimal list-inside">
          <li v-for="s in streamSteps" :key="s">{{ s }}</li>
        </ol>
        <p class="text-surface-300 text-sm mt-3">
          请求准备可能在 <code class="text-brand-400">start</code> 之前失败，此时流可以直接以
          <code class="text-brand-400">error</code> 终止；缺少请求认证也可能在返回流之前同步抛出。
          内容索引指向 assistant 消息中的块：先更新块，再发出暴露该状态
          <code class="text-brand-400">partial</code> 字段的事件；工具调用参数在
          <code class="text-brand-400">toolcall_end</code> 时必须包含有效解析后的输入。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          流还必须遵守通过 <code class="text-brand-400">SimpleStreamOptions</code> 传入的请求插桩：
          发送提供商请求前调用 <code class="text-brand-400">options.onPayload</code> 并使用其返回的替换负载；
          收到响应后、消费响应体前调用 <code class="text-brand-400">options.onResponse</code>；
          每个解析出的提供商事件在规范化之前等待
          <code class="text-brand-400">options.onProviderStreamEvent?.(providerEvent, model)</code>；
          并透传 abort signal 与提供商作用域环境。这些钩子支撑扩展的请求检查、响应头事件与提供商流观察，
          忽略它们会让提供商行为与 Pi 内置提供商不一致。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">报告失败与用量</h2>
        <p class="text-surface-300 text-sm">
          设置具体的终止 stop reason。错误与中止消息需要
          <code class="text-brand-400">errorMessage</code>；成功消息需要准确的输入、输出、缓存、总 token 与成本值。
          Pi 能对可识别的上下文溢出错误进行压缩与重试：若服务使用未知消息，只在受保护的
          <code class="text-brand-400">message_end</code> 处理器里把该提供商的溢出响应规范化为
          <code class="text-brand-400">context_length_exceeded</code>。不要把速率限制或临时提供商故障改写为上下文溢出，
          那些失败应走 Pi 的正常重试行为。
        </p>
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">测试集成</h2>
        <p class="text-surface-300 text-sm mb-2">至少测试：</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-surface-300">
          <p v-for="t in ['普通与空文本响应', '工具调用与工具结果', '受支持时的图像输入与图像工具结果', '用量与成本核算', '中止行为', '上下文溢出', '畸形或部分流', 'Unicode 边界', '跨提供商会话交接', '认证刷新与取消']" :key="t" class="flex items-start gap-2">
            <span class="text-brand-400 mt-0.5">•</span><span>{{ t }}</span>
          </p>
        </div>
        <p class="text-surface-300 text-sm mt-3">
          <code class="text-brand-400">packages/ai/test</code> 下的提供商测试定义了内置提供商应满足的行为，
          应改编相关测试套件，而不只依赖手工提示。开发时直接运行扩展，稳定后移到可发现的扩展位置，
          或通过 <router-link to="/packages" class="text-brand-400 hover:text-brand-300">Pi 包</router-link> 分发。
          在活动会话中修改已发现的提供商扩展后运行 <code class="text-brand-400">/reload</code>。
        </p>
      </section>
    </div>
  </div>
</template>
