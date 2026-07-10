<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const mechanisms = [
  { name: '压缩 (Compaction)', trigger: '上下文超过阈值，或 /compact', purpose: '总结旧消息以释放上下文' },
  { name: '分支摘要 (Branch Summary)', trigger: '/tree 导航', purpose: '切换分支时保留上下文' },
]

const compactionFlow = `压缩前：
  entry:  0     1     2     3      4     5     6      7      8     9
        ┌─────┬─────┬─────┬─────┬──────┬─────┬─────┬──────┬──────┬─────┐
        │ hdr │ usr │ ass │ tool │ usr │ ass │ tool │ tool │ ass │ tool│
        └─────┴─────┴─────┴──────┴─────┴─────┴──────┴──────┴─────┴─────┘
                └────────┬───────┘ └──────────────┬──────────────┘
               messagesToSummarize            kept messages

压缩后：
  entry:  0     1     2     3      4     5     6      7      8     9     10
        ┌─────┬─────┬─────┬─────┬──────┬─────┬─────┬──────┬──────┬─────┬─────┐
        │ hdr │ usr │ ass │ tool │ usr │ ass │ tool │ tool │ ass │ tool│ cmp │
        └─────┴─────┴─────┴──────┴─────┴─────┴──────┴──────┴─────┴─────┴─────┘
               └──────────┬──────┘ └──────────────────────┬───────────────────┘
                 not sent to LLM                    sent to LLM`

const settingsCode = `{
  "reserveTokens": 16384,
  "keepRecentTokens": 20000,
  "branchSummaryEnabled": true,
  "branchSummaryKeepRecentTokens": 10000
}`

const customCompactionCode = `// 通过扩展自定义压缩
pi.on("session_before_compact", async (event, ctx) => {
  // 实现自定义压缩逻辑
  return {
    summary: "自定义摘要...",
    firstKeptEntryId: event.firstKeptEntryId,
  };
});`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">上下文压缩</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          LLM 有有限的上下文窗口。当对话变得太长时，Pi 使用压缩来总结旧内容，同时保留最近的工作。
        </p>
      </div>

      <!-- Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">概述</h2>
        <p class="text-surface-300 mb-4">Pi 有两种摘要机制：</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">机制</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">触发条件</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">用途</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in mechanisms" :key="m.name" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100 font-medium">{{ m.name }}</td>
                <td class="py-3 px-4 text-surface-300">{{ m.trigger }}</td>
                <td class="py-3 px-4 text-surface-300">{{ m.purpose }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          两者都使用相同的结构化摘要格式，并累积跟踪文件操作。
        </p>
      </section>

      <!-- Compaction -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">压缩</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">触发条件</h3>
            <p class="text-surface-300 mb-3">自动压缩触发条件：</p>
            <CodeBlock code="contextTokens > contextWindow - reserveTokens" language="text" />
            <p class="text-surface-400 text-sm mt-2">
              默认情况下，<code class="text-brand-400">reserveTokens</code> 是 16384 个 token（可在设置中配置）。
              你也可以使用 <code class="text-brand-400">/compact [instructions]</code> 手动触发。
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">工作原理</h3>
            <ol class="space-y-2 text-surface-300">
              <li class="flex items-start gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm shrink-0">1</span>
                <span><strong class="text-surface-100">找到切割点</strong>：从最新消息向后遍历，累积 token 估计值直到达到 keepRecentTokens</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm shrink-0">2</span>
                <span><strong class="text-surface-100">提取消息</strong>：收集从上一个保留边界到切割点的消息</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm shrink-0">3</span>
                <span><strong class="text-surface-100">生成摘要</strong>：调用 LLM 以结构化格式进行总结</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm shrink-0">4</span>
                <span><strong class="text-surface-100">追加条目</strong>：保存 CompactionEntry 和 firstKeptEntryId</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm shrink-0">5</span>
                <span><strong class="text-surface-100">重载</strong>：会话重载，使用摘要 + 从 firstKeptEntryId 开始的消息</span>
              </li>
            </ol>
          </div>

          <CodeBlock :code="compactionFlow" language="text" filename="压缩前后对比" />
        </div>
      </section>

      <!-- Branch Summarization -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">分支摘要</h2>
        <p class="text-surface-300 mb-4">
          当你在 <code class="text-brand-400">/tree</code> 中导航到另一个分支时，分支摘要会保留当前分支的上下文。
        </p>
        <div class="glass-card p-4">
          <h4 class="font-semibold text-surface-100 mb-2">触发条件</h4>
          <p class="text-surface-300 text-sm">
            当导航到不是当前活动分支后代的分支条目时触发。
          </p>
        </div>
      </section>

      <!-- Settings -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">设置</h2>
        <CodeBlock :code="settingsCode" language="json" filename="~/.pi/agent/settings.json" />
      </section>

      <!-- Custom Compaction -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">通过扩展自定义压缩</h2>
        <CodeBlock :code="customCompactionCode" language="typescript" filename="自定义压缩扩展" />
      </section>
    </div>
  </div>
</template>
