<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const sessionCommands = [
  { cmd: '/resume', desc: '浏览和选择之前的会话' },
  { cmd: '/new', desc: '开始新会话' },
  { cmd: '/name <name>', desc: '设置当前会话显示名称' },
  { cmd: '/session', desc: '显示会话信息' },
  { cmd: '/tree', desc: '导航当前会话树' },
  { cmd: '/fork', desc: '从先前的用户消息创建新会话' },
  { cmd: '/clone', desc: '将当前活动分支复制到新会话' },
  { cmd: '/compact [prompt]', desc: '总结旧上下文' },
  { cmd: '/export [file]', desc: '导出会话为 HTML' },
  { cmd: '/share', desc: '上传为私有 GitHub gist' },
]

const treeControls = [
  { key: '↑/↓', action: '导航可见条目' },
  { key: '←/→', action: '向上/向下翻页' },
  { key: 'Ctrl+←/Ctrl+→', action: '折叠/展开或在分支段之间跳转' },
  { key: 'Shift+L', action: '设置或清除选中条目的标签' },
  { key: 'Shift+T', action: '切换标签时间戳' },
  { key: 'Enter', action: '选择条目' },
  { key: 'Escape/Ctrl+C', action: '取消' },
  { key: 'Ctrl+O', action: '循环过滤模式' },
]

const treeExample = `├─ user: "Hello, can you help..."
│  └─ assistant: "Of course! I can..."
│     ├─ user: "Let's try approach A..."
│     │  └─ assistant: "For approach A..."
│     │     └─ user: "That worked..."  ← active
│     └─ user: "Actually, approach B..."
│        └─ assistant: "For approach B..."`

const storageCode = `# 继续最近的会话
pi -c

# 浏览之前的会话
pi -r

# 临时模式；不保存
pi --no-session

# 设置会话显示名称
pi --name "my task"

# 使用特定会话文件
pi --session <path|id>

# 分叉会话
pi --fork <path|id>`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">会话管理</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 将对话保存为会话，让你可以继续工作、从早期轮次分支并重新访问之前的路径。
        </p>
      </div>

      <!-- Session Storage -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">会话存储</h2>
        <p class="text-surface-300 mb-4">
          会话自动保存到 <code class="text-brand-400">~/.pi/agent/sessions/</code>，按工作目录组织。每个会话是一个 JSONL 文件，具有树形结构。
        </p>
        <CodeBlock :code="storageCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          在交互模式中使用 <code class="text-brand-400">/session</code> 查看当前会话文件、会话 ID、消息数、token 数和成本。
        </p>
      </section>

      <!-- Session Commands -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">会话命令</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">命令</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cmd in sessionCommands" :key="cmd.cmd" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ cmd.cmd }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ cmd.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Resuming and Deleting -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">恢复和删除会话</h2>
        <p class="text-surface-300 mb-4">
          <code class="text-brand-400">/resume</code> 打开当前项目的交互式会话选择器。<code class="text-brand-400">pi -r</code> 在启动时打开相同的选择器。
        </p>
        <div class="glass-card p-4">
          <h4 class="font-semibold text-surface-100 mb-2">选择器操作</h4>
          <ul class="space-y-1 text-surface-300 text-sm">
            <li>• 输入搜索</li>
            <li>• Ctrl+P 切换路径显示</li>
            <li>• Ctrl+S 切换排序模式</li>
            <li>• Ctrl+N 过滤到命名会话</li>
            <li>• Ctrl+R 重命名</li>
            <li>• Ctrl+D 删除，然后确认</li>
          </ul>
        </div>
      </section>

      <!-- Branching with /tree -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">使用 /tree 分支</h2>
        <p class="text-surface-300 mb-4">
          会话以树形结构存储。每个条目都有 <code class="text-brand-400">id</code> 和 <code class="text-brand-400">parentId</code>，当前位置是活动叶子。
          <code class="text-brand-400">/tree</code> 让你跳转到任何先前的节点并从那里继续，而不创建新文件。
        </p>
        <CodeBlock :code="treeExample" language="text" filename="树形结构示例" />
      </section>

      <!-- Tree Controls -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">树控制</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">按键</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ctrl in treeControls" :key="ctrl.key" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ ctrl.key }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ ctrl.action }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          过滤模式：default、no-tools、user-only、labeled-only、all。使用 <code class="text-brand-400">treeFilterMode</code> 配置默认值。
        </p>
      </section>

      <!-- Naming Sessions -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">命名会话</h2>
        <p class="text-surface-300 mb-4">
          使用 <code class="text-brand-400">/name &lt;name&gt;</code> 设置人类可读的会话名称：
        </p>
        <CodeBlock code="/name Refactor auth module" language="text" />
        <p class="text-surface-400 text-sm mt-3">
          在启动时使用 <code class="text-brand-400">--name</code> 或 <code class="text-brand-400">-n</code> 设置名称。
        </p>
      </section>
    </div>
  </div>
</template>
