<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const skillTree = `pdf-tools/
├── SKILL.md
├── scripts/
│   └── extract.sh
├── references/
│   └── formats.md
└── assets/
    └── template.json`;

const skillMd = `---
name: pdf-tools
description: Extract text and tables from PDF files. Use when reading, converting, or inspecting PDFs.
---

# PDF tools

Read \`references/formats.md\` before converting a document. Run scripts relative to this skill directory.`;

const invokeCode = `/skill:pdf-tools extract report.pdf`;

const frontmatter = [
  { field: "name", purpose: "命令名与显示名" },
  { field: "description", purpose: "展示给模型的路由描述" },
  { field: "license", purpose: "许可证名称或随附的许可证文件" },
  { field: "compatibility", purpose: "环境要求" },
  { field: "metadata", purpose: "附加键值元数据" },
  { field: "allowed-tools", purpose: "实验性的预批准工具列表" },
  { field: "disable-model-invocation", purpose: "从模型的自动选择中隐藏该技能" },
];

const locations = [
  { path: "~/.pi/agent/skills/", desc: "用户级技能" },
  { path: ".pi/skills/", desc: "项目技能（需项目信任）" },
  { path: "~/.agents/skills/", desc: "Agent Skills 标准位置" },
  { path: ".agents/skills/", desc: "项目级 Agent Skills 位置，向上查找到仓库根目录" },
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">技能</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          技能为某一类工作提供专门的指令和配套文件。Pi
          只把每个可用技能的名称和描述告诉模型，只有在任务需要时才加载完整指令。
          当一个工作流需要的上下文比提示模板多、但不需要新的可执行集成点时，就用技能。
        </p>
      </div>

      <!-- Create -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">创建技能</h2>
        <p class="text-surface-300 mb-3">
          一个技能就是包含 <code class="text-brand-400">SKILL.md</code> 的目录：
        </p>
        <CodeBlock :code="skillTree" language="text" />
        <p class="text-surface-300 mt-4 mb-3">
          <code class="text-brand-400">SKILL.md</code> 以 frontmatter 开头，后面是直接写明的指令：
        </p>
        <CodeBlock :code="skillMd" language="markdown" filename="SKILL.md" />
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">description</code>
          决定模型何时考虑加载技能，要同时说明它做什么、何时适用。
          避免 “Helps with PDFs” 这类缺少路由信息的描述。引用随附文件时使用相对技能目录的路径；Pi
          会把技能所在位置告诉模型。
        </p>
      </section>

      <!-- How skills load -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">技能的加载方式</h2>
        <p class="text-surface-300 mb-3">
          启动时 Pi 扫描配置的技能位置，把每个技能的名称、描述和路径加入系统提示，但不加入完整指令。
          当任务匹配时，模型读取
          <code class="text-brand-400">SKILL.md</code>
          并遵循其中的指令，这样详细的指导只在需要时进入上下文。
          模型可能漏加载相关技能，需要强制加载时使用
          <code class="text-brand-400">/skill:name</code>。
        </p>
        <CodeBlock :code="invokeCode" language="text" />
        <p class="text-surface-400 text-sm mt-3">
          <code class="text-brand-400">/skill:name</code>
          后面的参数会作为用户请求追加到已加载的指令中。
          在 frontmatter 中设置
          <code class="text-brand-400">disable-model-invocation: true</code
          >，可让技能只通过显式命令使用；
          <code class="text-brand-400">enableSkillCommands</code>
          设置控制技能命令是否出现在交互式命令发现中，手动输入的
          <code class="text-brand-400">/skill:name</code> 仍然有效。
        </p>
      </section>

      <!-- Locations -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">添加到 Pi</h2>
        <p class="text-surface-300 mb-3">
          把技能放到用户级或项目技能目录中，含
          <code class="text-brand-400">SKILL.md</code> 的目录会被递归发现：
        </p>
        <div class="space-y-3">
          <div
            v-for="l in locations"
            :key="l.path"
            class="glass-card p-4 flex items-center justify-between gap-4"
          >
            <code class="text-brand-400 text-sm">{{ l.path }}</code>
            <span class="text-surface-400 text-sm text-right">{{ l.desc }}</span>
          </div>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          Pi 也接受某些独立 Markdown 技能，但包含
          <code class="text-brand-400">SKILL.md</code> 的目录是可移植形式，应当优先使用。
          项目技能可以指示模型运行脚本或修改文件，在授予项目信任前请检查不熟悉的技能及其配套文件。
        </p>
      </section>

      <!-- Frontmatter -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">
          可移植的 frontmatter
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">字段</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">用途</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in frontmatter" :key="f.field" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ f.field }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ f.purpose }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          名称使用小写字母、数字和连字符，不能以连字符开头、结尾或连续出现，最多 64 个字符；描述最多
          1024 个字符。 Pi 不会因为声明的名称与父目录不同而报错或警告，但其他 Agent Skills
          实现可能强制要求一致。
          格式错误的
          <code class="text-brand-400">SKILL.md</code>
          和没有描述的技能不会被加载；名称冲突时保留先发现的技能并给出警告。
        </p>
      </section>

      <!-- Validate -->
      <section class="mb-12 glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">验证与分享</h2>
        <p class="text-surface-300 text-sm mb-2">
          在技能可被发现的位置运行 Pi，检查启动诊断信息和
          <code class="text-brand-400">/skill:name</code> 命令。
          在会话中编辑技能后运行 <code class="text-brand-400">/reload</code>。
        </p>
        <p class="text-surface-300 text-sm">
          用
          <router-link to="/packages" class="text-brand-400 hover:text-brand-300"
            >Pi 包</router-link
          >
          通过 npm 或 git 分发一个或多个技能。
          把环境准备留在技能内部，并在包中声明所需的运行时依赖。
        </p>
      </section>
    </div>
  </div>
</template>
