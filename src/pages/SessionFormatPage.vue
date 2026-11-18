<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const locationCode = `~/.pi/agent/sessions/--<path>--/<timestamp>_<session-id>.jsonl`

const headerCode = `{"type":"session","version":3,"id":"uuid","timestamp":"2024-12-03T14:00:00.000Z","cwd":"/path/to/project"}`

const forkHeader = `{"type":"session","version":3,"id":"uuid","timestamp":"2024-12-03T14:00:00.000Z","cwd":"/path/to/project","parentSession":"/path/to/original/session.jsonl"}`

const baseCode = `interface SessionEntryBase {
  type: string;
  id: string;           // 通常是 8 位十六进制 ID，也可能退回完整 UUID
  parentId: string | null;  // 父条目 ID（根条目为 null）
  timestamp: string;    // ISO 时间戳
}`

const messageCode = `{"type":"message","id":"a0b1c2d3","parentId":null,"timestamp":"2024-12-03T14:00:00.000Z","message":{"role":"system","content":"","sections":{"preamble":"You are an expert coding assistant...","tools":"<tools>..."},"toolsAdded":[{"name":"read","description":"...","parameters":{}}],"timestamp":1733234400000}}
{"type":"message","id":"d4e5f6g7","parentId":"c3d4e5f6","timestamp":"2024-12-03T14:04:00.000Z","message":{"role":"user","content":"Hello","timestamp":1733234401000}}
{"type":"message","id":"b2c3d4e5","parentId":"d4e5f6g7","timestamp":"2024-12-03T14:00:02.000Z","message":{"role":"assistant","content":[{"type":"text","text":"Hi!"}],"api":"anthropic-messages","provider":"anthropic","model":"claude-sonnet-4-5","usage":{},"stopReason":"stop","timestamp":1733234402000}}
{"type":"message","id":"c3d4e5f6","parentId":"b2c3d4e5","timestamp":"2024-12-03T14:00:03.000Z","message":{"role":"toolResult","toolCallId":"call_123","toolName":"bash","content":[{"type":"text","text":"output"}],"isError":false,"timestamp":1733234403000}}`

const otherEntries = `{"type":"model_change","id":"d4e5f6g7","parentId":"c3d4e5f6","timestamp":"2024-12-03T14:05:00.000Z","provider":"openai","modelId":"gpt-4o"}
{"type":"thinking_level_change","id":"e5f6g7h8","parentId":"d4e5f6g7","timestamp":"2024-12-03T14:06:00.000Z","thinkingLevel":"high"}
{"type":"compaction","id":"f6g7h8i9","parentId":"e5f6g7h8","timestamp":"2024-12-03T14:10:00.000Z","summary":"User discussed X, Y, Z...","firstKeptEntryId":"c3d4e5f6","tokensBefore":50000}
{"type":"branch_summary","id":"g7h8i9j0","parentId":"a1b2c3d4","timestamp":"2024-12-03T14:15:00.000Z","fromId":"f6g7h8i9","summary":"Branch explored approach A..."}
{"type":"custom","id":"h8i9j0k1","parentId":"g7h8i9j0","timestamp":"2024-12-03T14:20:00.000Z","customType":"my-extension","data":{"count":42}}
{"type":"custom_message","id":"i9j0k1l2","parentId":"h8i9j0k1","timestamp":"2024-12-03T14:25:00.000Z","customType":"my-extension","content":"Injected context...","display":true}
{"type":"label","id":"j0k1l2m3","parentId":"i9j0k1l2","timestamp":"2024-12-03T14:30:00.000Z","targetId":"a1b2c3d4","label":"checkpoint-1"}
{"type":"session_info","id":"k1l2m3n4","parentId":"j0k1l2m3","timestamp":"2024-12-03T14:35:00.000Z","name":"Refactor auth module"}`

const entryTypes = [
  { type: 'session', desc: '文件首行，仅元数据，不属于树（没有 id/parentId）。' },
  { type: 'message', desc: '对话中的一条消息，message 字段是 AgentMessage。' },
  { type: 'model_change', desc: '会话中途切换模型；最新一条即当前选择。' },
  { type: 'thinking_level_change', desc: '用户修改思考/推理级别。' },
  { type: 'usage', desc: '归属于模型但不进入 LLM 上下文的用量，例如 cache_warm。' },
  { type: 'compaction', desc: '上下文压缩结果：摘要、保留起点与系统提示检查点。' },
  { type: 'context_edit', desc: '对较早条目的追加式修改，只影响未来的模型上下文。' },
  { type: 'branch_summary', desc: '通过 /tree 切换分支时对被放弃路径的摘要。' },
  { type: 'custom', desc: '扩展状态持久化，不参与 LLM 上下文。' },
  { type: 'custom_message', desc: '扩展注入的消息，参与 LLM 上下文。' },
  { type: 'label', desc: '用户定义的书签，label 设为 undefined 可清除。' },
  { type: 'session_info', desc: '会话元数据，例如显示名称。' },
]

const versions = [
  { v: '版本 1', desc: '线性条目序列（旧版，加载时自动迁移）' },
  { v: '版本 2', desc: '通过 id/parentId 连接的树结构' },
  { v: '版本 3', desc: '把 hookMessage 角色重命名为 custom（扩展统一）' },
]

const parseCode = `import { readFileSync } from "fs";

const lines = readFileSync("session.jsonl", "utf8").trim().split("\\n");

for (const line of lines) {
  const entry = JSON.parse(line);

  switch (entry.type) {
    case "session":
      console.log(\`Session v\${entry.version ?? 1}: \${entry.id}\`);
      break;
    case "message":
      console.log(\`[\${entry.id}] \${entry.message.role}: \${JSON.stringify(entry.message.content)}\`);
      break;
    case "compaction":
      console.log(\`[\${entry.id}] Compaction: \${entry.tokensBefore} tokens summarized\`);
      break;
    case "branch_summary":
      console.log(\`[\${entry.id}] Branch from \${entry.fromId}\`);
      break;
    case "usage":
      console.log(\`[\${entry.id}] Usage (\${entry.kind}): \${entry.usage.totalTokens} tokens\`);
      break;
    case "label":
      console.log(\`[\${entry.id}] Label "\${entry.label}" on \${entry.targetId}\`);
      break;
    case "model_change":
      console.log(\`[\${entry.id}] Model: \${entry.provider}/\${entry.modelId}\`);
      break;
  }
}`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">会话文件格式</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          会话保存为 JSONL（JSON Lines）文件，每行是一个带 <code class="text-brand-400">type</code> 字段的 JSON 对象。
          条目通过 <code class="text-brand-400">id</code>/<code class="text-brand-400">parentId</code> 构成树结构，
          因此可以在同一个文件内分支，而不必新建文件。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">文件位置</h2>
        <CodeBlock :code="locationCode" language="text" />
        <p class="text-surface-300 text-sm mt-3">
          默认 <code class="text-brand-400">&lt;session-id&gt;</code> 是 UUID，也可以通过 SDK 或
          <code class="text-brand-400">--session-id</code> 指定。对
          <code class="text-brand-400">&lt;path&gt;</code>，Pi 去掉前导路径分隔符，并把
          <code class="text-brand-400">/</code>、<code class="text-brand-400">\</code>、<code class="text-brand-400">:</code>
          替换为 <code class="text-brand-400">-</code>。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          删除 <code class="text-brand-400">~/.pi/agent/sessions/</code> 下的 <code class="text-brand-400">.jsonl</code>
          文件即可删除会话；也可以在 <code class="text-brand-400">/resume</code> 中选择会话按
          <code class="text-brand-400">Ctrl+D</code> 后确认删除。可用时 Pi 会使用 <code class="text-brand-400">trash</code>
          命令，避免永久删除。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">会话版本</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div v-for="v in versions" :key="v.v" class="glass-card p-4">
            <p class="text-surface-100 text-sm font-medium">{{ v.v }}</p>
            <p class="text-surface-400 text-xs mt-1">{{ v.desc }}</p>
          </div>
        </div>
        <p class="text-surface-300 text-sm mt-3">已有会话在加载时自动迁移到当前版本（v3）。</p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">会话头与条目基类</h2>
        <p class="text-surface-300 text-sm mb-3">
          <code class="text-brand-400">session</code> 是文件第一行，只有元数据；有父会话时（通过
          <code class="text-brand-400">/fork</code>、<code class="text-brand-400">/clone</code> 或 SDK 创建）会带
          <code class="text-brand-400">parentSession</code>：
        </p>
        <CodeBlock :code="headerCode" language="json" />
        <CodeBlock :code="forkHeader" language="json" />
        <p class="text-surface-300 text-sm mt-4 mb-3">除会话头外，所有条目都扩展自：</p>
        <CodeBlock :code="baseCode" language="typescript" />
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">条目类型</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">type</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in entryTypes" :key="t.type" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ t.type }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ t.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4 mb-3">
          消息条目保存 <code class="text-brand-400">AgentMessage</code>。系统消息承载提示与工具清单：会话首个请求会持久化一条包含全部提示段落与工具声明的记录，
          后续变化则以按名字打补丁（<code class="text-brand-400">null</code> 表示移除）并列出
          <code class="text-brand-400">toolsAdded</code>/<code class="text-brand-400">toolsRemoved</code> 的系统消息保存。
        </p>
        <CodeBlock :code="messageCode" language="json" />
        <p class="text-surface-300 text-sm mt-4 mb-3">其他条目示例：</p>
        <CodeBlock :code="otherEntries" language="json" />
        <p class="text-surface-300 text-sm mt-4">
          压缩条目中的 <code class="text-brand-400">firstKeptEntryId</code> 是必需的，表示压缩后保留的第一条旧条目；
          不保留任何旧条目的压缩会把自身 ID 填在这里。<code class="text-brand-400">context_edit</code> 的
          <code class="text-brand-400">replacement: null</code> 表示把目标从模型上下文中省略，非 null 时只替换消息内容；
          同一目标有多条编辑时，活动分支上最新的一条生效。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">树结构与上下文构建</h2>
        <p class="text-surface-300 text-sm mb-3">
          条目通常构成一棵树：根条目 <code class="text-brand-400">parentId: null</code>，分支从较早的条目创建新子节点，
          “叶子”就是当前位置。<code class="text-brand-400">resetLeaf()</code> 或
          <code class="text-brand-400">branchWithSummary(null, ...)</code> 可以让后续条目成为另一个根。
        </p>
        <pre class="glass-card p-4 text-xs text-surface-300 overflow-x-auto leading-relaxed">[user msg] ─── [assistant] ─── [user msg] ─── [assistant] ─┬─ [user msg] ← 当前叶子
                                                            │
                                                            └─ [branch_summary] ─── [user msg] ← 另一分支</pre>
        <p class="text-surface-300 text-sm mt-4">
          <code class="text-brand-400">buildContextEntries()</code> 从当前叶子走到根，生成活动条目列表并处理压缩：
          先收集路径上的所有条目；若路径上有一个或多个压缩条目，取最新的一条，包含该压缩条目本身、
          <code class="text-brand-400">firstKeptEntryId</code> 到压缩条目之前的非系统条目，以及压缩之后的条目。
          <code class="text-brand-400">buildSessionProjection()</code> 再对每个目标应用最新的
          <code class="text-brand-400">context_edit</code>，最后
          <code class="text-brand-400">buildSessionContext()</code> 把选中的条目转换成给 LLM 的消息列表：
          消息直接使用已存的 <code class="text-brand-400">AgentMessage</code>，压缩变成完整系统检查点加摘要，
          分支摘要变成 <code class="text-brand-400">branchSummary</code>，扩展消息变成
          <code class="text-brand-400">CustomMessage</code>，而 <code class="text-brand-400">usage</code>、
          <code class="text-brand-400">custom</code> 与 <code class="text-brand-400">context_edit</code> 本身不产生上下文消息。
        </p>
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">解析示例</h2>
        <CodeBlock :code="parseCode" language="typescript" />
        <p class="text-surface-400 text-sm mt-3">
          TypeScript 定义可从 <code class="text-brand-400">node_modules/@earendil-works/pi-coding-agent/dist/</code>
          与 <code class="text-brand-400">node_modules/@earendil-works/pi-ai/dist/</code> 查看。
        </p>
      </section>
    </div>
  </div>
</template>
