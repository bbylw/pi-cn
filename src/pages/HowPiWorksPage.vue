<script setup lang="ts">
const loopSteps = [
  {
    title: "提交消息",
    desc: "消息被加入活动分支，Pi 用系统提示、活动分支、可用工具和模型设置构建请求，并通过选定的提供商发送。",
  },
  { title: "流式响应", desc: "提供商流式返回 assistant 响应，其中可能包含文本和工具调用。" },
  { title: "执行工具", desc: "Pi 记录响应，执行每个工具调用并记录结果，这一轮结束。" },
  {
    title: "继续或结束",
    desc: "如果工具结果或排队的消息需要再次请求模型，Pi 开始新的一轮；否则本次运行结束。",
  },
];

const contextInputs = [
  "活动分支提供的对话历史",
  "基础指令与发现的上下文文件构成的系统提示",
  "工具定义",
  "技能描述（完整指令按需加载）",
  "提示模板、选中的文件、图片、粘贴文本与 shell 输出",
];

const interfaces = [
  { name: "交互模式", desc: "在终端中渲染会话和 agent 事件" },
  { name: "打印模式", desc: "运行一次提示并输出最终响应" },
  { name: "JSON 模式", desc: "把 agent 事件写成 JSONL" },
  { name: "RPC 模式", desc: "从 stdin 读取 JSONL 命令，向 stdout 写入响应和事件" },
  { name: "TypeScript SDK", desc: "在进程内创建并控制 agent 会话" },
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">Pi 如何工作</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 协调模型请求、工具执行、上下文组装和会话存储。会话是 Pi
          对一次对话的记录，包括消息、工具调用与结果、模型切换、
          压缩以及其他事件。会话中的消息和事件构成一棵树，树中的每条路径是一个分支，结束于当前条目的分支就是活动分支，
          它提供下一次模型请求的历史。
        </p>
      </div>

      <!-- Agent loop -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">Agent 循环</h2>
        <ol class="space-y-3">
          <li v-for="(step, i) in loopSteps" :key="step.title" class="flex items-start gap-3">
            <span
              class="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-medium shrink-0"
              >{{ i + 1 }}</span
            >
            <div>
              <h3 class="text-surface-100 font-medium text-sm">{{ step.title }}</h3>
              <p class="text-surface-400 text-sm mt-0.5">{{ step.desc }}</p>
            </div>
          </li>
        </ol>
        <p class="text-surface-400 text-sm mt-4">
          转向消息在当前 assistant 轮次之后进入；后续消息在 agent
          完成待办工作之后进入。中止会停止当前运行，并把排队的消息返回编辑器。
        </p>
      </section>

      <!-- Context -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">上下文</h2>
        <p class="text-surface-300 mb-3">
          活动分支提供对话历史，Pi 把其中的会话条目转换成模型可用的 user、assistant 和 tool-result
          消息。
          一次请求由这些部分组成：
        </p>
        <ul class="space-y-2">
          <li
            v-for="item in contextInputs"
            :key="item"
            class="flex items-start gap-2 text-surface-300 text-sm"
          >
            <span class="text-brand-400 mt-0.5">•</span><span>{{ item }}</span>
          </li>
        </ul>
        <p class="text-surface-400 text-sm mt-3">
          完整的技能指令按需加载；扩展可以追加指令或转换上下文。提示模板在编辑器输入成为用户消息之前展开。
        </p>
      </section>

      <!-- Sessions -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">会话</h2>
        <p class="text-surface-300 mb-3">
          持久会话是 JSONL 文件。每个树条目有 ID 并引用其父条目，当前条目标识活动分支。
          从较早的条目继续会在同一文件中创建另一个分支；分叉和克隆会把选中的历史复制到新的会话文件中。
        </p>
        <p class="text-surface-300">
          模型上下文由活动分支重建。压缩会插入一条摘要条目，在后续请求中替换较旧的消息，而原始条目仍保留在会话树中。
          详见
          <router-link to="/sessions" class="text-brand-400 hover:text-brand-300"
            >会话管理</router-link
          >
          与
          <router-link to="/compaction" class="text-brand-400 hover:text-brand-300"
            >上下文压缩</router-link
          >。
        </p>
      </section>

      <!-- Interfaces -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">接口</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">接口</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in interfaces" :key="i.name" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ i.name }}</td>
                <td class="py-3 px-4 text-surface-300">{{ i.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">所有接口都使用相同的 agent 与会话机制。</p>
      </section>

      <!-- Extensions and resources -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">扩展与资源</h2>
        <p class="text-surface-300 mb-3">
          扩展是加载进 Pi 进程的 TypeScript
          模块，其工厂函数注册工具、命令、快捷键、提供商、事件处理器、渲染器和终端 UI。
          技能提供按需加载的指令和配套文件，提示模板提供可复用的消息文本，主题提供终端配色，
          <router-link to="/packages" class="text-brand-400 hover:text-brand-300"
            >Pi 包</router-link
          >
          通过 npm 或 git 分发这些资源。
        </p>
      </section>

      <!-- Trust -->
      <section class="mb-12 glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">信任与权限</h2>
        <p class="text-surface-300 text-sm">
          Pi 在加载项目设置和资源之前解析项目信任，然后在信任决定之后加载上下文文件。
          已启用的工具使用 Pi 进程的操作系统权限，扩展也在这个进程内执行。
          详见
          <router-link to="/security" class="text-brand-400 hover:text-brand-300">安全</router-link
          >。
        </p>
      </section>
    </div>
  </div>
</template>
