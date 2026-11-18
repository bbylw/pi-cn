<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const apiKeys = [
  { provider: "Anthropic", env: "ANTHROPIC_API_KEY" },
  { provider: "Ant Ling", env: "ANT_LING_API_KEY" },
  { provider: "OpenAI", env: "OPENAI_API_KEY" },
  { provider: "DeepSeek", env: "DEEPSEEK_API_KEY" },
  { provider: "NVIDIA NIM", env: "NVIDIA_API_KEY" },
  { provider: "Google Gemini", env: "GEMINI_API_KEY" },
  { provider: "GitHub Copilot", env: "COPILOT_GITHUB_TOKEN" },
  { provider: "Mistral", env: "MISTRAL_API_KEY" },
  { provider: "Groq", env: "GROQ_API_KEY" },
  { provider: "Cerebras", env: "CEREBRAS_API_KEY" },
  { provider: "xAI", env: "XAI_API_KEY" },
  { provider: "OpenRouter", env: "OPENROUTER_API_KEY" },
  { provider: "Vercel AI Gateway", env: "AI_GATEWAY_API_KEY" },
  { provider: "ZAI Coding Plan（全球）", env: "ZAI_API_KEY" },
  { provider: "ZAI Coding Plan（中国）", env: "ZAI_CODING_CN_API_KEY" },
  { provider: "OpenCode Zen 与 Go", env: "OPENCODE_API_KEY" },
  { provider: "Radius", env: "RADIUS_API_KEY" },
  { provider: "TypeSafe（分类器模型）", env: "TYPESAFE_API_KEY" },
  { provider: "Hugging Face", env: "HF_TOKEN" },
  { provider: "Fireworks", env: "FIREWORKS_API_KEY" },
  { provider: "Together AI", env: "TOGETHER_API_KEY" },
  { provider: "Baseten", env: "BASETEN_API_KEY" },
  { provider: "Kimi For Coding", env: "KIMI_API_KEY" },
  { provider: "Meta", env: "META_API_KEY" },
  { provider: "MiniMax", env: "MINIMAX_API_KEY" },
  { provider: "MiniMax（中国）", env: "MINIMAX_CN_API_KEY" },
  { provider: "Moonshot AI", env: "MOONSHOT_API_KEY" },
  { provider: "Qwen Token Plan Team", env: "QWEN_TOKEN_PLAN_TEAM_API_KEY" },
  { provider: "Qwen Token Plan Team（中国）", env: "QWEN_TOKEN_PLAN_TEAM_CN_API_KEY" },
  { provider: "Qwen Token Plan Individual", env: "QWEN_TOKEN_PLAN_INDIVIDUAL_API_KEY" },
  { provider: "Qwen Token Plan Individual（中国）", env: "QWEN_TOKEN_PLAN_INDIVIDUAL_CN_API_KEY" },
  { provider: "小米 MiMo", env: "XIAOMI_API_KEY" },
  { provider: "小米 MiMo Token Plan（中国）", env: "XIAOMI_TOKEN_PLAN_CN_API_KEY" },
];

const envExample = `export ANTHROPIC_API_KEY=sk-ant-...
pi`;

const keyCommand = `{
  "anthropic": {
    "type": "api_key",
    "key": "!security find-generic-password -ws 'anthropic'"
  }
}`;

const cloudflareEnv = `{
  "cloudflare-workers-ai": {
    "type": "api_key",
    "key": "...",
    "env": {
      "CLOUDFLARE_ACCOUNT_ID": "account-id"
    }
  }
}`;

const radiusCode = `/login radius`;

const openrouterCode = `{
  "providers": {
    "openrouter": { "baseUrl": "https://us.openrouter.ai/api/v1" }
  }
}`;

const azureCode = `export AZURE_OPENAI_API_KEY=...
export AZURE_OPENAI_BASE_URL=https://your-resource.ai.azure.com
# 或者
export AZURE_OPENAI_RESOURCE_NAME=your-resource

# 部署名与模型 ID 不同时
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP=gpt-5.4=my-gpt-deployment

# 默认 v1
export AZURE_OPENAI_API_VERSION=2024-02-01`;

const bedrockCode = `# 命名 profile
export AWS_PROFILE=your-profile

# IAM 密钥
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
# 临时凭证需要
export AWS_SESSION_TOKEN=...

# Bedrock bearer token
export AWS_BEARER_TOKEN_BEDROCK=...

# profile 或 AWS SDK 配置未提供区域时
export AWS_REGION=us-west-2
# 也支持 AWS_DEFAULT_REGION`;

const cloudflareGatewayCode = `export CLOUDFLARE_API_KEY=...
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_GATEWAY_ID=...

export CLOUDFLARE_API_KEY=...
export CLOUDFLARE_ACCOUNT_ID=...   # Workers AI`;

const vertexCode = `# 使用 Google Cloud API Key
export GOOGLE_CLOUD_API_KEY=...

# 或使用 Application Default Credentials
export GOOGLE_CLOUD_PROJECT=your-project
# 也支持 GCLOUD_PROJECT
export GOOGLE_CLOUD_LOCATION=us-central1

gcloud auth application-default login`;
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">模型提供商</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          大多数托管提供商支持以下一种或两种认证方式：通过浏览器或设备流完成的 OAuth 登录，或提供
          API Key。
          用 <code class="text-brand-400">/login [provider]</code> 查看某个提供商支持的方式。 Amazon
          Bedrock 和 Google Vertex AI 还可以使用云端环境凭证。
        </p>
      </div>

      <!-- Interactive auth -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">交互式认证</h2>
        <p class="text-surface-300 mb-3">
          运行 <code class="text-brand-400">/login</code> 并选择提供商。Pi 引导你完成 OAuth 或 API
          Key 流程，并把凭证保存到 <code class="text-brand-400">~/.pi/agent/auth.json</code>。
        </p>
        <p class="text-surface-300 mb-3">
          在远程或无头机器上，OAuth 回调可能无法到达本地进程；按提示把最终的重定向 URL
          或授权码粘贴回 Pi。
          运行
          <code class="text-brand-400">/logout</code>
          并选择提供商可删除已保存的凭证，但这不会取消环境变量、
          删除 <code class="text-brand-400">models.json</code> 中的认证或在提供商侧撤销凭证。
        </p>
        <p class="text-surface-400 text-sm">
          <code class="text-brand-400">auth.json</code> 可能包含 API Key 和 OAuth
          令牌，请保持私密且不要提交到版本库。
        </p>
      </section>

      <!-- Env vars -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">
          使用环境变量中的 API Key
        </h2>
        <p class="text-surface-300 mb-3">
          环境变量适合 CI 以及任何不应存储 Key 的场景。在启动 Pi 之前设置：
        </p>
        <CodeBlock :code="envExample" language="bash" />
        <p class="text-surface-400 text-sm mt-3 mb-3">
          下表列出只有单个主 API Key
          变量的提供商；需要额外配置或支持环境凭证的提供商见下方“提供商专属配置”。
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">提供商</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">环境变量</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in apiKeys"
                :key="item.provider"
                class="border-b border-surface-800/50"
              >
                <td class="py-3 px-4 text-surface-100">{{ item.provider }}</td>
                <td class="py-3 px-4">
                  <code class="text-brand-400 text-xs">{{ item.env }}</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          Anthropic 还接受 <code class="text-brand-400">ANTHROPIC_OAUTH_TOKEN</code> 作为 API
          凭证，以及 <code class="text-brand-400">ANTHROPIC_AUTH_TOKEN</code> 作为 bearer
          认证。当设置了 <code class="text-brand-400">ANTHROPIC_FEDERATION_RULE_ID</code>、<code
            class="text-brand-400"
            >ANTHROPIC_ORGANIZATION_ID</code
          >
          和 <code class="text-brand-400">ANTHROPIC_IDENTITY_TOKEN_FILE</code> 且没有 Key
          时，Anthropic 使用工作负载身份联合。
        </p>
      </section>

      <!-- Key command -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">
          通过命令加载 API Key
        </h2>
        <p class="text-surface-300 mb-3">
          想使用密钥管理器又不把解析后的 Key 写到磁盘时，可以把
          <code class="text-brand-400">auth.json</code> 中提供商的
          <code class="text-brand-400">key</code> 设成以
          <code class="text-brand-400">!</code> 开头的命令：
        </p>
        <CodeBlock :code="keyCommand" language="json" filename="~/.pi/agent/auth.json" />
        <p class="text-surface-400 text-sm mt-3">
          Pi 在首次需要 Key
          时运行该命令，并在进程生命周期内缓存其标准输出。输出为空、超时或退出码非零时，Key
          保持未解析状态，
          直到 Pi 重启。
        </p>
      </section>

      <!-- Provider specific -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">提供商专属配置</h2>
        <p class="text-surface-300 mb-3">
          已保存的 API Key 凭证可以包含
          <code class="text-brand-400">env</code> 对象，其值对该提供商优先于进程环境：
        </p>
        <CodeBlock :code="cloudflareEnv" language="json" />

        <div class="mt-8 space-y-8">
          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">Radius</h3>
            <p class="text-surface-300 text-sm mb-2">
              Radius 是由 Pi 的开发者 Earendil Works 为 Pi
              打造的服务，提供带组织级控制和分析的可定制 AI gateway，
              以及用于分享创作产物的 artifacts。运行下面命令即可把 Radius
              添加为提供商，其模型会像其他提供商一样出现在
              <code class="text-brand-400">/model</code> 中。Radius 也提供 MCP 服务器，Pi
              可以替你管理它。
            </p>
            <CodeBlock :code="radiusCode" language="text" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">OpenRouter</h3>
            <p class="text-surface-300 text-sm mb-2">
              用 <code class="text-brand-400">/login openrouter</code> 或
              <code class="text-brand-400">OPENROUTER_API_KEY</code> 认证。
              使用 Key 时，Pi 只列出该 Key
              可用的聊天模型，并带上其上下文大小、最大输出和价格；这些数据来自 OpenRouter 的
              <code class="text-brand-400">/models/user</code> 端点。区域端点需要设置 base URL：
            </p>
            <CodeBlock :code="openrouterCode" language="json" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">Azure OpenAI</h3>
            <p class="text-surface-300 text-sm mb-2">
              提供商 ID 是 <code class="text-brand-400">azure</code>（原为
              <code class="text-brand-400">azure-openai-responses</code>），
              可用于 <code class="text-brand-400">auth.json</code>、<code class="text-brand-400"
                >models.json</code
              >、 <code class="text-brand-400">settings.json</code> 以及
              <code class="text-brand-400">--model azure/gpt-5.4</code> 这样的模型引用。 Pi 把模型
              ID 作为部署名发送；部署名不同时用映射变量：
            </p>
            <CodeBlock :code="azureCode" language="bash" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">Amazon Bedrock</h3>
            <p class="text-surface-300 text-sm mb-2">
              Bedrock 可以使用 bearer token 或环境 AWS 凭证来源：
            </p>
            <CodeBlock :code="bedrockCode" language="bash" />
            <p class="text-surface-400 text-sm mt-2">
              Pi 还通过标准的 <code class="text-brand-400">AWS_CONTAINER_CREDENTIALS_*</code> 和
              <code class="text-brand-400">AWS_WEB_IDENTITY_TOKEN_FILE</code> 变量支持 ECS
              任务凭证和 IRSA。
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">
              Cloudflare AI Gateway 与 Workers AI
            </h3>
            <p class="text-surface-300 text-sm mb-2">
              Gateway 需要 token、account ID 和 gateway ID；Workers AI 需要 token 和 account ID：
            </p>
            <CodeBlock :code="cloudflareGatewayCode" language="bash" />
            <p class="text-surface-400 text-sm mt-2">
              account ID 和 gateway ID 可以来自进程环境，也可以来自
              <code class="text-brand-400">auth.json</code> 凭证的
              <code class="text-brand-400">env</code> 对象。
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">Google Vertex AI</h3>
            <CodeBlock :code="vertexCode" language="bash" />
            <p class="text-surface-400 text-sm mt-2">
              想使用服务账号密钥文件时，同时设置
              <code class="text-brand-400">GOOGLE_APPLICATION_CREDENTIALS</code>、项目和区域。
            </p>
          </div>
        </div>
      </section>

      <!-- Custom providers -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">自定义提供商</h2>
        <div class="glass-card p-6">
          <ul class="space-y-3 text-surface-300">
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span
                ><strong class="text-surface-100">通过 models.json</strong>：添加 Ollama、LM
                Studio、vLLM、SGLang 或任何使用受支持 API 的端点，见
                <router-link to="/models" class="text-brand-400 hover:text-brand-300"
                  >选择模型</router-link
                >。</span
              >
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span
                ><strong class="text-surface-100">通过扩展</strong
                >：为需要自定义流式输出、模型发现或 OAuth 流程的提供商编写扩展。</span
              >
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>
