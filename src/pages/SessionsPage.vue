<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const resumeCode = `pi --continue
pi --resume`

const workingDirs = [
  { entry: '--continue', dir: '当前目录' },
  { entry: '--resume、/resume、--session、/import', dir: '会话自己的工作目录，可能与当前目录不同' },
  { entry: '--fork，或从其他目录选择 --session ID 后分叉', dir: '当前目录，作为新会话' },
]

const branching = [
  { action: '/tree', result: '在当前会话文件内移动', when: '相关的替代方案应当放在一起' },
  { action: '/fork', result: '从较早的用户消息创建新会话', when: '该替代方案应当成为独立的工作' },
  { action: '/clone', result: '把活动分支复制到新会话', when: '你想要当前状态的一个独立副本' },
]

const storageCode = `pi --session-dir <dir>          # 覆盖存储位置（优先级最高）
export PI_CODING_AGENT_SESSION_DIR=...  # 环境变量
pi --no-session                # 临时会话，退出后无法恢复`

const missingDirChoices = [
  { choice: 'Continue', desc: '在当前目录运行该会话。Pi 不保存这个选择，下次打开时仍会询问。' },
  { choice: 'Fork', desc: '把会话复制到当前目录，成为带新 ID 的新会话（类似 --fork）。原会话保持不变。' },
  { choice: 'Cancel', desc: '保持当前会话打开；在启动阶段则直接退出。' },
]

const pickerKeys = [
  { key: '输入搜索', action: '按名称或内容筛选会话' },
  { key: 'Ctrl+P', action: '切换路径显示' },
  { key: 'Ctrl+S', action: '切换排序模式' },
  { key: 'Ctrl+N', action: '只显示已命名的会话' },
  { key: 'Ctrl+R', action: '重命名会话' },
  { key: 'Ctrl+D', action: '删除会话，然后确认' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">会话与上下文</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 把对话保存为会话。会话的活动分支提供下一次模型请求的对话历史。
          用会话命令继续工作、探索另一个分支，或减少发送给模型的历史。
        </p>
      </div>

      <!-- Continue -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">继续或切换会话</h2>
        <p class="text-surface-300 mb-3">
          除非用 <code class="text-brand-400">--no-session</code> 启动，Pi 会自动保存会话。
        </p>
        <CodeBlock :code="resumeCode" language="bash" />
        <p class="text-surface-300 text-sm mt-3">
          <code class="text-brand-400">--continue</code> 打开当前目录最近的会话；<code class="text-brand-400">--resume</code>
          打开会话选择器。交互模式中 <code class="text-brand-400">/resume</code> 打开同一个选择器，<code class="text-brand-400">/new</code>
          开始新会话。
        </p>
        <p class="text-surface-300 text-sm mt-4 mb-2">
          每个会话记录创建时的工作目录，且永不改变。Pi 在会话的工作目录中运行，因此工具、<code class="text-brand-400">@path</code>
          引用、项目配置和上下文文件都从那里解析。
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">入口</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">工作目录</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in workingDirs" :key="w.entry" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ w.entry }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ w.dir }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          如果会话的工作目录已不存在（例如项目文件夹被重命名），交互模式会询问如何打开它：
        </p>
        <ul class="space-y-2 mt-2">
          <li v-for="c in missingDirChoices" :key="c.choice" class="flex items-start gap-2 text-sm text-surface-300">
            <code class="text-brand-400 shrink-0">{{ c.choice }}</code><span>{{ c.desc }}</span>
          </li>
        </ul>
        <p class="text-surface-400 text-sm mt-3">其他模式会以错误退出。</p>
        <p class="text-surface-300 text-sm mt-3">
          用 <code class="text-brand-400">/name</code> 或 <code class="text-brand-400">--name</code> 给会话起名；运行
          <code class="text-brand-400">/session</code> 查看当前会话文件、ID、消息数、token 用量和成本。
        </p>
      </section>

      <!-- Picker -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">会话选择器</h2>
        <p class="text-surface-300 mb-3">选择器可以搜索、重命名和删除会话，也能显示路径、切换排序以及只显示命名会话。</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">操作</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in pickerKeys" :key="k.key" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ k.key }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ k.action }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Branching -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择分支方式</h2>
        <p class="text-surface-300 mb-3">Pi 把条目存为树，因此回到较早的位置不会删除你离开的分支。</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">操作</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">结果</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">适用场景</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in branching" :key="b.action" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ b.action }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ b.result }}</td>
                <td class="py-3 px-4 text-surface-400">{{ b.when }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-3">
          在 <code class="text-brand-400">/tree</code> 中选择一条用户消息，会把它的文本放回编辑器；编辑并提交即可创建另一个分支。
          选择 assistant 响应或其他条目则在该条目之后以空编辑器继续。
          离开某个分支时，Pi 可以总结它并把摘要附加到你进入的分支上，从被放弃的路径中保留相关工作，而不必带上每条消息。
        </p>
      </section>

      <!-- Context -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">管理对话上下文</h2>
        <p class="text-surface-300 mb-3">
          模型收到的是活动分支，而不是会话文件中的所有分支。Pi 把这段历史与系统提示、发现的上下文文件、可用工具和已加载的技能描述组合起来。
        </p>
        <p class="text-surface-300 mb-3">
          页脚显示当前上下文用量。当活动上下文接近模型限制时，Pi 通常会自动压缩较旧的历史。压缩会添加一条摘要并保留近期消息，
          但不会删除原始会话条目。
        </p>
        <p class="text-surface-300">
          运行 <code class="text-brand-400">/compact</code> 手动压缩，也可以附加指令以保留特定主题或决定。自动压缩和保留历史可通过
          <router-link to="/settings" class="text-brand-400 hover:text-brand-300">设置</router-link> 配置。
          如果提供商不可用或无法接受摘要请求，压缩可能失败；解决提供商问题后再次运行 <code class="text-brand-400">/compact</code>。
          禁用自动压缩不会禁用这个手动命令。阈值、保留边界、分支摘要行为和扩展钩子见
          <router-link to="/compaction" class="text-brand-400 hover:text-brand-300">上下文压缩</router-link>。
        </p>
      </section>

      <!-- Storage -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">控制会话存储</h2>
        <p class="text-surface-300 mb-3">
          默认情况下 Pi 把会话保存在 <code class="text-brand-400">~/.pi/agent/sessions/</code> 下，按工作目录分组。
        </p>
        <CodeBlock :code="storageCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          临时会话在 Pi 退出后无法恢复。
        </p>
      </section>

      <!-- Export and share -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">导出或分享会话</h2>
        <p class="text-surface-300 mb-3">
          <code class="text-brand-400">/export</code> 把当前会话写成 HTML 或 JSONL；<code class="text-brand-400">/share</code>
          上传会话并返回查看链接。默认情况下，配置了 Radius 认证时 Pi 使用 Radius artifact，否则使用私有 GitHub gist。
          把 <code class="text-brand-400">sessionShareDestination</code> 设置为 <code class="text-brand-400">gist</code> 或
          <code class="text-brand-400">radius</code> 可强制指定目标。
        </p>
        <p class="text-surface-400 text-sm">
          导出或分享前请先检查内容：其中可能包含提示、模型响应、工具参数、命令输出、文件内容和扩展消息。
        </p>
      </section>

      <!-- Bug report -->
      <section class="mb-12 glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">报告问题</h2>
        <p class="text-surface-300 text-sm mb-2">
          运行 <code class="text-brand-400">/bug [description]</code> 为 Pi 开发者准备私密报告。你可以附带会话转录、省略它，
          或让当前模型总结问题。报告包含环境与提供商配置（不含凭证值）以及记录的错误诊断。
        </p>
        <p class="text-surface-300 text-sm">
          可通过 <code class="text-brand-400">radius.pi.dev</code> 上传，或把同一份报告导出为 zip 自行检查与分享。
          上传不需要登录；Radius 认证会把报告归属到你的账号，便于开发者跟进。上传失败时 Pi 会提供导出 zip 的选项。
        </p>
      </section>
    </div>
  </div>
</template>
