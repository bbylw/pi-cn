<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const ghosttyCode = `keybind = alt+backspace=text:\\x1b\\x7f`

const weztermCode = `local wezterm = require 'wezterm'
local config = wezterm.config_builder()
config.enable_kitty_keyboard = true
return config`

const weztermAlt = `{
  key = 'Enter',
  mods = 'ALT',
  action = wezterm.action.SendString('\\x1b[13;3u'),
}`

const alacrittyCode = `[[keyboard.bindings]]
key = "Enter"
mods = "Alt"
chars = "\\u001b[13;3u"`

const vscodeCode = `{
  "key": "shift+enter",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": "\\u001b[13;2u" },
  "when": "terminalFocus"
}`

const zedCode = `{
  "context": "Terminal",
  "bindings": {
    "shift-enter": ["terminal::SendText", "\\u001b[13;2u"],
    "ctrl--": ["terminal::SendText", "\\u001b[45;5u"],
    "ctrl-alt-]": ["terminal::SendText", "\\u001b[93;7u"]
  }
}`

const windowsTerminalCode = `{
  "command": { "action": "sendInput", "input": "\\u001b[13;2u" },
  "keys": "shift+enter"
}`

const hardwareCursor = `export PI_HARDWARE_CURSOR=1
pi`

const troubleshoot = [
  { symptom: 'Shift+Enter 提交而不是插入换行', start: '下方对应终端的章节；tmux 见「在 tmux 中运行」' },
  { symptom: 'Alt+Enter 没有排队后续消息', start: 'WezTerm、Alacritty 或 Windows Terminal 章节' },
  { symptom: '全屏滚动异常缓慢', start: 'iTerm2' },
  { symptom: '链接可用但没有悬停预览', start: 'Ghostty' },
  { symptom: '未检测到内联图片或颜色', start: '覆盖自动检测的能力' },
  { symptom: '输入法候选窗口位置错误', start: 'WezTerm 或 IntelliJ IDEA' },
  { symptom: '只在 tmux 中修改键失效', start: '在 tmux 中运行 Pi' },
]

const capabilities = [
  { cap: '超链接', env: 'PI_HYPERLINKS=1|0|auto', setting: 'terminal.hyperlinks: true|false|"auto"' },
  { cap: '内联图片', env: 'PI_IMAGE_PROTOCOL=kitty|iterm2|none|auto', setting: 'terminal.images: "kitty"|"iterm2"|false|"auto"' },
  { cap: 'Truecolor', env: 'PI_TRUE_COLOR=1|0|auto', setting: 'terminal.trueColor: true|false|"auto"' },
]

const status = [
  { state: 'working', when: 'agent 运行或压缩进行中，消息是会话名。' },
  { state: 'blocked', when: '扩展对话框或登录在等待你，消息是对话框标题。' },
  { state: 'done', when: '一次运行结束，消息是会话名。' },
  { state: 'error', when: '运行以未重试的错误结束，消息是错误首行。' },
  { state: 'idle', when: 'Pi 启动完成，或你取消了运行。' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">配置终端</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          大多数现代终端无需额外配置即可配合 Pi。当修改键、滚动、链接、图片、颜色或输入法候选窗口位置不符合预期时，
          参考本页。Pi 使用扩展键协议来区分 <code class="text-brand-400">Shift+Enter</code>、
          <code class="text-brand-400">Alt+Enter</code> 与普通 <code class="text-brand-400">Enter</code>，
          终端代理、复用器和 IDE 内置终端可能改变或丢弃这些信息。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">故障排查入口</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">症状</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">先看这里</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in troubleshoot" :key="t.symptom" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ t.symptom }}</td>
                <td class="py-3 px-4 text-surface-300">{{ t.start }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          用 <code class="text-brand-400">/hotkeys</code> 查看 Pi 当前快捷键，参见
          <router-link to="/keybindings" class="text-brand-400 hover:text-brand-300">键位绑定</router-link> 修改它们。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">Kitty 与 iTerm2</h2>
        <p class="text-surface-300 text-sm">
          Kitty 无需额外配置即支持所需的键盘协议。iTerm2 的普通终端模式无需配置；若全屏模式滚动异常缓慢，
          打开 <strong class="text-surface-100">iTerm2 &gt; Settings &gt; Advanced</strong>，搜索
          <strong class="text-surface-100">Trackpad scrolls fast?</strong> 并设为 <strong class="text-surface-100">No</strong>。
          这是 iTerm2 全局设置，也会改变原生触控板滚动。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">Apple Terminal</h2>
        <p class="text-surface-300 text-sm">
          Pi 在可用时启用增强按键上报。若 Terminal.app 仍为 <code class="text-brand-400">Shift+Enter</code>
          发送普通 Return 或 <code class="text-brand-400">ESC</code> + Return，Pi 使用本地 macOS 修饰键兜底并视作
          <code class="text-brand-400">Shift+Enter</code>；未按 Shift 的 <code class="text-brand-400">ESC</code> + Return 仍是
          <code class="text-brand-400">Alt+Enter</code>。该兜底只在 Pi 与 Terminal.app 在同一台 Mac 上时有效，
          通过 SSH 运行时无法检查本地修饰键状态。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">Ghostty</h2>
        <p class="text-surface-300 text-sm mb-3">若 <code class="text-brand-400">Alt+Backspace</code> 无效，加入映射：</p>
        <CodeBlock :code="ghosttyCode" language="text" />
        <p class="text-surface-400 text-sm mt-3">
          配置文件在 macOS 上是 <code class="text-brand-400">~/Library/Application Support/com.mitchellh.ghostty/config</code>，
          Linux 上是 <code class="text-brand-400">~/.config/ghostty/config</code>。
        </p>
        <p class="text-surface-300 text-sm mt-4">
          旧版 Claude Code 配置可能包含 <code class="text-brand-400">keybind = shift+enter=text:\n</code>，它发送裸换行，
          Pi 无法与 <code class="text-brand-400">Ctrl+J</code> 区分。若该映射只为旧版 Claude Code 添加，请移除。
          全屏模式下链接仍可点击，但 Ghostty 不会显示悬停下划线或 URL 预览；按住 macOS 的
          <code class="text-brand-400">Shift+Command</code> 或 Linux 的 <code class="text-brand-400">Shift+Ctrl</code>
          可使用 Ghostty 原生链接处理。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">WezTerm</h2>
        <p class="text-surface-300 text-sm mb-3">
          WezTerm 通常通过 xterm 扩展键上报 <code class="text-brand-400">Shift+Enter</code>。要显式启用 Kitty 键盘协议，
          创建 <code class="text-brand-400">~/.wezterm.lua</code>：
        </p>
        <CodeBlock :code="weztermCode" language="lua" />
        <p class="text-surface-300 text-sm mt-4 mb-3">
          macOS 上 WezTerm 默认把 <code class="text-brand-400">Option+Enter</code> 绑定为全屏。要用于 Pi 的后续队列，
          在 <code class="text-brand-400">config.keys</code> 中加入：
        </p>
        <CodeBlock :code="weztermAlt" language="lua" />
        <p class="text-surface-300 text-sm mt-4 mb-3">若 WSL 中 CJK 输入法候选窗口不跟随光标，显示硬件光标：</p>
        <CodeBlock :code="hardwareCursor" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          也可以把 Pi 设置中的 <code class="text-brand-400">showHardwareCursor</code> 设为 <code class="text-brand-400">true</code>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">Alacritty</h2>
        <p class="text-surface-300 text-sm mb-3">
          Alacritty 通常能上报 <code class="text-brand-400">Shift+Enter</code>；在 macOS 上
          <code class="text-brand-400">Option+Enter</code> 可能以普通 <code class="text-brand-400">Enter</code> 到达。
          在 <code class="text-brand-400">~/.config/alacritty/alacritty.toml</code> 中加入：
        </p>
        <CodeBlock :code="alacrittyCode" language="toml" />
        <p class="text-surface-400 text-sm mt-3">修改后重启 Alacritty。</p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">VS Code 与 Zed 内置终端</h2>
        <p class="text-surface-300 text-sm mb-3">
          VS Code 1.109.5 及更新版本默认在内置终端启用 Kitty 键盘协议。更早的版本需要为
          <code class="text-brand-400">Shift+Enter</code> 添加终端绑定：
        </p>
        <CodeBlock :code="vscodeCode" language="json" />
        <p class="text-surface-400 text-sm mt-3">
          用户 <code class="text-brand-400">keybindings.json</code> 通常位于 macOS 的
          <code class="text-brand-400">~/Library/Application Support/Code/User/</code>、Linux 的
          <code class="text-brand-400">~/.config/Code/User/</code> 或 Windows 的
          <code class="text-brand-400">%APPDATA%\\Code\\User\\</code>。
        </p>
        <p class="text-surface-300 text-sm mt-4 mb-3">Zed 的 <code class="text-brand-400">keymap.json</code>：</p>
        <CodeBlock :code="zedCode" language="json" />
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">Windows Terminal</h2>
        <p class="text-surface-300 text-sm mb-3">
          Pi 原生运行在 Windows 时会检查本地 Shift 状态，并在按住 Shift 时把普通 Return 或
          <code class="text-brand-400">ESC</code> + Return 视作 <code class="text-brand-400">Shift+Enter</code>；
          该兜底在 WSL 或 SSH 下无效。若 <code class="text-brand-400">Shift+Enter</code> 仍会提交，可显式转发。
          用 <code class="text-brand-400">Ctrl+Shift+,</code> 或 <strong class="text-surface-100">Settings &gt; Open JSON file</strong>
          打开设置，把以下对象加入 <code class="text-brand-400">actions</code> 数组：
        </p>
        <CodeBlock :code="windowsTerminalCode" language="json" />
        <p class="text-surface-300 text-sm mt-4">
          完全关闭并重开 Windows Terminal 后验证。Windows Terminal 默认把 <code class="text-brand-400">Alt+Enter</code>
          绑定为全屏，因此 Pi 在 Windows 与 WSL 上用 <code class="text-brand-400">Ctrl+Q</code> 排队后续消息；
          若要改用 <code class="text-brand-400">Alt+Enter</code>，需让终端转发该键，并在 Pi 的
          <code class="text-brand-400">keybindings.json</code> 中把 <code class="text-brand-400">app.message.followUp</code>
          绑定到 <code class="text-brand-400">alt+enter</code>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">其他终端</h2>
        <p class="text-surface-300 text-sm">
          <code class="text-brand-400">xfce4-terminal</code> 与 Terminator 无法可靠区分修改后的 Enter 与普通
          <code class="text-brand-400">Enter</code>，因此自定义的 <code class="text-brand-400">Ctrl+Enter</code> 或
          <code class="text-brand-400">Shift+Enter</code> 可能无效。需要这些快捷键时，请使用 Kitty、Ghostty、WezTerm、
          iTerm2、Windows Terminal 或兼容的 Alacritty。IntelliJ IDEA 内置终端同样无法可靠区分
          <code class="text-brand-400">Shift+Enter</code>，可用 <code class="text-brand-400">Ctrl+J</code> 换行；
          输入法窗口不跟随光标时使用上面的 <code class="text-brand-400">PI_HARDWARE_CURSOR=1</code>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">覆盖自动检测的能力</h2>
        <p class="text-surface-300 text-sm mb-3">
          Pi 会自动检测 OSC 8 超链接、内联图片协议与 truecolor 支持，终端代理或多路复用器可能让检测失准。
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">能力</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">环境变量</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">设置</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in capabilities" :key="c.cap" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ c.cap }}</td>
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ c.env }}</code></td>
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ c.setting }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          设置优先于环境变量；未设置或 <code class="text-brand-400">auto</code> 保持自动检测。只强制整个终端链路都支持的能力，
          不支持的转义序列可能破坏渲染。
        </p>
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">程序状态</h2>
        <p class="text-surface-300 text-sm mb-3">
          Pi 通过 Program Status Protocol（OSC 7501）上报状态，终端与 agent 面板可显示它是在工作、等待、完成还是失败：
        </p>
        <dl class="space-y-2 text-sm">
          <div v-for="s in status" :key="s.state" class="flex items-start gap-3">
            <code class="text-brand-400 text-xs shrink-0 w-20">{{ s.state }}</code>
            <dd class="text-surface-300">{{ s.when }}</dd>
          </div>
        </dl>
        <p class="text-surface-400 text-sm mt-3">
          上报从不包含提示或模型输出。Pi 只在终端回应协议支持查询后才发送；tmux 与 screen 不会转发。
          设置 <code class="text-brand-400">PI_PROGRAM_STATUS=1</code> 可不询问直接发送，
          <code class="text-brand-400">PI_PROGRAM_STATUS=0</code> 则完全关闭。
        </p>
      </section>
    </div>
  </div>
</template>
