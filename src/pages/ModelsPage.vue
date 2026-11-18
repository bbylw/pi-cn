<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const connections = [
  { have: "受支持的订阅", setup: "通过 /login 登录" },
  { have: "提供商 API Key", setup: "通过 /login 存储，或设置环境变量" },
  { have: "本地 GGUF 模型", setup: "将 Pi 连接到 llama.cpp router" },
  { have: "OpenAI / Anthropic / Google 兼容端点", setup: "添加到 models.json" },
  { have: "自定义协议或认证流程的提供商", setup: "编写或安装提供商扩展" },
];

const resolutionOrder = [
  "运行时 --api-key 参数",
  "auth.json 中保存的凭证",
  "models.json 中的 apiKey",
  "提供商的环境变量或云端环境凭证",
];

const compatibleEndpoint = `{
  "$schema": "https://pi.dev/schemas/models.schema.json",
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        { "id": "qwen2.5-coder:7b" }
      ]
    }
  }
}`;

const proxyCode = `{
  "providers": {
    "anthropic": { "baseUrl": "https://proxy.example.com/v1" }
  }
}`;

const imageLimits = `{
  "id": "vision-model",
  "input": ["text", "image"],
  "inputLimits": {
    "images": {
      "resize": {
        "maxWidth": 1568,
        "maxHeight": 1568,
        "maxBytes": 524288,
        "jpegQuality": 75
      }
    }
  }
}`;

const samplingParams = `{
  "id": "qwen-thinking-model",
  "reasoning": true,
  "samplingParams": {
    "temperature": 1.0,
    "top_p": 0.95
  },
  "samplingParamsByThinkingLevel": {
    "off": { "temperature": 0.7, "top_p": 0.8 },
    "high": { "top_k": 20 }
  }
}`;

const classifyCode = `const jev = await models.getModelOfType("classifier", "typesafe", "jev-latest");
const result = await models.classify(jev, {
  state: { message: "The change works, thanks." },
  questions: {
    approved: {
      type: "bool",
      instructions: "Does the user approve of the result?",
      criteria: { true: "Approval", false: "No approval" },
    },
  },
});
return result.answers;`;

const troubleshooting = [
  {
    q: "模型没有出现",
    a: "确认其提供商有可用的认证。自定义模型可以从 models.json 加载，但在 Pi 能解析到凭证之前不会出现在 /model 中。llama.cpp 只显示 router 当前已加载的模型。",
  },
  {
    q: "认证只在某个 shell 中有效",
    a: "检查 Key 是否来自环境变量而非 auth.json。环境变量必须存在于启动 Pi 的进程中。",
  },
  {
    q: "远程机器上登录会打开浏览器",
    a: "改用提供商的无头认证流程。部分提供商允许你把最终的重定向 URL 或授权码粘贴回 Pi。",
  },
  {
    q: "兼容端点拒绝请求",
    a: "检查 models.json 中的 API 类型和兼容性设置。上游服务器必须支持相应的请求字段和行为。",
  },
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">选择模型</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          对内置提供商，先用 <code class="text-brand-400">/login</code> 登录，再用
          <code class="text-brand-400">/model</code> 选择模型。
          只有在 Pi 尚未包含你需要的提供商或端点时，才需要自定义模型配置。
        </p>
      </div>

      <!-- Connections -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择连接方式</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">你拥有的</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">推荐的设置</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in connections" :key="c.have" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ c.have }}</td>
                <td class="py-3 px-4 text-surface-300">{{ c.setup }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          在
          <a
            href="https://pi.dev/models"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 hover:text-brand-300"
            >模型目录</a
          >
          中查看当前的提供商、模型 ID、能力、上下文限制和价格。Pi 自带模型目录，也可以叠加 pi.dev
          上更新的目录数据；缓存的目录数据离线可用，运行
          <code class="text-brand-400">pi update --models</code> 可强制刷新。
        </p>
      </section>

      <!-- Authenticate -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">认证</h2>
        <p class="text-surface-300 mb-3">
          运行 <code class="text-brand-400">/login</code> 并选择提供商。Pi 将凭证保存在
          <code class="text-brand-400">~/.pi/agent/auth.json</code> 中，使用
          <code class="text-brand-400">/logout</code> 删除。
          你也可以通过提供商的环境变量提供 API Key，这适合 CI 等不希望写入凭证的环境。
        </p>
        <p class="text-surface-300 mb-3">当配置了多个凭证来源时，Pi 的解析顺序为：</p>
        <ol class="space-y-2 mb-3">
          <li v-for="(step, i) in resolutionOrder" :key="step" class="flex items-center gap-3">
            <span
              class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-medium shrink-0"
              >{{ i + 1 }}</span
            >
            <span class="text-surface-200 text-sm">{{ step }}</span>
          </li>
        </ol>
        <p class="text-surface-400 text-sm">
          提供商扩展可以定义自己的认证行为。请妥善保管
          <code class="text-brand-400">auth.json</code> 与凭证命令；在信任项目之前，先阅读
          <router-link to="/security" class="text-brand-400 hover:text-brand-300">安全</router-link>
          说明。
        </p>
      </section>

      <!-- Select a model -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择模型</h2>
        <ul class="space-y-2 text-surface-300">
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              ><code class="text-brand-400">/model</code>
              搜索可用模型，只显示认证可用的提供商下的模型。<code class="text-brand-400"
                >Ctrl+S</code
              >
              将模型保存为新会话默认值。</span
            >
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              ><code class="text-brand-400">/thinking</code> 选择当前模型的思考级别，<code
                class="text-brand-400"
                >Ctrl+S</code
              >
              保存启动级别。Pi 只提供该模型支持的级别。</span
            >
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              ><code class="text-brand-400">Ctrl+P</code> 循环切换可用模型；<code
                class="text-brand-400"
                >/scoped-models</code
              >
              控制循环范围并保存选择，也可以在设置中用模型模式配置。</span
            >
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              >会话会记录模型和思考级别的变化，恢复会话时一并恢复，但不改变新会话的默认值。</span
            >
          </li>
        </ul>
      </section>

      <!-- Local models -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">连接本地模型</h2>
        <p class="text-surface-300 mb-3">
          Pi 直接集成 llama.cpp router。router 会发现 GGUF 文件并按需加载模型；<code
            class="text-brand-400"
            >/llama</code
          >
          管理 router， <code class="text-brand-400">/model</code> 选择已加载的模型。
        </p>
        <p class="text-surface-300">
          对 Ollama、LM Studio、vLLM、SGLang 等兼容服务器，在
          <code class="text-brand-400">models.json</code> 中配置兼容端点即可。
        </p>
      </section>

      <!-- Compatible endpoint -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">配置兼容端点</h2>
        <p class="text-surface-300 mb-3">
          当端点使用 Pi 已支持的 API 时，使用
          <code class="text-brand-400">~/.pi/agent/models.json</code>：
        </p>
        <CodeBlock :code="compatibleEndpoint" language="json" filename="~/.pi/agent/models.json" />
        <p class="text-surface-400 text-sm mt-3">
          示例中的假 Key 只是让模型对 Pi 可用，Ollama 会忽略它。对需要认证的端点，<code
            class="text-brand-400"
            >apiKey</code
          >
          和 header 值支持 <code class="text-brand-400">$NAME</code> /
          <code class="text-brand-400">${NAME}</code> 环境变量插值、字面值，或以
          <code class="text-brand-400">!command</code> 开头的命令（请求时执行，不缓存）。<code
            class="text-brand-400"
            >$$</code
          >
          与 <code class="text-brand-400">$!</code> 分别产生字面量
          <code class="text-brand-400">$</code> 和 <code class="text-brand-400">!</code>。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          打开 <code class="text-brand-400">/model</code> 会重新加载该文件。<code
            class="text-brand-400"
            >models</code
          >
          条目添加或替换同 ID 的模型；
          <code class="text-brand-400">modelOverrides</code>
          修改已有内置或扩展模型元数据而不替换模型列表，未知 ID 会被忽略。
          要让内置提供商走代理，只设置它的 <code class="text-brand-400">baseUrl</code>：
        </p>
        <CodeBlock :code="proxyCode" language="json" />
        <p class="text-surface-400 text-sm mt-3">
          完整的字段列表见上游的 Models Configuration 参考。
        </p>
      </section>

      <!-- Input limits and sampling -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">描述模型输入与采样</h2>
        <p class="text-surface-300 mb-3">
          用 <code class="text-brand-400">inputLimits.images.resize</code> 控制 Pi
          在写入会话历史前如何编码新的图片附件、<code class="text-brand-400">read</code>
          结果和工具结果图片：
        </p>
        <CodeBlock :code="imageLimits" language="json" />
        <p class="text-surface-400 text-sm mt-3">
          省略的 resize 字段使用保守默认值：2000×2000 像素、编码后 4.5 MiB、JPEG 质量
          80。图片只编码一次，切换模型不会重写历史图片。
        </p>
        <p class="text-surface-300 text-sm mt-4 mb-3">
          使用
          <code class="text-brand-400">promptCache</code> 声明提供商尽力而为的缓存时长（秒），用于
          <code class="text-brand-400">short</code> 或
          <code class="text-brand-400">long</code> 保留层级；OpenAI 兼容 API
          还支持按思考级别的采样参数：
        </p>
        <CodeBlock :code="samplingParams" language="json" />
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">samplingParamsByThinkingLevel</code> 使用 Pi
          的思考级别键（<code class="text-brand-400">off</code>、<code class="text-brand-400"
            >minimal</code
          >、<code class="text-brand-400">low</code>、<code class="text-brand-400">medium</code
          >、<code class="text-brand-400">high</code>、<code class="text-brand-400">xhigh</code
          >、<code class="text-brand-400">max</code>）。 Pi 先收敛不支持的级别，再依次合并模型
          <code class="text-brand-400">samplingParams</code
          >、生效级别的覆盖值和请求级参数，后者按键覆盖前者。
          这些字段只对 <code class="text-brand-400">openai-completions</code>、<code
            class="text-brand-400"
            >openai-responses</code
          >
          和 <code class="text-brand-400">azure-openai-responses</code> 生效。
        </p>
      </section>

      <!-- Classifier and image models -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">分类器与图像模型</h2>
        <p class="text-surface-300 mb-3">
          分类器模型不聊天，而是对 JSON 状态回答有类型的问题：多选一、是/否或打分，并给出概率。Pi
          内置 TypeSafe 的 Jev、Cloudflare 的 Clef 系列、OpenAI 的 GPT-6 Luna（Decisions API）以及
          GitHub Copilot 的 Microsoft-Decision-1。
          图像模型（如 OpenRouter 的
          <code class="text-brand-400">google/gemini-2.5-flash-image</code
          >）从提示和可选输入图片生成图片。
        </p>
        <p class="text-surface-300 mb-3">
          两类模型都不出现在 <code class="text-brand-400">/model</code> 中，而是通过
          <code class="text-brand-400">codemode</code> 工具访问。
          <code class="text-brand-400">codemode</code> 默认关闭，除非 MCP 服务器启用了它；在设置中用
          <code class="text-brand-400">"defaultTools": ["+codemode"]</code> 打开。
        </p>
        <CodeBlock :code="classifyCode" language="typescript" />
        <p class="text-surface-400 text-sm mt-3">
          扩展可以直接通过 <code class="text-brand-400">ctx.modelRegistry.classify()</code> 和
          <code class="text-brand-400">ctx.modelRegistry.generateImages()</code> 使用这些模型，无需
          codemode。
        </p>
      </section>

      <!-- Custom provider -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">添加自定义提供商</h2>
        <p class="text-surface-300">当提供商需要自定义流式输出、模型发现或认证行为时，使用扩展。</p>
      </section>

      <!-- Troubleshooting -->
      <section class="mb-12 glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-4">故障排查</h2>
        <dl class="space-y-4">
          <div v-for="item in troubleshooting" :key="item.q">
            <dt class="text-surface-100 font-medium text-sm">{{ item.q }}</dt>
            <dd class="text-surface-400 text-sm mt-1">{{ item.a }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>
