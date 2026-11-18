<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const themeSetting = `{
  "theme": "dark"
}`

const autoTheme = `{
  "theme": "light/dark"
}`

const cliCode = `pi --use-theme light
pi --use-theme light/dark`

const adapts = [
  { reported: '背景色与 ANSI 颜色', result: '使用终端调色板，并按实际背景放置。' },
  { reported: '只有背景色', result: '使用 Pi 自己的色相，按实际背景放置。' },
  { reported: '都没有', result: '使用 ANSI 色号与终端默认色，由终端自行渲染；次要文本变淡，面板没有背景色。' },
]

const props = [
  { prop: '$schema', required: '否', resp: '启用编辑器对 Pi 发布 schema 的校验与补全。' },
  { prop: 'name', required: '是', resp: '在选择器和设置中标识主题；必须唯一，不能包含 /，也不能是 system。' },
  { prop: 'appearance', required: '否', resp: '"dark" 或 "light"：主题面向的背景；省略时 Pi 从主题颜色推断。' },
  { prop: 'vars', required: '否', resp: '定义可复用的颜色值，变量之间可以互相引用。' },
  { prop: 'colors', required: '是', resp: '把颜色分配给终端 UI 角色；schema 标明必需与可选角色。' },
  { prop: 'export', required: '否', resp: '覆盖 HTML 导出中的页面与面板背景。' },
]

const colorForms = [
  { form: 'RGB 十六进制', example: '"#0af" 或 "#00aaff"', meaning: '三或六位 sRGB 颜色。' },
  { form: 'OKLCH', example: '"oklch(62% 0.1 200)"', meaning: '感知亮度、色度与色相。' },
  { form: 'OKHSL', example: '"okhsl(250 60% 55%)"', meaning: '色相、饱和度与亮度；饱和度相对 sRGB 色域上限，等饱和度看起来同样鲜艳。' },
  { form: '256 色索引', example: '39', meaning: '0 到 255 的 ANSI 调色板索引。' },
  { form: '变量引用', example: '"primary"', meaning: 'vars 中某个条目的值。' },
  { form: '终端默认色', example: '""', meaning: '终端自己的默认前景或背景色。' },
]

const areas = [
  { area: '通用界面', names: 'accent、border*、text、muted、dim、success、error、warning' },
  { area: '选择与全屏', names: 'selectedBg、searchMatch*、scrollbar*' },
  { area: '消息', names: 'userMessage*、customMessage*、thinkingText' },
  { area: '工具执行', names: 'toolPendingBg、toolSuccessBg、toolErrorBg、toolTitle、toolOutput' },
  { area: 'Markdown', names: 'md*' },
  { area: '工具 diff', names: 'toolDiff*' },
  { area: '语法高亮', names: 'syntax*' },
  { area: '编辑器模式', names: 'thinking*、bashMode' },
  { area: 'HTML 导出', names: 'export.pageBg、export.cardBg、export.infoBg' },
]

const optional = [
  { color: 'scrollbarTrack', fallback: 'muted' },
  { color: 'scrollbarThumb', fallback: 'text' },
  { color: 'searchMatchBg', fallback: 'selectedBg' },
  { color: 'searchMatchText', fallback: 'text' },
  { color: 'thinkingMax', fallback: 'thinkingXhigh' },
]
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">主题</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          主题控制 Pi 在交互模式和 HTML 导出中使用的颜色。Pi 内置 <code class="text-brand-400">system</code>、
          <code class="text-brand-400">dark</code> 和 <code class="text-brand-400">light</code> 三个主题，你可以选择其一、
          跟随终端的明暗外观，或创建自己的调色板。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">使用终端自身的颜色</h2>
        <p class="text-surface-300 text-sm mb-3">
          <code class="text-brand-400">system</code> 是默认主题。它从终端主题构建 Pi 的颜色，让 Pi 与终端一致而不是自带一套配色：
        </p>
        <ul class="space-y-2 text-surface-300 text-sm mb-3">
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>Pi 查询终端的默认前景色、背景色与 16 个 ANSI 颜色。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>每个 Pi 颜色从一个 ANSI 颜色取色相，例如错误取自红色、链接取自蓝色。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>Pi 设置亮度，使颜色与背景保持最小对比度：正文在背景和每个面板上至少保持 4.5:1 的 WCAG 对比度。</span></li>
          <li class="flex items-start gap-2"><span class="text-brand-400 mt-1">•</span><span>终端在明暗之间切换时，Pi 重新查询颜色并重建主题。</span></li>
        </ul>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">终端上报</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">结果</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in adapts" :key="a.reported" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ a.reported }}</td>
                <td class="py-3 px-4 text-surface-300">{{ a.result }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          Pi 启动时向终端询问颜色，通常几毫秒内得到答复，最多等待 100 ms 再显示启动头部。若终端未及时答复，
          Pi 使用 ANSI 兜底，稍后收到颜色（例如慢速 SSH）仍会应用。<code class="text-brand-400">system</code> 是保留名，
          同名的自定义主题会被忽略。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择主题</h2>
        <p class="text-surface-300 text-sm mb-3">
          打开 <code class="text-brand-400">/settings</code> 并选择 <strong class="text-surface-100">Theme</strong>。
          你可以为所有终端外观使用同一主题，或为明暗终端分别选择主题。选择会保存为
          <code class="text-brand-400">theme</code> 设置：
        </p>
        <CodeBlock :code="themeSetting" language="json" />
        <p class="text-surface-300 text-sm mt-3">未设置 <code class="text-brand-400">theme</code> 时 Pi 使用 <code class="text-brand-400">system</code>。自动模式先存亮色主题、再存暗色主题：</p>
        <CodeBlock :code="autoTheme" language="json" />
        <p class="text-surface-300 text-sm mt-3">
          Pi 根据终端上报的背景与前景色判断明暗；若终端不上报背景，则依次使用终端的明暗通知、
          <code class="text-brand-400">COLORFGBG</code> 环境变量、最后按暗色处理。自动模式生效时，
          Pi 会随终端外观变化切换主题。主题名不能包含 <code class="text-brand-400">/</code>，因为该字符被此设置格式保留。
        </p>
        <CodeBlock :code="cliCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">用 <code class="text-brand-400">--use-theme</code> 只为本次调用选择初始主题，不改变已保存的设置。</p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">创建自定义主题</h2>
        <p class="text-surface-300 text-sm mb-3">
          复制内置主题或按 <code class="text-brand-400">theme.schema.json</code> 新建 JSON 文件。内置主题使用 OKHSL 颜色，
          并为多个角色共享的颜色定义变量，便于直接调整色相、饱和度或亮度。
        </p>
        <ol class="space-y-2 text-surface-300 text-sm list-decimal list-inside">
          <li>保存为 <code class="text-brand-400">&lt;agent-dir&gt;/themes/my-theme.json</code>（agent 目录默认 <code class="text-brand-400">~/.pi/agent</code>）。</li>
          <li>把 <code class="text-brand-400">name</code> 设为 <code class="text-brand-400">my-theme</code>。</li>
          <li>修改 <code class="text-brand-400">vars</code> 与 <code class="text-brand-400">colors</code> 中的值。</li>
          <li>通过 <code class="text-brand-400">/settings</code> 选择 <code class="text-brand-400">my-theme</code>。</li>
        </ol>
        <p class="text-surface-400 text-sm mt-3">
          用主题名作为文件名。Pi 只对 <code class="text-brand-400">&lt;agent-dir&gt;/themes/&lt;name&gt;.json</code> 热重载活动用户主题；
          从其他来源添加或修改主题后运行 <code class="text-brand-400">/reload</code>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">主题文件结构</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">属性</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">必需</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">作用</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in props" :key="p.prop" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ p.prop }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ p.required }}</td>
                <td class="py-3 px-4 text-surface-300">{{ p.resp }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          主题对象是严格的：只接受文档列出的顶层字段与颜色 token。可复用的自定义颜色放在 <code class="text-brand-400">vars</code> 中；
          <code class="text-brand-400">colors</code> 或 <code class="text-brand-400">export</code> 下的自定义键以及额外的顶层元数据会被拒绝。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">颜色的写法</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">形式</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">示例</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">含义</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in colorForms" :key="c.form" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ c.form }}</td>
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ c.example }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ c.meaning }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4">
          终端默认色按终端自身颜色渲染；在需要具体值的地方（HTML 导出、扩展颜色计算）Pi 使用终端上报的默认色，
          或根据主题外观推测黑/白。Pi 会解析链式变量引用，缺失变量或循环引用会让主题无效。可用时使用 truecolor，
          否则把 OKLCH 映射到 sRGB，并在 256 色终端上近似。HTML 导出会把 OKHSL 转成十六进制，因为 CSS 不支持它。
          颜色与原始值不一致时，检查终端的 truecolor 检测与对比度设置。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">找到要改的颜色</h2>
        <p class="text-surface-300 text-sm mb-3">主题颜色描述界面角色而非具体组件，可按以下分组在 schema 中定位：</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">区域</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">颜色名</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in areas" :key="a.area" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ a.area }}</td>
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ a.names }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-300 text-sm mt-4 mb-2">以下五个颜色可省略，省略时继承另一个颜色：</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="o in optional" :key="o.color" class="glass-card p-3 flex items-center justify-between gap-2">
            <code class="text-brand-400 text-xs">{{ o.color }}</code>
            <span class="text-surface-400 text-xs">← {{ o.fallback }}</span>
          </div>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          省略 <code class="text-brand-400">export</code> 颜色时，Pi 从 <code class="text-brand-400">userMessageBg</code>
          推导 HTML 页面与面板背景。
        </p>
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">从项目或包加载主题</h2>
        <p class="text-surface-300 text-sm">
          把项目主题放进 <code class="text-brand-400">.pi/themes/</code>，只有在授予项目信任后才会加载。
          也可以通过 <code class="text-brand-400">themes</code> 设置加载主题文件与目录，或用 Pi 包分发。
          每个加载的主题必须有唯一名称，重名会被报告为资源冲突。
        </p>
      </section>
    </div>
  </div>
</template>
