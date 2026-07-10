<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const subscriptions = [
  { name: 'ChatGPT Plus/Pro (Codex)', desc: '需要 ChatGPT Plus 或 Pro 订阅' },
  { name: 'Claude Pro/Max', desc: 'Anthropic 订阅认证' },
  { name: 'GitHub Copilot', desc: '按 Enter 使用 github.com' },
]

const apiKeys = [
  { provider: 'Anthropic', env: 'ANTHROPIC_API_KEY', key: 'anthropic' },
  { provider: 'OpenAI', env: 'OPENAI_API_KEY', key: 'openai' },
  { provider: 'DeepSeek', env: 'DEEPSEEK_API_KEY', key: 'deepseek' },
  { provider: 'Google Gemini', env: 'GEMINI_API_KEY', key: 'google' },
  { provider: 'Mistral', env: 'MISTRAL_API_KEY', key: 'mistral' },
  { provider: 'Groq', env: 'GROQ_API_KEY', key: 'groq' },
  { provider: 'Cerebras', env: 'CEREBRAS_API_KEY', key: 'cerebras' },
  { provider: 'xAI', env: 'XAI_API_KEY', key: 'xai' },
  { provider: 'OpenRouter', env: 'OPENROUTER_API_KEY', key: 'openrouter' },
  { provider: 'NVIDIA NIM', env: 'NVIDIA_API_KEY', key: 'nvidia' },
  { provider: 'Hugging Face', env: 'HF_TOKEN', key: 'huggingface' },
  { provider: 'Kimi For Coding', env: 'KIMI_API_KEY', key: 'kimi-coding' },
  { provider: 'MiniMax', env: 'MINIMAX_API_KEY', key: 'minimax' },
  { provider: '小米 MiMo', env: 'XIAOMI_API_KEY', key: 'xiaomi' },
  { provider: 'Ant Ling', env: 'ANT_LING_API_KEY', key: 'ant-ling' },
]

const authJsonCode = `{
  "anthropic": { "type": "api_key", "key": "sk-ant-..." },
  "openai": { "type": "api_key", "key": "sk-..." },
  "deepseek": { "type": "api_key", "key": "sk-..." },
  "google": { "type": "api_key", "key": "..." }
}`

const azureCode = `export AZURE_OPENAI_API_KEY=...
export AZURE_OPENAI_BASE_URL=https://your-resource.ai.azure.com
export AZURE_OPENAI_API_VERSION=2024-02-01`

const bedrockCode = `# 选项 1: AWS Profile
export AWS_PROFILE=your-profile

# 选项 2: IAM Keys
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...

# 可选区域（默认 us-east-1）
export AWS_REGION=us-west-2`

const vertexCode = `gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT=your-project
export GOOGLE_CLOUD_LOCATION=us-central1`

const cloudflareCode = `export CLOUDFLARE_API_KEY=...
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_GATEWAY_ID=...
pi --provider cloudflare-ai-gateway --model "claude-sonnet-4-5"`

const resolutionOrder = [
  'CLI --api-key 标志',
  'auth.json 条目（API Key 或 OAuth Token）',
  '环境变量',
  'models.json 中的自定义提供商 Key',
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">模型提供商</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 支持通过 OAuth 的订阅提供商和通过环境变量或认证文件的 API Key 提供商。
        </p>
      </div>

      <!-- Subscriptions -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">订阅</h2>
        <p class="text-surface-300 mb-4">
          在交互模式中使用 <code class="text-brand-400">/login</code>，然后选择提供商：
        </p>
        <div class="space-y-3">
          <div v-for="sub in subscriptions" :key="sub.name" class="glass-card p-4 flex items-center justify-between">
            <div>
              <h4 class="font-semibold text-surface-100">{{ sub.name }}</h4>
              <p class="text-surface-400 text-sm">{{ sub.desc }}</p>
            </div>
          </div>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          使用 <code class="text-brand-400">/logout</code> 清除凭证。Token 存储在 <code class="text-brand-400">~/.pi/agent/auth.json</code> 中，过期时自动刷新。
        </p>
      </section>

      <!-- API Keys -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">API Keys</h2>
        <p class="text-surface-300 mb-4">
          在交互模式中使用 <code class="text-brand-400">/login</code> 并选择提供商以将 API Key 存储在 <code class="text-brand-400">auth.json</code> 中，或通过环境变量设置凭证：
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">提供商</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">环境变量</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">auth.json key</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in apiKeys" :key="item.provider" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100 font-medium">{{ item.provider }}</td>
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ item.env }}</code></td>
                <td class="py-3 px-4"><code class="text-surface-300 text-xs">{{ item.key }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Auth File -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">认证文件</h2>
        <p class="text-surface-300 mb-4">
          将凭证存储在 <code class="text-brand-400">~/.pi/agent/auth.json</code> 中：
        </p>
        <CodeBlock :code="authJsonCode" language="json" filename="~/.pi/agent/auth.json" />
        <p class="text-surface-400 text-sm mt-3">
          文件创建时权限为 <code class="text-brand-400">0600</code>（仅用户读写）。auth.json 凭证优先于环境变量。
        </p>
      </section>

      <!-- Cloud Providers -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">云提供商</h2>

        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">Azure OpenAI</h3>
            <CodeBlock :code="azureCode" language="bash" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">Amazon Bedrock</h3>
            <CodeBlock :code="bedrockCode" language="bash" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">Google Vertex AI</h3>
            <CodeBlock :code="vertexCode" language="bash" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">Cloudflare AI Gateway</h3>
            <CodeBlock :code="cloudflareCode" language="bash" />
          </div>
        </div>
      </section>

      <!-- Custom Providers -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">自定义提供商</h2>
        <div class="glass-card p-6">
          <ul class="space-y-3 text-surface-300">
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span><strong class="text-surface-100">通过 models.json</strong>：添加 Ollama、LM Studio、vLLM 或任何支持 API 的提供商</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-400 mt-1">•</span>
              <span><strong class="text-surface-100">通过扩展</strong>：为需要自定义 API 实现或 OAuth 流的提供商创建扩展</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Resolution Order -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">解析顺序</h2>
        <p class="text-surface-300 mb-4">解析提供商凭证时：</p>
        <ol class="space-y-2">
          <li v-for="(step, index) in resolutionOrder" :key="index" class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-medium">{{ index + 1 }}</span>
            <span class="text-surface-200">{{ step }}</span>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>
