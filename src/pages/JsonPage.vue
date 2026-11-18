<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const runCode = `pi --mode json "Review this repository"`;

const headerCode = `{"type":"session","version":3,"id":"uuid","timestamp":"2024-12-03T14:00:00.000Z","cwd":"/path"}`;

const sequenceCode = `{"type":"agent_start"}
{"type":"turn_start"}
{"type":"message_start","message":{"role":"user","content":"Review this repository","timestamp":1733234401000}}
{"type":"message_end","message":{"role":"user","content":"Review this repository","timestamp":1733234401000}}
{"type":"message_start","message":{"role":"assistant","content":[],"stopReason":"pending"}}
{"type":"message_update","usage":{},"assistantMessageEvent":{"type":"text_delta","contentIndex":0,"delta":"Hello"}}
{"type":"message_end","message":{"role":"assistant"}}
{"type":"turn_end","message":{"role":"assistant"},"toolResults":[]}
{"type":"agent_end","messages":[],"willRetry":false}
{"type":"agent_settled","aborted":false}`;

const agentEvents = [
  { event: "agent_start", fields: "无", meaning: "底层 agent 运行开始。" },
  {
    event: "agent_end",
    fields: "messages、willRetry",
    meaning: "该底层运行结束，messages 包含本次生成的消息。",
  },
  {
    event: "agent_settled",
    fields: "aborted",
    meaning: "Pi 不会自动通过重试、压缩恢复或排队消息继续；被中止结束时 aborted 为 true。",
  },
  { event: "turn_start", fields: "无", meaning: "一个 assistant 回合开始。" },
  {
    event: "turn_end",
    fields: "message、toolResults",
    meaning: "一条 assistant 响应及其工具调用结束。",
  },
];

const messageEvents = [
  { event: "message_start", fields: "message", meaning: "一条消息开始。" },
  {
    event: "message_update",
    fields: "usage、assistantMessageEvent",
    meaning: "assistant 消息产生内容块更新。",
  },
  { event: "message_end", fields: "message", meaning: "消息完成；这是权威的最终消息。" },
];

const nested = [
  { type: "start", extra: "无", meaning: "提供商流开始；线上的 partial 字段已被移除。" },
  { type: "text_start", extra: "contentIndex", meaning: "文本块开始。" },
  { type: "text_delta", extra: "contentIndex、delta", meaning: "向文本块追加文本。" },
  { type: "text_end", extra: "contentIndex、content", meaning: "文本块以权威内容结束。" },
  { type: "thinking_start", extra: "contentIndex", meaning: "思考块开始。" },
  { type: "thinking_delta", extra: "contentIndex、delta", meaning: "向思考块追加文本。" },
  { type: "thinking_end", extra: "contentIndex、content", meaning: "思考块以权威内容结束。" },
  { type: "toolcall_start", extra: "contentIndex、id、toolName", meaning: "工具调用块开始。" },
  { type: "toolcall_delta", extra: "contentIndex、delta", meaning: "追加序列化的参数数据。" },
  {
    type: "toolcall_end",
    extra: "contentIndex、toolCall",
    meaning: "工具调用以完整的 ToolCall 结束。",
  },
  { type: "done", extra: "reason、message", meaning: "提供商流成功完成。" },
  { type: "error", extra: "reason、error", meaning: "提供商流以错误或中止消息结束。" },
];

const toolEvents = [
  {
    event: "tool_execution_start",
    fields: "toolCallId、toolName、args",
    meaning: "工具开始执行。",
  },
  {
    event: "tool_execution_update",
    fields: "toolCallId、toolName、args、partialResult",
    meaning: "工具报告了部分结果。",
  },
  {
    event: "tool_execution_end",
    fields: "toolCallId、toolName、result、isError、durationMs",
    meaning: "工具执行结束；durationMs 是 execute() 的单调时钟耗时，工具未运行时缺省。",
  },
];

const stateEvents = [
  {
    event: "queue_update",
    fields: "steering、followUp",
    meaning: "待处理的引导或后续队列变化，两个字段都是完整当前队列。",
  },
  {
    event: "entry_appended",
    fields: "entry",
    meaning: "扩展通过 pi.appendEntry() 追加了自定义会话条目。",
  },
  {
    event: "session_info_changed",
    fields: "name",
    meaning: "会话显示名变化；name 缺省表示被清除。",
  },
  { event: "thinking_level_changed", fields: "level", meaning: "活动思考级别变化。" },
];

const jqCode = `pi --mode json "List files" 2>/dev/null | jq -c 'select(.type == "message_end")'`;

const typesCode = `type WithoutPartial<T> = T extends { partial: unknown } ? Omit<T, "partial"> : T;

type JsonAssistantMessageEvent<T> = T extends { type: "toolcall_start"; partial: unknown }
  ? WithoutPartial<T> & { id: string; toolName: string }
  : WithoutPartial<T>;

type JsonAgentSessionEvent =
  | Exclude<AgentSessionEvent, { type: "message_update" }>
  | {
      type: "message_update";
      usage: Usage;
      assistantMessageEvent: JsonAssistantMessageEvent<AssistantMessageEvent>;
    };`;
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">JSON 事件流</h1>
        <p class="text-lg text-surface-400 leading-relaxed">JSON 模式为一次调用输出结构化进度：</p>
        <CodeBlock :code="runCode" language="bash" />
        <p class="text-surface-300 text-sm mt-3">
          Pi 先写一条会话头，再写会话事件，给定提示完成后退出。RPC
          模式发出相同形状的会话事件，但没有会话头，
          因为它是双向长连接协议。本页是 JSON 与 RPC 共用事件的权威参考。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">分帧与进程 I/O</h2>
        <p class="text-surface-300 text-sm">
          流使用严格 JSONL 分帧：每条记录是一个以 LF（<code class="text-brand-400">\n</code>）结尾的
          JSON 对象。
          只按 LF 切分记录，并剥掉可能的前置回车。Unicode 行分隔符与段落分隔符在 JSON
          字符串内合法，不是记录边界。 Node.js 的
          <code class="text-brand-400">readline</code> 不适合该流，因为它也识别这些 Unicode 分隔符；
          请使用字节或 UTF-8 流解码并按 LF 切分。要持续读取 stdout——停止消费会在管道缓冲填满时阻塞
          Pi。 stdout 专用于 JSONL，诊断与应用日志写入 stderr。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">会话头</h2>
        <p class="text-surface-300 text-sm mb-3">JSON 模式的第一条记录是当前会话头：</p>
        <CodeBlock :code="headerCode" language="json" />
        <p class="text-surface-400 text-sm mt-3">
          RPC 模式不发送该记录，改用 <code class="text-brand-400">get_state</code> 获取当前会话 ID
          与文件。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">事件顺序</h2>
        <CodeBlock :code="sequenceCode" language="json" />
        <p class="text-surface-300 text-sm mt-3">
          <code class="text-brand-400">agent_end</code> 结束一次底层 agent
          运行，但自动重试、溢出恢复、压缩重试、引导或后续工作仍可能继续；
          <code class="text-brand-400">agent_settled</code> 表示 Pi
          对该会话级运行没有剩余的自动工作。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">Agent 与回合事件</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">事件</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">字段</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">含义</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in agentEvents" :key="e.event" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ e.event }}</code></td>
                <td class="py-3 px-4 text-surface-400 text-xs">{{ e.fields }}</td>
                <td class="py-3 px-4 text-surface-300">{{ e.meaning }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          一个回合是一条 assistant 响应加上它产生的工具调用与结果。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">消息事件</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">事件</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">字段</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">含义</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in messageEvents" :key="e.event" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ e.event }}</code></td>
                <td class="py-3 px-4 text-surface-400 text-xs">{{ e.fields }}</td>
                <td class="py-3 px-4 text-surface-300">{{ e.meaning }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          线上的 <code class="text-brand-400">message_update</code> 只含增量，省略了 SDK 事件的累计
          <code class="text-brand-400">message</code> 与每个
          <code class="text-brand-400">partial</code> 快照，
          使流大小保持线性。嵌套事件类型：
        </p>
        <div class="overflow-x-auto mt-3">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">type</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">额外字段</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">含义</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in nested" :key="n.type" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ n.type }}</code></td>
                <td class="py-3 px-4 text-surface-400 text-xs">{{ n.extra }}</td>
                <td class="py-3 px-4 text-surface-300">{{ n.meaning }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          用 <code class="text-brand-400">contentIndex</code> 定位内容块。为实时显示缓冲
          <code class="text-brand-400">delta</code>，但在
          <code class="text-brand-400">text_end</code>、
          <code class="text-brand-400">thinking_end</code> 或
          <code class="text-brand-400">toolcall_end</code> 到达后用完整内容替换重建结果；<code
            class="text-brand-400"
            >message_end.message</code
          >
          到达时替换整个部分消息。
          顶层 <code class="text-brand-400">usage</code> 是该 assistant
          响应最新的累计用量，某些提供商在流式期间不报用量，
          因此完成前可能一直为零。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">工具执行事件</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">事件</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">字段</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">含义</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in toolEvents" :key="e.event" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ e.event }}</code></td>
                <td class="py-3 px-4 text-surface-400 text-xs">{{ e.fields }}</td>
                <td class="py-3 px-4 text-surface-300">{{ e.meaning }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          用 <code class="text-brand-400">toolCallId</code> 关联生命周期。<code
            class="text-brand-400"
            >partialResult</code
          >
          是工具提供的最新部分结果；它替换还是扩增上一次更新取决于该工具的结果约定。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">队列与状态事件</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">事件</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">字段</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">含义</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in stateEvents" :key="e.event" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ e.event }}</code></td>
                <td class="py-3 px-4 text-surface-400 text-xs">{{ e.fields }}</td>
                <td class="py-3 px-4 text-surface-300">{{ e.meaning }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">压缩与重试事件</h2>
        <p class="text-surface-300 text-sm mb-3">
          <code class="text-brand-400">compaction_start</code> 的
          <code class="text-brand-400">reason</code> 为
          <code class="text-brand-400">"manual"</code>、<code class="text-brand-400"
            >"threshold"</code
          >
          或 <code class="text-brand-400">"overflow"</code>。
          <code class="text-brand-400">compaction_end</code> 成功时包含
          <code class="text-brand-400">result</code>
          （summary、firstKeptEntryId、tokensBefore、estimatedTokensAfter、usage、details）；
          被中止时 result 缺省且 <code class="text-brand-400">aborted</code> 为 true；失败时 result
          缺省、 aborted 为 false，并由
          <code class="text-brand-400">errorMessage</code> 描述原因。溢出恢复成功会在重试提示前把
          <code class="text-brand-400">willRetry</code> 设为 true。
        </p>
        <CodeBlock
          code='{"type":"auto_retry_start","attempt":1,"maxAttempts":3,"delayMs":2000,"errorMessage":"529 overloaded"}
{"type":"auto_retry_end","success":true,"attempt":2}
{"type":"summarization_retry_scheduled","attempt":1,"maxAttempts":3,"delayMs":2000,"errorMessage":"terminated"}
{"type":"summarization_retry_attempt_start","source":"compaction","reason":"threshold"}
{"type":"summarization_retry_finished"}'
          language="json"
        />
        <p class="text-surface-300 text-sm mt-3">
          分支摘要的 <code class="text-brand-400">source</code> 是
          <code class="text-brand-400">"branchSummary"</code> 且没有
          <code class="text-brand-400">reason</code>。最终失败时
          <code class="text-brand-400">auto_retry_end</code> 的 success 为 false，并带
          <code class="text-brand-400">finalError</code>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">仅 RPC 的事件</h2>
        <p class="text-surface-300 text-sm mb-3">
          RPC 的 <code class="text-brand-400">bash</code> 命令每个输出块发一条
          <code class="text-brand-400">bash_execution_update</code>，可选
          <code class="text-brand-400">id</code>
          与命令 ID 一致；命令响应可能截断输出，而这些事件流出全部内容：
        </p>
        <CodeBlock
          code='{"type":"bash_execution_update","id":"req-1","delta":"total 48\n"}'
          language="json"
        />
        <p class="text-surface-300 text-sm mt-4 mb-3">扩展处理器抛错时 RPC 还会发送：</p>
        <CodeBlock
          code='{"type":"extension_error","extensionPath":"/path/to/extension.ts","event":"tool_call","error":"Error message"}'
          language="json"
        />
        <p class="text-surface-400 text-sm mt-3">
          扩展 UI 记录是独立的 RPC 子协议，不是
          <code class="text-brand-400">AgentSessionEvent</code>。
        </p>
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">
          TypeScript 类型与示例
        </h2>
        <p class="text-surface-300 text-sm mb-3">
          SDK 的
          <code class="text-brand-400">AgentSessionEvent</code> 为进程内消费者提供累计流式快照；
          JSON 与 RPC 只转换 <code class="text-brand-400">message_update</code>：
        </p>
        <CodeBlock :code="typesCode" language="typescript" />
        <p class="text-surface-300 text-sm mt-4 mb-3">打印一次性运行中的完整消息：</p>
        <CodeBlock :code="jqCode" language="bash" />
      </section>
    </div>
  </div>
</template>
