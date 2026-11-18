<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const locations = [
  { path: "~/.pi/agent/settings.json", scope: "用户级（所有项目）" },
  { path: ".pi/settings.json", scope: "项目级（当前目录，授予信任后加载）" },
];

const modelSettings = [
  { key: "defaultProvider", type: "string", def: "自动", desc: "启动时的 AI 提供商" },
  { key: "defaultModel", type: "string", def: "自动", desc: "启动时的模型 ID" },
  {
    key: "defaultThinkingLevel",
    type: "enum",
    def: '"medium"',
    desc: "off、minimal、low、medium、high、xhigh、max",
  },
  {
    key: "modelThinkingLevels",
    type: "object",
    def: "无",
    desc: "按精确 provider/modelId 设置启动思考级别",
  },
  {
    key: "thinkingBudgets",
    type: "object",
    def: "内置预算",
    desc: "minimal、low、medium、high 级别的 token 预算",
  },
  {
    key: "enabledModels",
    type: "string[]",
    def: "全部可用模型",
    desc: "用于启动选择和模型循环的模型模式，格式同 --models",
  },
  { key: "hideThinkingBlock", type: "boolean", def: "false", desc: "在转录区隐藏思考块" },
  {
    key: "showCacheMissNotices",
    type: "boolean",
    def: "false",
    desc: "显示显著的缓存未命中、缓存预热成功、压缩用量和提供商恢复提示",
  },
  {
    key: "cacheWarming",
    type: "enum",
    def: '"idle"',
    desc: "off、streaming、idle；在活动运行期间预热符合条件的提示缓存，仅全局设置",
  },
];

const interactionSettings = [
  {
    key: "steeringMode",
    type: "enum",
    def: '"one-at-a-time"',
    desc: "排队转向消息的投递方式：all 或 one-at-a-time",
  },
  { key: "followUpMode", type: "enum", def: '"one-at-a-time"', desc: "排队后续消息的投递方式" },
  {
    key: "externalEditor",
    type: "string",
    def: "$VISUAL/$EDITOR",
    desc: "外部编辑器快捷键打开的命令",
  },
  {
    key: "doubleEscapeAction",
    type: "enum",
    def: '"tree"',
    desc: "空编辑器下双击 Escape 的动作：tree、fork 或 none",
  },
  {
    key: "treeFilterMode",
    type: "enum",
    def: '"default"',
    desc: "/tree 的初始过滤：default、no-tools、user-only、labeled-only、all",
  },
  {
    key: "defaultProjectTrust",
    type: "enum",
    def: '"ask"',
    desc: "回退项目信任行为：ask、always、never；只能在用户级设置中配置",
  },
];

const toolSettings = [
  {
    key: "defaultTools",
    type: "string[]",
    def: "read、bash、edit、write",
    desc: "启动时启用的工具；普通名称替换默认值，+name 添加、-name 移除",
  },
  {
    key: "codemode.mode",
    type: "enum",
    def: '"on"',
    desc: "codemode 激活时如何呈现工具：on 或 only",
  },
  {
    key: "codemode.inlineBudget",
    type: "number",
    def: "3000",
    desc: "codemode 描述中用于工具声明的估算 token 数，0 只列命名空间",
  },
];

const sessionSettings = [
  {
    key: "sessionDir",
    type: "string",
    def: "agent 会话目录",
    desc: "会话存储目录；相对路径从工作目录解析，可被环境变量与 --session-dir 覆盖",
  },
  {
    key: "sessionShareDestination",
    type: "enum",
    def: '"auto"',
    desc: "/share 的目标：auto、gist 或 radius",
  },
];

const compactionSettings = [
  { key: "compaction.enabled", type: "boolean", def: "true", desc: "启用自动压缩" },
  {
    key: "compaction.reserveTokens",
    type: "number",
    def: "16384",
    desc: "低于该空闲上下文 token 数时开始自动压缩",
  },
  {
    key: "compaction.keepRecentTokens",
    type: "number",
    def: "20000",
    desc: "不参与摘要的近期 token 数",
  },
  {
    key: "compaction.modelOverrides",
    type: "object",
    def: "无",
    desc: "按精确 provider/modelId 覆盖的 token 设置",
  },
  {
    key: "branchSummary.reserveTokens",
    type: "number",
    def: "16384",
    desc: "总结分支历史时保留的 token 数",
  },
  {
    key: "branchSummary.skipPrompt",
    type: "boolean",
    def: "false",
    desc: "跳过分支摘要提示并默认不摘要",
  },
];

const displaySettings = [
  {
    key: "theme",
    type: "string",
    def: '"system"',
    desc: "内置或自定义主题名；system 从终端主题推导配色",
  },
  {
    key: "quietStartup",
    type: 'boolean | "header"',
    def: "false",
    desc: 'true 隐藏启动标题与资源列表；"header" 保留标题但隐藏模型范围与资源列表',
  },
  {
    key: "tuiMode",
    type: "enum",
    def: '"fullscreen"',
    desc: "交互终端 UI 模式：regular 或 fullscreen",
  },
  {
    key: "fullscreenExitOutput",
    type: "enum",
    def: '"transcript"',
    desc: "全屏模式退出时输出的内容：transcript 或 resume-hint",
  },
  {
    key: "fullscreenScrollbar",
    type: "enum",
    def: '"auto"',
    desc: "全屏转录区滚动条行为：auto、always、hidden",
  },
  {
    key: "fullscreenCopyOnSelect",
    type: "boolean",
    def: "true",
    desc: "全屏模式下自动复制选中的文本",
  },
  {
    key: "fullscreenWheelScrollLines",
    type: '"auto" | number',
    def: '"auto"',
    desc: "每次滚轮事件滚动的行数（1–100）",
  },
  { key: "editorPaddingX", type: "number", def: "0", desc: "编辑器水平内边距，0–3 个字符单元" },
  { key: "outputPad", type: "0 | 1", def: "1", desc: "转录区水平内边距" },
  { key: "autocompleteMaxVisible", type: "number", def: "5", desc: "可见的补全条目数，3–20" },
  {
    key: "showHardwareCursor",
    type: "boolean",
    def: "false",
    desc: "使用终端光标而非 Pi 绘制的光标",
  },
  { key: "terminal.showImages", type: "boolean", def: "true", desc: "在支持时显示内联图片" },
  {
    key: "terminal.imageWidthCells",
    type: "number",
    def: "60",
    desc: "内联图片的首选宽度（终端单元）",
  },
  { key: "terminal.clearOnShrink", type: "boolean", def: "false", desc: "内容变少时清除空行" },
  {
    key: "terminal.showTerminalProgress",
    type: "boolean",
    def: "false",
    desc: "在终端标签页显示 OSC 9;4 进度",
  },
  {
    key: "terminal.hyperlinks",
    type: 'boolean | "auto"',
    def: '"auto"',
    desc: "覆盖 OSC 8 超链接检测",
  },
  { key: "terminal.images", type: "enum", def: '"auto"', desc: "kitty、iterm2、auto 或 false" },
  { key: "terminal.trueColor", type: 'boolean | "auto"', def: '"auto"', desc: "覆盖真彩色检测" },
  {
    key: "images.autoResize",
    type: "boolean",
    def: "true",
    desc: "发送给模型前把图片缩小到 2000×2000 以内",
  },
  { key: "images.blockImages", type: "boolean", def: "false", desc: "阻止图片发送给模型" },
  { key: "markdown.codeBlockIndent", type: "string", def: '"  "', desc: "渲染代码块的缩进前缀" },
  {
    key: "markdown.mermaid",
    type: "enum",
    def: '"streaming"',
    desc: "Mermaid 渲染模式：off、final、streaming",
  },
];

const networkSettings = [
  { key: "transport", type: "enum", def: '"auto"', desc: "支持多种传输的 AI 提供商首选传输方式" },
  {
    key: "httpProxy",
    type: "string",
    def: "无",
    desc: "Pi 管理的 HTTP 客户端使用的代理；仅用户级设置",
  },
  {
    key: "httpIdleTimeoutMs",
    type: 'number | "disabled"',
    def: "300000",
    desc: "HTTP 头与正文空闲超时；0 或 disabled 关闭",
  },
  {
    key: "websocketConnectTimeoutMs",
    type: 'number | "disabled"',
    def: "15000",
    desc: "WebSocket 连接超时；0 或 disabled 关闭",
  },
  { key: "retry.enabled", type: "boolean", def: "true", desc: "为瞬时故障启用 agent 级自动重试" },
  { key: "retry.maxRetries", type: "number", def: "3", desc: "agent 级最大重试次数" },
  { key: "retry.baseDelayMs", type: "number", def: "2000", desc: "指数退避的初始延迟（毫秒）" },
  {
    key: "retry.maxAgentDelayMs",
    type: "number",
    def: "60000",
    desc: "agent 级最大重试延迟（毫秒）",
  },
  {
    key: "retry.provider.timeoutMs",
    type: "number",
    def: "httpIdleTimeoutMs",
    desc: "提供商请求超时（毫秒）",
  },
  { key: "retry.provider.maxRetries", type: "number", def: "0", desc: "提供商级重试次数" },
  {
    key: "retry.provider.maxRetryDelayMs",
    type: "number",
    def: "60000",
    desc: "服务器要求的最大延迟；0 表示不限制",
  },
];

const shellSettings = [
  {
    key: "shellPath",
    type: "string",
    def: "平台默认",
    desc: "自定义 shell 可执行文件路径，支持开头的 ~",
  },
  { key: "shellCommandPrefix", type: "string", def: "无", desc: "前置到每条 shell 命令的字符串" },
  { key: "npmCommand", type: "string[]", def: "npm", desc: "用于 npm 包查找和安装的命令与参数" },
  {
    key: "selfUpdateCommand",
    type: "string[]",
    def: "无",
    desc: "pi update 更新自身时运行的命令，支持占位符；仅用户级设置",
  },
];

const resourceSettings = [
  { key: "packages", type: "array", def: "[]", desc: "npm、git 或本地 Pi 包来源" },
  { key: "extensions", type: "string[]", def: "[]", desc: "扩展文件或目录" },
  { key: "skills", type: "string[]", def: "[]", desc: "技能文件或目录" },
  { key: "prompts", type: "string[]", def: "[]", desc: "提示模板文件或目录" },
  { key: "themes", type: "string[]", def: "[]", desc: "主题文件或目录" },
  {
    key: "enableSkillCommands",
    type: "boolean",
    def: "true",
    desc: "把技能注册为 /skill:name 命令",
  },
];

const updateSettings = [
  { key: "collapseChangelog", type: "boolean", def: "false", desc: "更新后显示精简的更新日志" },
  {
    key: "enableInstallTelemetry",
    type: "boolean",
    def: "true",
    desc: "启用匿名安装/更新上报和部分提供商归属头；不控制更新检查",
  },
  { key: "enableAnalytics", type: "boolean", def: "false", desc: "选择加入分析数据共享" },
  {
    key: "warnings.anthropicExtraUsage",
    type: "boolean",
    def: "true",
    desc: "当 Anthropic 订阅认证可能使用付费额外用量时警告",
  },
];

const exampleSettings = `{
  "$schema": "https://pi.dev/schemas/settings.schema.json",
  "defaultProvider": "anthropic",
  "defaultModel": "claude-sonnet-4-5",
  "defaultThinkingLevel": "medium",
  "theme": "system",
  "defaultTools": ["+codemode"],
  "compaction": {
    "enabled": true,
    "reserveTokens": 16384,
    "keepRecentTokens": 20000
  },
  "externalEditor": "code --wait"
}`;

const tables = [
  { id: "model", title: "模型与思考", rows: modelSettings },
  { id: "interaction", title: "交互", rows: interactionSettings },
  { id: "tools", title: "工具", rows: toolSettings },
  { id: "sessions", title: "会话与上下文", rows: sessionSettings },
  { id: "compaction", title: "压缩与分支摘要", rows: compactionSettings },
  { id: "display", title: "终端与显示", rows: displaySettings },
  { id: "network", title: "网络与重试", rows: networkSettings },
  { id: "shell", title: "Shell", rows: shellSettings },
  { id: "resources", title: "资源", rows: resourceSettings },
  { id: "updates", title: "更新、遥测与警告", rows: updateSettings },
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">设置参考</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          本页列出用户可配置的设置及其类型、默认值和用途。项目设置覆盖用户级设置，资源列表则合并。
          在 <code class="text-brand-400">settings.json</code> 中加入
          <code class="text-brand-400"
            >"$schema": "https://pi.dev/schemas/settings.schema.json"</code
          >
          可获得编辑器校验和补全。
        </p>
      </div>

      <!-- Locations -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">设置文件位置</h2>
        <div class="space-y-3">
          <div
            v-for="loc in locations"
            :key="loc.path"
            class="glass-card p-4 flex items-center justify-between gap-4"
          >
            <code class="text-brand-400 text-sm">{{ loc.path }}</code>
            <span class="text-surface-400 text-sm text-right">{{ loc.scope }}</span>
          </div>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          文件位置与信任行为见
          <router-link to="/configuration" class="text-brand-400 hover:text-brand-300"
            >配置</router-link
          >。
          常见偏好可用 <code class="text-brand-400">/settings</code> 修改。
        </p>
      </section>

      <!-- Setting tables -->
      <section v-for="t in tables" :key="t.id" class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">{{ t.title }}</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-3 text-surface-300 font-medium">设置</th>
                <th class="text-left py-3 px-3 text-surface-300 font-medium">类型</th>
                <th class="text-left py-3 px-3 text-surface-300 font-medium">默认值</th>
                <th class="text-left py-3 px-3 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in t.rows" :key="s.key" class="border-b border-surface-800/50">
                <td class="py-3 px-3"><code class="text-brand-400 text-xs">{{ s.key }}</code></td>
                <td class="py-3 px-3 text-surface-300 text-xs">{{ s.type }}</td>
                <td class="py-3 px-3 text-surface-400 text-xs">{{ s.def }}</td>
                <td class="py-3 px-3 text-surface-300">{{ s.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="t.id === 'tools'" class="text-surface-400 text-sm mt-3">
          可用的内置工具为 <code class="text-brand-400">read</code>、<code class="text-brand-400"
            >bash</code
          >、 <code class="text-brand-400">powershell</code>、<code class="text-brand-400"
            >edit</code
          >、<code class="text-brand-400">write</code>、
          <code class="text-brand-400">grep</code>、<code class="text-brand-400">find</code> 和
          <code class="text-brand-400">ls</code>；
          <code class="text-brand-400">defaultTools</code> 也可以命名内置扩展注册的
          <code class="text-brand-400">codemode</code> 和
          <code class="text-brand-400">tool_search</code>。只包含 +name 和 -name
          的列表会修改继承的选择，而不是替换它。
        </p>
        <p v-if="t.id === 'sessions'" class="text-surface-400 text-sm mt-3">
          压缩 token 值必须是非负安全整数，每个值依次从模型覆盖、普通压缩设置、内置默认值解析。
          <router-link to="/compaction" class="text-brand-400 hover:text-brand-300"
            >上下文压缩</router-link
          >
          说明触发与摘要行为。
        </p>
        <p v-if="t.id === 'resources'" class="text-surface-400 text-sm mt-3">
          用户级设置中的相对资源路径从 agent 目录解析，项目设置中从项目
          <code class="text-brand-400">.pi</code> 目录解析。
          资源数组支持 <code class="text-brand-400">!pattern</code> 通配排除、<code
            class="text-brand-400"
            >+path</code
          >
          精确包含和 <code class="text-brand-400">-path</code> 精确排除。内置扩展名为
          <code class="text-brand-400">builtin:mcp</code>、
          <code class="text-brand-400">builtin:llama.cpp</code>、<code class="text-brand-400"
            >builtin:codemode</code
          >
          和 <code class="text-brand-400">builtin:tool-search</code>，默认加载，可用
          <code class="text-brand-400">-builtin:mcp</code> 禁用。
        </p>
        <p v-if="t.id === 'network'" class="text-surface-400 text-sm mt-3">
          除非确实需要提供商级重试，否则保持
          <code class="text-brand-400">retry.provider.maxRetries</code> 为 0；
          提供商重试可能延迟 Pi 自己处理配额和用量限制错误。
        </p>
      </section>

      <!-- Example -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">示例配置</h2>
        <CodeBlock :code="exampleSettings" language="json" filename="~/.pi/agent/settings.json" />
      </section>

      <!-- Project overrides -->
      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">项目覆盖</h2>
        <p class="text-surface-300 text-sm">
          项目设置文件
          <code class="text-brand-400">.pi/settings.json</code> 可以覆盖用户级设置，资源列表则合并。
          少数设置（<code class="text-brand-400">defaultProjectTrust</code>、<code
            class="text-brand-400"
            >httpProxy</code
          >、
          <code class="text-brand-400">selfUpdateCommand</code
          >）只能在用户级设置中配置。项目设置读取前需要
          <router-link to="/security" class="text-brand-400 hover:text-brand-300"
            >项目信任</router-link
          >。
        </p>
      </section>
    </div>
  </div>
</template>
