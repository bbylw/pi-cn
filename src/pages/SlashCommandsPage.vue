<script setup lang="ts">
const groups = [
  {
    title: '模型与设置',
    commands: [
      { cmd: '/settings', desc: '打开设置' },
      { cmd: '/model [provider/model]', desc: '选择模型' },
      { cmd: '/thinking [level]', desc: '设置思考级别' },
      { cmd: '/scoped-models', desc: '配置交互式循环使用的模型' },
      { cmd: '/login [provider]', desc: '添加提供商认证' },
      { cmd: '/logout', desc: '移除提供商认证' },
      { cmd: '/llama', desc: '管理已配置的 llama.cpp router 上的模型' },
    ],
  },
  {
    title: '会话与上下文',
    commands: [
      { cmd: '/new', desc: '开始新会话' },
      { cmd: '/resume', desc: '恢复另一个会话' },
      { cmd: '/name [name]', desc: '设置会话显示名称，省略时显示当前名称' },
      { cmd: '/session', desc: '显示当前会话信息与统计' },
      { cmd: '/tree', desc: '在会话树中导航' },
      { cmd: '/fork', desc: '从较早的用户消息创建新会话' },
      { cmd: '/clone', desc: '在当前位置复制当前会话' },
      { cmd: '/compact [instructions]', desc: '压缩当前上下文，可选自定义指令' },
      { cmd: '/import <path>', desc: '导入 JSONL 会话，保留其 ID 与工作目录' },
    ],
  },
  {
    title: '导出与分享',
    commands: [
      { cmd: '/copy', desc: '复制最后一条 assistant 消息' },
      { cmd: '/export [path]', desc: '把会话导出为 HTML 或 JSONL' },
      { cmd: '/share', desc: '上传会话并返回查看链接' },
      { cmd: '/bug [description]', desc: '为 Pi 开发者准备一份私密的问题报告' },
    ],
  },
  {
    title: '运行时与项目',
    commands: [
      { cmd: '/trust', desc: '为后续 Pi 进程保存项目信任决定' },
      { cmd: '/mcp', desc: '管理 MCP 服务器：登录、重连、启用或禁用、修改暴露方式' },
      { cmd: '/reload', desc: '重载快捷键、扩展、技能、模板、主题和上下文文件' },
      { cmd: '/hotkeys', desc: '显示当前生效的键盘快捷键' },
      { cmd: '/changelog', desc: '显示更新日志条目' },
      { cmd: '/quit', desc: '退出 Pi' },
    ],
  },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">斜杠命令</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          在 Pi 的终端编辑器中输入 <code class="text-brand-400">/</code> 搜索当前会话可用的命令。本页列出当前版本的 Pi 内置命令。
          扩展、提示模板和技能都可以添加命令，因此 Pi 的命令菜单才是你所在会话已加载资源的准确参考。
        </p>
      </div>

      <section v-for="group in groups" :key="group.title" class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">{{ group.title }}</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">命令</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in group.commands" :key="c.cmd" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ c.cmd }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ c.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mb-12 glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">由资源添加的命令</h2>
        <ul class="space-y-2 text-surface-300 text-sm">
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>扩展可以注册带自有参数和补全行为的命令。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>每个提示模板都以模板名作为命令。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>启用技能命令时，技能以 <code class="text-brand-400">/skill:name</code> 形式提供。</span></li>
        </ul>
        <p class="text-surface-400 text-sm mt-3">
          新增或修改可被发现的命令资源后，运行 <code class="text-brand-400">/reload</code>。
        </p>
      </section>

      <section class="glass-card p-6">
        <p class="text-surface-300 text-sm">
          导出或分享会话前请先检查内容，会话可能包含提示、工具参数、命令输出、文件内容以及对话中暴露的凭证。
        </p>
      </section>
    </div>
  </div>
</template>
