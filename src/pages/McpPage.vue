<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const quickSetup = `# 本地 stdio 服务器
pi mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem .
pi mcp list
pi

# 远程 HTTP 服务器
pi mcp add docs --url https://example.com/mcp --bearer-token-env-var DOCS_TOKEN

# 写入项目配置而不是用户配置
pi mcp add -l tools --env API_KEY='\${TOOLS_KEY}' -- uvx tools-mcp`

const serverConfig = `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "docs": {
      "url": "https://example.com/mcp",
      "headers": { "Authorization": "Bearer \${DOCS_TOKEN}" },
      "description": "Search and read the product documentation"
    }
  }
}`

const projectOverride = `{
  "mcpServers": {
    "internal-tools": { "enabled": false }
  }
}`

const oauthConfig = `{
  "mcpServers": {
    "sentry": { "url": "https://mcp.sentry.dev/mcp" }
  }
}`

const exposure = [
  { mode: 'codemode（默认）', behavior: '可在 codemode 脚本中调用，但既不向模型声明，也不出现在 codemode 描述中。脚本通过 searchTools()、describeTool() 或 ALL_TOOLS 查找工具。', use: '通用 MCP 服务器，尤其是需要组合或过滤调用时' },
  { mode: 'deferred', behavior: '在 tool_search 为下一次模型调用加载匹配项之前不会声明。', use: '工具很多、但发现后应直接调用的大型服务器' },
  { mode: 'direct', behavior: '像内置工具一样向模型声明，同时也可从 codemode 调用。', use: '小型、高频使用的工具集' },
  { mode: 'hidden', behavior: '已注册但不可达。', use: '应保持不可用的服务器或工具' },
]

const toolExposureConfig = `{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "exposure": "deferred",
      "toolExposure": {
        "search_code": "direct",
        "get_*": "codemode",
        "delete_*": "hidden"
      }
    }
  }
}`

const migrate = [
  { client: 'Claude Desktop、Claude Code、Cursor', how: '直接复制已有的 mcpServers 条目。' },
  { client: 'VS Code', how: '把顶层 servers 对象中的条目移入 mcpServers，并将 ${input:...} 提示替换为 ${NAME} 环境变量。' },
  { client: 'Codex', how: '把 [mcp_servers.<name>] 中的 command、args、env、url 等 TOML 字段转换为 JSON。' },
  { client: 'OpenCode', how: '把 "type": "local" 转成 stdio 条目并拆分 command 数组，environment 改名为 env，{env:NAME} 替换为 ${NAME}；"type": "remote" 转为 URL 条目。' },
]

const mcpCommands = [
  { cmd: 'pi mcp add <server> -- <command> [args...]', desc: '添加或替换 stdio 服务器；--env KEY=VALUE（可重复）与 --cwd <dir> 设置环境和工作目录' },
  { cmd: 'pi mcp add <server> --url <url>', desc: '添加或替换 streamable HTTP 服务器；--header、--bearer-token-env-var、OAuth 相关选项配置认证' },
  { cmd: 'pi mcp remove <server>', desc: '从 mcp.json 移除服务器，保留已保存的 OAuth 凭证' },
  { cmd: 'pi mcp list [--json]', desc: '连接所有已启用服务器并输出状态、工具和错误；有配置错误或未连接时退出码为 1' },
  { cmd: 'pi mcp login <server>', desc: '登录 OAuth 服务器，--timeout 限制整个登录过程（默认 300 秒）' },
  { cmd: 'pi mcp logout <server>', desc: '删除服务器已保存的 OAuth 凭证' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">MCP 服务器</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 通过 stdio 或 streamable HTTP 连接 <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" class="text-brand-400 hover:text-brand-300">Model Context Protocol</a>
          服务器，并把它们的工具和资源提供给模型。
        </p>
      </div>

      <!-- Quick setup -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">快速开始</h2>
        <p class="text-surface-300 mb-3">添加一个本地 stdio 服务器，检查连接，然后启动 Pi：</p>
        <CodeBlock :code="quickSetup" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          这些命令默认添加用户级服务器，加 <code class="text-brand-400">--local</code> 或 <code class="text-brand-400">-l</code> 则写入项目配置。
          在交互会话中用 <code class="text-brand-400">/mcp</code> 查看连接、登录、重连、修改暴露方式或启用/禁用服务器；
          在会话外新增或修改服务器后运行 <code class="text-brand-400">/reload</code>。
        </p>
      </section>

      <!-- Configure -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">配置服务器</h2>
        <p class="text-surface-300 mb-3">
          Pi 从 <code class="text-brand-400">~/.pi/agent/mcp.json</code> 读取用户级服务器，从 <code class="text-brand-400">.pi/mcp.json</code>
          读取项目服务器。项目配置仅在授予项目信任后读取；同名项目条目会替换用户级条目。
        </p>
        <CodeBlock :code="serverConfig" language="json" filename="mcp.json" />
        <p class="text-surface-300 text-sm mt-4 mb-3">
          不含 <code class="text-brand-400">command</code>、<code class="text-brand-400">url</code> 或 <code class="text-brand-400">type</code> 的项目条目只覆盖同名用户级服务器的
          <code class="text-brand-400">enabled</code>、<code class="text-brand-400">exposure</code> 和 <code class="text-brand-400">toolExposure</code>，其余配置保留。
          例如下面这项在某个项目中关闭用户级服务器：
        </p>
        <CodeBlock :code="projectOverride" language="json" filename=".pi/mcp.json" />
        <p class="text-surface-300 text-sm mt-4">配置规则：</p>
        <ul class="space-y-2 text-surface-400 text-sm mt-2">
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>服务器名只能包含字母、数字、<code class="text-brand-400">_</code> 和 <code class="text-brand-400">-</code>。工具名为 <code class="text-brand-400">mcp__&lt;server&gt;__&lt;tool&gt;</code>，其余字符替换为 <code class="text-brand-400">_</code>；冲突时附加哈希后缀。仅 <code class="text-brand-400">-</code> 与 <code class="text-brand-400">_</code> 不同的名字视为同一服务器。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span><code class="text-brand-400">type</code> 可选：有 <code class="text-brand-400">command</code> 即为 stdio，有 <code class="text-brand-400">url</code> 即为 streamable HTTP；若填写必须是 <code class="text-brand-400">stdio</code>、<code class="text-brand-400">http</code> 或 <code class="text-brand-400">streamable-http</code>。旧版 SSE 传输不受支持。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span><code class="text-brand-400">command</code> 是一个可执行文件，参数放在 <code class="text-brand-400">args</code> 中，不是 shell 命令字符串。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span><code class="text-brand-400">env</code> 和 <code class="text-brand-400">headers</code> 的值支持 <code class="text-brand-400">${GITHUB_TOKEN}</code> 形式的环境变量，也可以让整个值是一条 <code class="text-brand-400">!command</code>。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>两种服务器都支持 <code class="text-brand-400">timeout</code>（每次请求秒数，默认 60）、<code class="text-brand-400">enabled: false</code>、<code class="text-brand-400">exposure</code>、<code class="text-brand-400">toolExposure</code> 和 <code class="text-brand-400">description</code>。无效条目会被报告并跳过，不影响其他服务器连接。</span></li>
        </ul>
        <p class="text-surface-400 text-sm mt-3">
          个人服务器和含凭证的服务器应放在用户级文件中；项目文件只放项目需要的服务器，且只在可信项目中使用。
        </p>
      </section>

      <!-- Inspect and diagnose -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">检查与诊断</h2>
        <p class="text-surface-300 mb-3">
          <code class="text-brand-400">/mcp</code> 列出已配置服务器的状态、工具数、暴露方式和配置来源，需要处理的服务器排在最前。
          选择服务器可以查看工具与连接详情、重连、登录或登出、修改暴露方式、启用或禁用。
          会话外的 <code class="text-brand-400">pi mcp</code> 命令不加载扩展。
        </p>
        <p class="text-surface-300 mb-3">
          <code class="text-brand-400">pi mcp list</code> 会连接所有已启用的服务器并打印状态、工具和错误，条目无效或服务器未连接时退出码为 1。
          Pi 在会话开始时后台连接所有已启用服务器；首个提示最多等待 10 秒，且只等待带 <code class="text-brand-400">direct</code> 工具的服务器。
          服务器日志通知写入 <code class="text-brand-400">~/.pi/agent/mcp.log</code>，超过 5 MB 后轮转为 <code class="text-brand-400">mcp.log.1</code>。
        </p>
      </section>

      <!-- Migrate -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">从其他客户端迁移</h2>
        <p class="text-surface-300 mb-3">把转换后的条目放进 <code class="text-brand-400">mcp.json</code> 的 <code class="text-brand-400">mcpServers</code> 下，再用 <code class="text-brand-400">pi mcp list</code> 验证。</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">客户端</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">转换方式</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in migrate" :key="m.client" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ m.client }}</td>
                <td class="py-3 px-4 text-surface-300">{{ m.how }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- OAuth -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">OAuth 认证</h2>
        <p class="text-surface-300 mb-3">使用 OAuth 的远程服务器（如 Sentry）无需在 <code class="text-brand-400">mcp.json</code> 中写凭证：</p>
        <CodeBlock :code="oauthConfig" language="json" />
        <p class="text-surface-300 text-sm mt-3">
          当服务器拒绝未认证连接时，<code class="text-brand-400">/mcp</code> 会提示需要登录。选择 “Sign in”、运行
          <code class="text-brand-400">/mcp login sentry</code> 或 <code class="text-brand-400">pi mcp login sentry</code>，Pi 会打开授权页面并在批准后继续；
          浏览器在另一台机器上时，把重定向后的 URL 粘贴到登录界面即可。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          Pi 通过 Client ID Metadata Document 标识自己，或动态注册客户端，令牌存放在
          <code class="text-brand-400">~/.pi/agent/mcp-auth.json</code> 中并在过期时刷新。需要固定客户端、自定义回调端口或调整注册方式时，可在
          <code class="text-brand-400">oauth</code> 中设置 <code class="text-brand-400">clientId</code>、<code class="text-brand-400">clientSecret</code>、
          <code class="text-brand-400">callbackPort</code>、<code class="text-brand-400">scope</code>、<code class="text-brand-400">clientName</code>、
          <code class="text-brand-400">clientRegistration</code>（<code class="text-brand-400">auto</code>、<code class="text-brand-400">dcr</code> 或
          <code class="text-brand-400">cimd</code>）以及 <code class="text-brand-400">authServerMetadataUrl</code>。
          凭证按服务器名和 URL 保存：不同名字、相同 URL 的服务器分别登录，不同文件中同名同 URL 的服务器共享登录。
        </p>
      </section>

      <!-- Exposure -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">控制工具暴露</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">暴露方式</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">行为</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">典型用途</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in exposure" :key="e.mode" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ e.mode }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ e.behavior }}</td>
                <td class="py-3 px-4 text-surface-400">{{ e.use }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4 mb-3">
          当带有 <code class="text-brand-400">codemode</code> 暴露的服务器连接时，Pi 会自动启用 <code class="text-brand-400">codemode</code>；
          对 <code class="text-brand-400">deferred</code> 则启用 <code class="text-brand-400">tool_search</code>。
          <code class="text-brand-400">toolExposure</code> 可按工具名或含 <code class="text-brand-400">*</code> 的模式覆盖暴露方式，精确名优先于模式：
        </p>
        <CodeBlock :code="toolExposureConfig" language="json" filename="mcp.json" />
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">--tools</code> 不会移除 MCP 工具，除非其中某项以 <code class="text-brand-400">mcp__</code> 开头；
          <code class="text-brand-400">--exclude-tools</code> 接受相同模式，<code class="text-brand-400">--no-mcp</code> 可为单次运行禁用 MCP。
          超过 20 KB 的文本结果会把中间部分替换为 <code class="text-brand-400">…N chars truncated…</code> 标记，完整文本保存在临时文件中，
          codemode 脚本仍能拿到完整结果。
        </p>
      </section>

      <!-- Resources and permissions -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">资源与权限</h2>
        <p class="text-surface-300 mb-3">
          当已连接服务器提供资源时，Pi 会增加 <code class="text-brand-400">list_mcp_resources</code>、<code class="text-brand-400">list_mcp_resource_templates</code>
          和 <code class="text-brand-400">read_mcp_resource</code> 三个工具。文本以文本形式交给模型，图片以图片形式交给模型，其他二进制资源写入临时文件并给出路径。
          MCP Apps 的 <code class="text-brand-400">ui://</code> 资源不会被渲染，因此省略。
        </p>
        <p class="text-surface-300">
          每次 MCP 调用都经过 Pi 的工具管线，扩展的 <code class="text-brand-400">tool_call</code> 与 <code class="text-brand-400">tool_result</code>
          处理（包括权限门控）同样适用于 MCP 工具，调用会带上 <code class="text-brand-400">parentToolCallId</code>。
          <code class="text-brand-400">pi.getAllTools()</code> 会报告服务器声明的 <code class="text-brand-400">readOnlyHint</code>、
          <code class="text-brand-400">destructiveHint</code>、<code class="text-brand-400">idempotentHint</code> 和
          <code class="text-brand-400">openWorldHint</code>，权限扩展可据此决定是否需要确认。
        </p>
      </section>

      <!-- Extensions and SDK -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">扩展与 SDK</h2>
        <ul class="space-y-2 text-surface-300">
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>扩展可用 <code class="text-brand-400">pi.registerMcpServer(name, config)</code> 为当前会话添加服务器，形状与 <code class="text-brand-400">mcpServers</code> 条目相同；状态或暴露方式的修改只影响当前会话。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>安装了注册 <code class="text-brand-400">/mcp</code> 的扩展（如 <code class="text-brand-400">pi-mcp-adapter</code>）时，内置 MCP 支持被替换。要仅禁用内置支持，可在 <code class="text-brand-400">pi config</code> 的 Built-in 中关闭 <code class="text-brand-400">mcp</code>，或设置 <code class="text-brand-400">"extensions": ["-builtin:mcp"]</code>。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>SDK 会话不加载内置扩展。需要在 <code class="text-brand-400">DefaultResourceLoader</code> 的 <code class="text-brand-400">extensionFactories</code> 中加入 <code class="text-brand-400">createMcpExtension()</code>、<code class="text-brand-400">createCodemodeExtension()</code> 和 <code class="text-brand-400">createToolSearchExtension()</code>，并调用 <code class="text-brand-400">session.bindExtensions()</code>。</span></li>
        </ul>
      </section>

      <!-- Commands -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">MCP 命令</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">命令</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in mcpCommands" :key="c.cmd" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ c.cmd }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ c.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">add</code> 与 <code class="text-brand-400">remove</code> 修改
          <code class="text-brand-400">~/.pi/agent/mcp.json</code>，加 <code class="text-brand-400">--local</code> 则修改当前目录的
          <code class="text-brand-400">.pi/mcp.json</code>。<code class="text-brand-400">add</code> 还接受
          <code class="text-brand-400">--exposure</code> 与 <code class="text-brand-400">--description</code>，但不会连接服务器，需再运行
          <code class="text-brand-400">pi mcp list</code> 检查。
        </p>
      </section>
    </div>
  </div>
</template>
