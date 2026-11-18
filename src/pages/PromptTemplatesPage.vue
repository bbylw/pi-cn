<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const templateCode = `---
description: Review staged git changes
argument-hint: "[focus]"
---
Review the staged changes. Focus on \${1:-correctness, security, and error handling}.`;

const useCode = `/review
/review concurrency`;

const substitutions = [
  { syntax: "$1, $2, …", result: "一个位置参数" },
  { syntax: "$@ 或 $ARGUMENTS", result: "所有参数以空格拼接" },
  { syntax: "${1:-default}", result: "第一个参数，缺省时使用默认值" },
  { syntax: "${@:-default}", result: "所有参数，缺省时使用默认值" },
  { syntax: "${@:N}", result: "从第 N 个位置开始的参数" },
  { syntax: "${@:N:L}", result: "从第 N 个位置开始的 L 个参数" },
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-semibold text-surface-50 mb-4">提示模板</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          提示模板把 Markdown 文件变成可复用的
          <code class="text-brand-400">/</code> 命令。当你只想重复使用同一段提示，
          而不需要可执行行为或一整套配套指令时，用模板。模板可以接受参数并出现在命令补全中，来源可以是个人配置、
          项目配置、显式路径或 Pi 包；项目配置只在项目信任之后加载。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">创建模板</h2>
        <p class="text-surface-300 text-sm mb-3">
          创建 <code class="text-brand-400">~/.pi/agent/prompts/review.md</code>：
        </p>
        <CodeBlock :code="templateCode" language="markdown" />
        <p class="text-surface-300 text-sm mt-4">
          文件名就是命令名，因此该模板可通过 <code class="text-brand-400">/review</code> 使用。
          <code class="text-brand-400">description</code> 显示在命令补全中；省略时 Pi
          使用第一行非空文本。 <code class="text-brand-400">argument-hint</code> 是可选的，用
          <code class="text-brand-400">&lt;尖括号&gt;</code> 表示必需参数，用
          <code class="text-brand-400">[方括号]</code> 表示可选参数。
        </p>
        <p class="text-surface-400 text-sm mt-3">
          在活动会话中添加或修改模板后运行 <code class="text-brand-400">/reload</code>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">使用模板</h2>
        <CodeBlock :code="useCode" language="text" />
        <p class="text-surface-300 text-sm mt-4">
          Pi 在文本进入 agent 之前展开模板。扩展会先通过
          <code class="text-brand-400">input</code> 事件收到原始输入，
          除非有同名扩展命令处理它。模板支持以下替换：
        </p>
        <div class="overflow-x-auto mt-3">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">语法</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">结果</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in substitutions" :key="s.syntax" class="border-b border-surface-800/50">
                <td class="py-3 px-4">
                  <code class="text-brand-400 text-xs">{{ s.syntax }}</code>
                </td>
                <td class="py-3 px-4 text-surface-300">{{ s.result }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          参数遵循类 shell 的引号规则：<code class="text-brand-400"
            >/review "API compatibility"</code
          >
          提供一个含空格参数。
          引号只在参数开头才进入引用状态，所以
          <code class="text-brand-400">doesn't</code> 这类词中的撇号保持原样，
          未闭合的引号也按文本保留。引号内同种引号前的反斜杠会保留为文本，其余反斜杠原样保留。
        </p>
      </section>

      <section class="mb-12 glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">放在哪里生效</h2>
        <p class="text-surface-300 text-sm mb-2">
          把模板放进用户或项目的 prompt 目录。约定目录只加载直接的
          <code class="text-brand-400">.md</code> 子文件。
        </p>
        <p class="text-surface-300 text-sm">
          设置和包可以选中嵌套的 Markdown 文件；包清单可以用显式路径和 glob
          收窄发现范围。项目模板在授予信任后才会成为编辑器中的命令，
          信任陌生项目之前请先审阅其内容。
        </p>
      </section>
    </div>
  </div>
</template>
