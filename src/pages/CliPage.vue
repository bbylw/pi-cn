<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const usageCode = `pi [options] [--] [@files...] [messages...]
pi install <source> [options]
pi remove <source> [options]
pi update [target] [options]
pi list
pi config [options]
pi auth login <provider> [--api-key] [--no-browser]
pi mcp <add|remove|list|login|logout> [options]`

const invokeExample = `pi
pi --print "Summarize this repository"
git diff | pi --print "Review this change"
pi --mode json "Inspect this repository" > events.jsonl`

const invokeOptions = [
  { flag: '-p, --print', desc: '运行给定提示，把最终 assistant 文本写到 stdout 后退出' },
  { flag: '--mode text', desc: '选择文本输出；stdin 与 stdout 都是终端时仍打开 TUI' },
  { flag: '--mode json', desc: '运行提示并向 stdout 写 JSONL 事件后退出' },
  { flag: '--mode rpc', desc: '从 stdin 读 JSONL 命令，向 stdout 写响应和事件，直到关闭' },
  { flag: '--export <input> [output]', desc: '把会话文件导出为 HTML 后退出，省略 output 时自动推导目标路径' },
]

const modelOptions = [
  { flag: '--provider <name>', desc: '把 --model 查找限制在一个提供商内，需要同时给出 --model' },
  { flag: '--model <pattern>', desc: '按精确 ID 或模糊 ID/名称匹配选择模型，支持 provider/id 与可选的 :<thinking> 后缀' },
  { flag: '--api-key <key>', desc: '使用不持久化的 API Key 覆盖，需要已通过 --model 或 --models 选择了模型' },
  { flag: '--thinking <level>', desc: '设置 off、minimal、low、medium、high、xhigh 或 max，覆盖 --model 后缀并按模型能力收敛' },
  { flag: '--models <patterns>', desc: '设置启动与循环使用的模型范围，支持精确 ID、模糊匹配、忽略大小写的 glob 和 :<thinking> 后缀' },
  { flag: '--list-models [search]', desc: '列出可用模型（可按模糊搜索过滤）后退出' },
]

const sessionOptions = [
  { flag: '-c, --continue', desc: '继续当前目录最近的会话' },
  { flag: '-r, --resume', desc: '打开会话选择器，并在会话自己的工作目录中恢复；按 Tab 可包含其他目录的会话' },
  { flag: '--session <path|id>', desc: '按文件路径或完整/部分 ID 打开会话，并在其工作目录中恢复' },
  { flag: '--session-id <id>', desc: '打开当前目录中该 ID 的已有会话，不存在则创建；ID 支持字母、数字、.、_ 和 -' },
  { flag: '--fork <path|id>', desc: '把会话分叉为当前目录下的新会话' },
  { flag: '--session-dir <dir>', desc: '覆盖存储和查找位置，优先于 PI_CODING_AGENT_SESSION_DIR 与 sessionDir 设置' },
  { flag: '--no-session', desc: '使用不持久化的内存会话' },
  { flag: '-n, --name <name>', desc: '设置会话显示名称' },
]

const toolOptions = [
  { flag: '-t, --tools <list>', desc: '用逗号分隔的允许列表替换默认选择；只有 +name 和 -name 的列表则修改默认选择' },
  { flag: '-xt, --exclude-tools <list>', desc: '在其他选择之后禁用逗号分隔的工具名或模式，包括 MCP 工具' },
  { flag: '-nbt, --no-builtin-tools', desc: '禁用默认内置工具，保留扩展和自定义工具' },
  { flag: '-nt, --no-tools', desc: '启动时禁用全部内置、扩展、自定义和 MCP 工具' },
]

const builtinTools = [
  { name: 'read', purpose: '读取文本文件和支持的图片' },
  { name: 'bash', purpose: '运行 shell 命令' },
  { name: 'powershell', purpose: '在 Windows 上运行 PowerShell 命令' },
  { name: 'edit', purpose: '对已有文件应用精确文本替换' },
  { name: 'write', purpose: '创建或覆盖文件' },
  { name: 'grep', purpose: '搜索文件内容' },
  { name: 'find', purpose: '用 glob 模式查找路径' },
  { name: 'ls', purpose: '列出目录内容' },
]

const extensionTools = [
  { name: 'codemode', purpose: '运行调用其他工具的 JavaScript，例如用 Promise.allSettled 并行调用；只有脚本输出会到达模型' },
  { name: 'tool_search', purpose: '搜索未向模型声明的工具（codemode 与 deferred 暴露，例如 MCP 工具），并为下一次调用声明匹配项' },
]

const resourceOptions = [
  { flag: '-e, --extension <path>', desc: '加载扩展文件或目录，或内置扩展如 builtin:mcp；可重复' },
  { flag: '-ne, --no-extensions', desc: '禁用被发现、配置和内置的扩展；显式 -e 路径仍会加载' },
  { flag: '--no-mcp', desc: '本次运行禁用内置 MCP 支持' },
  { flag: '--skill <path>', desc: '加载技能文件或目录，可重复' },
  { flag: '-ns, --no-skills', desc: '禁用被发现和配置的技能' },
  { flag: '--prompt-template <path>', desc: '加载提示模板文件或目录，可重复' },
  { flag: '-np, --no-prompt-templates', desc: '禁用被发现和配置的提示模板' },
  { flag: '--theme <path>', desc: '加载主题文件或目录，可重复' },
  { flag: '--use-theme <name>', desc: '为本次运行选择初始交互主题' },
  { flag: '--no-themes', desc: '禁用被发现和配置的主题' },
  { flag: '-nc, --no-context-files', desc: '禁用 AGENTS.md 和 CLAUDE.md 的发现' },
]

const processOptions = [
  { flag: '--system-prompt <text|path>', desc: '用文本或已有文件内容替换默认系统提示' },
  { flag: '--append-system-prompt <text|path>', desc: '在系统提示后追加文本或文件，可重复' },
  { flag: '--tui-mode <mode>', desc: '使用 fullscreen（默认）或 regular 终端模式' },
  { flag: '--verbose', desc: '显示详细的交互启动信息，覆盖 quietStartup' },
  { flag: '-a, --approve', desc: '为本次进程信任项目本地配置与资源' },
  { flag: '-na, --no-approve', desc: '忽略受信任门控的项目本地配置与资源' },
  { flag: '--offline', desc: '禁用自动网络活动，包括模型目录刷新；等价于 PI_OFFLINE=1' },
  { flag: '-h, --help', desc: '显示帮助（含已加载扩展注册的参数）后退出' },
  { flag: '-v, --version', desc: '显示 Pi 版本后退出' },
]

const packageTasks = [
  { task: '安装包', cmd: 'pi install <source>' },
  { task: '列出已配置的包', cmd: 'pi list' },
  { task: '移除包及其设置条目', cmd: 'pi remove <source>' },
  { task: '配置加载哪些包资源', cmd: 'pi config' },
  { task: '更新 Pi', cmd: 'pi update' },
  { task: '更新所有已安装的包', cmd: 'pi update --extensions' },
  { task: '更新一个已安装的包', cmd: 'pi update <source>' },
  { task: '刷新模型目录', cmd: 'pi update --models' },
  { task: '同时更新 Pi 和所有包', cmd: 'pi update --all' },
]

const authCommands = [
  { cmd: 'pi auth login <provider>', desc: '在终端登录提供商后退出，不启动会话；Radius 登录还会添加 Radius MCP 服务器' },
  { cmd: 'pi auth logout <provider>', desc: '删除 pi auth login 或 /login 保存的凭证，环境变量与 models.json 不变' },
  { cmd: 'pi auth check', desc: '输出 ready、not_ready 或 invalid，退出码分别为 0、1、2' },
  { cmd: 'pi auth print-api-key', desc: '输出解析到的 API Key' },
  { cmd: 'pi auth print-bearer-token', desc: '输出解析到的 OAuth bearer token' },
]
</script>

<template>
  <div class="py-12 sm:px-16 px-4">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">命令行</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          本页记录 Pi 内置的命令行命令与选项。运行 <code class="text-brand-400">pi --help</code>，或在子命令后追加
          <code class="text-brand-400">--help</code>，可查看你所安装版本的确切接口。顶层帮助还会包含已加载扩展注册的选项。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">用法</h2>
        <CodeBlock :code="usageCode" language="bash" />
      </section>

      <!-- Invocation -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">调用与输出</h2>
        <CodeBlock :code="invokeExample" language="bash" />
        <p class="text-surface-300 text-sm mt-4">
          当 stdin 和 stdout 都是终端时，Pi 会打开终端 UI，除非 <code class="text-brand-400">--print</code>、
          <code class="text-brand-400">--mode json</code> 或 <code class="text-brand-400">--mode rpc</code> 选择了其他接口。
          当任一数据流被重定向且未选择 JSON 或 RPC 模式时，Pi 使用打印模式。
        </p>
        <ul class="space-y-2 text-surface-400 text-sm mt-3">
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span><code class="text-brand-400">message</code> 作为初始提示；<code class="text-brand-400">@path</code> 把文本文件或图片加入首个提示；管道 stdin 的内容前置到首个提示。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span><code class="text-brand-400">--</code> 停止选项解析，让提示可以以 <code class="text-brand-400">-</code> 开头。<code class="text-brand-400">@path</code> 从当前工作目录解析。</span></li>
        </ul>
        <div class="overflow-x-auto mt-4">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">选项</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">行为</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in invokeOptions" :key="o.flag" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ o.flag }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ o.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">RPC 模式拒绝 <code class="text-brand-400">@file</code> 参数；JSON 和 RPC 模式把 stdout 保留给协议记录。</p>
      </section>

      <!-- Models -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">模型</h2>
        <CodeBlock code="pi --model sonnet:high" language="bash" />
        <div class="overflow-x-auto mt-4">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">选项</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in modelOptions" :key="o.flag" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ o.flag }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ o.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Sessions -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">会话</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">选项</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in sessionOptions" :key="o.flag" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ o.flag }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ o.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">--fork</code> 不能与 <code class="text-brand-400">--session</code>、<code class="text-brand-400">--continue</code>、
          <code class="text-brand-400">--resume</code> 或 <code class="text-brand-400">--no-session</code> 组合；
          <code class="text-brand-400">--session-id</code> 不能与 <code class="text-brand-400">--session</code>、<code class="text-brand-400">--continue</code>
          或 <code class="text-brand-400">--resume</code> 组合。
        </p>
      </section>

      <!-- Tools -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">工具</h2>
        <CodeBlock code='pi --tools read,grep,find,ls --print "Review this project"' language="bash" />
        <div class="overflow-x-auto mt-4">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">选项</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in toolOptions" :key="o.flag" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ o.flag }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ o.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          默认启用 <code class="text-brand-400">read</code>、<code class="text-brand-400">bash</code>、<code class="text-brand-400">edit</code> 和
          <code class="text-brand-400">write</code>，除非 <code class="text-brand-400">defaultTools</code> 修改了它们。
          内置工具：
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div v-for="t in builtinTools" :key="t.name" class="glass-card p-3">
            <code class="text-brand-400 text-sm">{{ t.name }}</code>
            <p class="text-surface-400 text-xs mt-1">{{ t.purpose }}</p>
          </div>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          内置扩展再提供两个工具，默认关闭；MCP 扩展会在需要时打开它们。你也可以在 <code class="text-brand-400">--tools</code> 或
          <code class="text-brand-400">defaultTools</code> 中命名来启用：
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div v-for="t in extensionTools" :key="t.name" class="glass-card p-3">
            <code class="text-brand-400 text-sm">{{ t.name }}</code>
            <p class="text-surface-400 text-xs mt-1">{{ t.purpose }}</p>
          </div>
        </div>
        <p class="text-surface-400 text-sm mt-4">
          要用 codemode 而不接 MCP，在 <code class="text-brand-400">~/.pi/agent/settings.json</code> 或项目的
          <code class="text-brand-400">.pi/settings.json</code> 中加入 <code class="text-brand-400">"defaultTools": ["+codemode"]</code>；
          单次运行可用 <code class="text-brand-400">pi --tools +codemode</code>。脚本在 QuickJS 沙箱中运行，通过
          <code class="text-brand-400">tools.&lt;name&gt;(args)</code> 访问其他工具。
        </p>
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">--tools</code> 不会移除 MCP 工具，除非某项以 <code class="text-brand-400">mcp__</code> 开头：
          <code class="text-brand-400">pi --tools read,bash,codemode,'mcp__radius__*'</code> 只保留 <code class="text-brand-400">radius</code> 的工具。
          要移除 MCP 工具，使用 <code class="text-brand-400">--exclude-tools 'mcp__*'</code> 或 <code class="text-brand-400">--no-mcp</code>。
        </p>
      </section>

      <!-- Resources -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">资源</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">选项</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in resourceOptions" :key="o.flag" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ o.flag }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ o.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">资源路径只在当前进程有效，相对路径从当前工作目录解析。</p>
      </section>

      <!-- Prompts and process -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">提示与进程</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">选项</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in processOptions" :key="o.flag" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ o.flag }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ o.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">扩展可以注册额外的长选项；未知的短选项会被拒绝。</p>
      </section>

      <!-- Package commands -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">包命令</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">任务</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">命令</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in packageTasks" :key="p.task" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ p.task }}</td>
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ p.cmd }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          对 <code class="text-brand-400">install</code>、<code class="text-brand-400">remove</code>、<code class="text-brand-400">uninstall</code>
          或 <code class="text-brand-400">config</code> 加 <code class="text-brand-400">--local</code> 可改用项目设置。
          <code class="text-brand-400">pi update</code> 在由其他包管理器（如 Nix）提供 Pi 时无法更新自身；
          可用 <code class="text-brand-400">PI_SELF_UPDATE_COMMAND</code> 或 <code class="text-brand-400">selfUpdateCommand</code> 设置自定义更新命令。
        </p>
      </section>

      <!-- Credentials -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">凭证命令</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">命令</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in authCommands" :key="a.cmd" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ a.cmd }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ a.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          打印凭证的命令会把密钥写到 stdout。其他认证命令需要 <code class="text-brand-400">--provider</code> 或
          <code class="text-brand-400">--model</code>，例如 <code class="text-brand-400">pi auth check --provider openai --json</code>。
        </p>
      </section>

      <!-- MCP commands -->
      <section class="mb-12 glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">MCP 命令</h2>
        <p class="text-surface-300 text-sm">
          <code class="text-brand-400">pi mcp add|remove|list|login|logout</code> 可在会话之外运行，因此 agent 也能通过 bash 调用。
          选项与配置格式见 <router-link to="/mcp" class="text-brand-400 hover:text-brand-300">MCP 服务器</router-link>。
        </p>
      </section>
    </div>
  </div>
</template>
