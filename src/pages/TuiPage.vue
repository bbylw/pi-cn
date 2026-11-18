<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const integration = [
  { need: "选择、确认、输入或多行编辑器", use: "ctx.ui.select()、confirm()、input() 或 editor()" },
  { need: "非阻塞反馈", use: "ctx.ui.notify() 或 setStatus()" },
  { need: "编辑器附近的常驻内容", use: "ctx.ui.setWidget()" },
  { need: "替换头部、底部或编辑器", use: "对应的 ctx.ui 组件工厂" },
  { need: "临时交互界面或浮层", use: "ctx.ui.custom()" },
  { need: "工具或会话条目的自定义渲染", use: "扩展渲染器" },
];

const customCode = `import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("pick-target", {
    description: "Pick a deployment target",
    handler: async (_args, ctx) => {
      if (ctx.mode !== "tui") {
        ctx.ui.notify("pick-target requires interactive mode", "error");
        return;
      }

      const choices = ["development", "staging", "production"];
      const selected = await ctx.ui.custom<string | undefined>((tui, theme, keybindings, done) => {
        let selectedIndex = 0;
        let cachedWidth: number | undefined;
        let cachedLines: string[] | undefined;

        const invalidate = () => {
          cachedWidth = undefined;
          cachedLines = undefined;
        };

        return {
          render(width: number): string[] {
            if (cachedLines && cachedWidth === width) return cachedLines;

            cachedWidth = width;
            cachedLines = [
              theme.fg("accent", "Choose a deployment target"),
              ...choices.map((choice, index) => \`\${index === selectedIndex ? "> " : "  "}\${choice}\`),
              theme.fg("dim", "up/down move, enter selects, escape cancels"),
            ].map((line) => truncateToWidth(line, width));
            return cachedLines;
          },
          handleInput(data: string): void {
            if (keybindings.matches(data, "tui.select.up")) {
              selectedIndex = (selectedIndex - 1 + choices.length) % choices.length;
            } else if (keybindings.matches(data, "tui.select.down")) {
              selectedIndex = (selectedIndex + 1) % choices.length;
            } else if (keybindings.matches(data, "tui.select.confirm")) {
              done(choices[selectedIndex]);
              return;
            } else if (keybindings.matches(data, "tui.select.cancel")) {
              done(undefined);
              return;
            } else {
              return;
            }

            invalidate();
            tui.requestRender();
          },
          invalidate,
        };
      });

      if (selected) ctx.ui.notify(\`Selected \${selected}\`, "info");
    },
  });
}`;

const styleCode = `return new Text(
  theme.style("Done!", {
    fg: "success",
    bg: "toolSuccessBg",
    bold: true,
  }),
  0,
  0,
);`;

const components = [
  "Text、Markdown、Image 与 TruncatedText 负责渲染内容。",
  "Container、VStack、HStack、Box 与 Spacer 组合布局。",
  "Input 与 Editor 接受文本输入。",
  "SelectList 与 SettingsList 实现可搜索选择与设置流程。",
  "ScrollView 提供有边界的可滚动视口。",
  "Loader 与 CancellableLoader 报告进行中的工作。",
  "MouseRegion 为另一个组件添加指针行为。",
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">终端 UI</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          <code class="text-brand-400">@earendil-works/pi-tui</code> 是 Pi
          使用的终端组件系统。当内置对话框、
          通知、状态文本与小组件不足以支撑所需交互时，扩展会用到它。优先使用
          <router-link to="/extensions" class="text-brand-400 hover:text-brand-300"
            >扩展</router-link
          >
          的 <code class="text-brand-400">ctx.ui</code> 方法；只有当 UI
          需要自己的渲染、键盘或鼠标输入、焦点、布局或生命周期时，
          才构建自定义组件。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择集成点</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">需求</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">使用</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in integration" :key="i.need" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ i.need }}</td>
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ i.use }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          这些 API 会在需要时接收 Pi 的活动主题与键位绑定；不要在扩展内创建第二个终端渲染器。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">组件模型</h2>
        <p class="text-surface-300 text-sm mb-3">
          组件按可用宽度渲染一组终端行，可选地处理键盘与鼠标输入，并在状态或主题相关内容变化时让缓存输出失效。
        </p>
        <ul class="space-y-2 text-surface-300 text-sm">
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              >把 <code class="text-brand-400">render()</code> 返回的行视为只读，包括子类中的
              <code class="text-brand-400">super.render()</code
              >。内置组件在未变化时返回同一个缓存数组，原地修改会破坏后续帧；先复制，例如
              <code class="text-brand-400">const lines = [...super.render(width)]</code
              >，昂贵结果也请缓存。输出变化时返回新数组。</span
            >
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              >每一行都必须落在给定宽度内。测量可见终端列数而不是字符串长度，因为 ANSI
              转义、宽字符、emoji 与组合字符都会改变显示宽度。</span
            >
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              >使用 <code class="text-brand-400">visibleWidth()</code>、<code class="text-brand-400"
                >truncateToWidth()</code
              >、<code class="text-brand-400">sliceByColumn()</code> 与
              <code class="text-brand-400">wrapTextWithAnsi()</code>，不要自己实现终端宽度处理。Pi
              会在每行后重置样式与超链接，因此每行都要重新应用样式。</span
            >
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              >改变组件状态后让相关组件失效并调用注入的
              <code class="text-brand-400">tui.requestRender()</code>；TUI 会合并渲染请求。</span
            >
          </li>
        </ul>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">组合内置组件</h2>
        <ul class="space-y-1.5 text-surface-300 text-sm">
          <li v-for="c in components" :key="c" class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span><span>{{ c }}</span>
          </li>
        </ul>
        <p class="text-surface-400 text-sm mt-3">
          优先使用这些组件，而不是重建选择、滚动、文本编辑或宽度处理。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">键盘输入与焦点</h2>
        <p class="text-surface-300 text-sm">
          用 <code class="text-brand-400">matchesKey()</code> 与
          <code class="text-brand-400">Key</code> 处理终端键盘输入，
          解析器会考虑受支持的终端协议与修饰键；扩展组件应使用注入的
          <code class="text-brand-400">KeybindingsManager</code> 处理可配置的应用动作。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          显示文本光标的组件应实现 <code class="text-brand-400">Focusable</code>，并在可视光标前放
          <code class="text-brand-400">CURSOR_MARKER</code>；把光标单元包在
          <code class="text-brand-400">renderFakeCursor()</code> 中，让 TUI
          用反色绘制，或在显示硬件光标时隐藏。 TUI 用该标记为输入法编辑器定位硬件光标；包裹
          <code class="text-brand-400">Input</code> 或
          <code class="text-brand-400">Editor</code> 的容器必须把
          <code class="text-brand-400">focused</code>
          状态传给子组件，否则中日韩等输入法候选窗口可能出现在错误位置。
          替换主编辑器时继承 Pi 的
          <code class="text-brand-400">CustomEditor</code>，以保留应用快捷键与 agent 控制；
          编辑器不处理的键要转发给基础实现，清除自定义编辑器工厂即可恢复默认。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">鼠标输入</h2>
        <p class="text-surface-300 text-sm">
          全屏模式把规范化的鼠标事件路由给组件：处理器可以标记事件已处理、捕获拖拽序列、请求焦点或请求渲染。
          未处理的滚轮事件滚动最近的
          <code class="text-brand-400">ScrollView</code>；未处理的主键拖拽保留给转录选择； OSC 8
          链接优先于外层点击区域。普通模式把鼠标交给终端，因为终端拥有回滚缓冲区。
          即使可用全屏鼠标输入，每个交互也要设计键盘路径。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">自定义界面与浮层</h2>
        <p class="text-surface-300 text-sm mb-3">
          <code class="text-brand-400">ctx.ui.custom()</code> 临时把一个组件的控制权交给交互区域，
          并在该组件调用完成回调时结束。下面的完整扩展示范了自定义组件生命周期：
        </p>
        <CodeBlock :code="customCode" language="typescript" />
        <p class="text-surface-300 text-sm mt-4">
          该组件不显示文本光标，因此无需 <code class="text-brand-400">Focusable</code>。包含
          <code class="text-brand-400">Input</code> 或
          <code class="text-brand-400">Editor</code> 的组件必须实现
          <code class="text-brand-400">Focusable</code> 并把
          <code class="text-brand-400">focused</code> 传给子组件。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          自定义组件不会自行表示 Pi 正在等待用户，因为
          <code class="text-brand-400">ctx.ui.custom()</code>
          也承载 loader 等非阻塞 UI。当组件在等待回答时，传入
          <code class="text-brand-400">blocked: { kind: "question", message: "Pick a color" }</code
          >，
          让支持程序状态的终端显示 Pi 被阻塞；<code class="text-brand-400">kind</code> 为
          <code class="text-brand-400">"question"</code>、<code class="text-brand-400"
            >"permission"</code
          >
          或 <code class="text-brand-400">"auth"</code>。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          传
          <code class="text-brand-400">overlay: true</code>
          可在现有内容之上绘制。浮层选项控制尺寸、锚点、偏移、
          边距与响应式可见性；浮层句柄可以在交互仍进行时改变焦点，或用
          <code class="text-brand-400">setHidden()</code>
          暂时隐藏与显示。获得焦点的浮层在普通渲染中保留输入所有权；
          若希望其他组件接收输入，要通过句柄显式释放或转移焦点。每个自定义组件实例属于一次交互，再次开始该交互时创建新实例。
          用传给组件工厂的完成回调结束交互，它会解析
          <code class="text-brand-400">ctx.ui.custom()</code> 的 promise 并释放组件；不要对由
          <code class="text-brand-400">ctx.ui.custom()</code> 创建的浮层调用
          <code class="text-brand-400">OverlayHandle.hide()</code>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">正确应用主题</h2>
        <p class="text-surface-300 text-sm mb-3">
          使用传给扩展或组件回调的主题。主题辅助函数会为强调色、次要文本、成功、警告、错误、工具输出与
          Markdown 等语义颜色生成带 ANSI 样式的字符串。用
          <code class="text-brand-400">theme.style()</code> 组合前景/背景与文本属性：
        </p>
        <CodeBlock :code="styleCode" language="typescript" />
        <p class="text-surface-300 text-sm mt-4">
          样式颜色可以是语义 token 或具体的 <code class="text-brand-400">Color</code>：前景 token
          可作 <code class="text-brand-400">fg</code>、背景 token 可作
          <code class="text-brand-400">bg</code>，
          反过来使用时传具体颜色，例如
          <code class="text-brand-400">{ fg: theme.colors.userMessageBg }</code>。
          需要颜色运算时用
          <code class="text-brand-400">mixColors()</code> 等工具。主题设为终端默认色的 token
          会渲染成终端自身颜色；用
          <code class="text-brand-400">theme.appearance</code> 判断明暗以决定提亮或压暗。 Pi
          会根据终端能力把结果转成 truecolor 或 256 色输出。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          不要把带主题颜色的字符串永久保存，除非
          <code class="text-brand-400">invalidate()</code> 会重建它们：
          主题变化会清空渲染缓存，但无法移除应用状态里已经嵌入的旧 ANSI
          颜色。渲染时计算的主题回调无需特殊重建，
          无状态组件也可以每次渲染时计算。渲染 Markdown 且需匹配活动主题时使用
          <code class="text-brand-400">getMarkdownTheme()</code>。
        </p>
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">保持渲染响应</h2>
        <p class="text-surface-300 text-sm">
          渲染运行在交互路径上：按宽度与内容缓存昂贵的布局与高亮工作，并在
          <code class="text-brand-400">invalidate()</code>
          中清除缓存。保持默认视图紧凑，通过展开或专用界面揭示细节。
          为工具做自定义渲染时要处理部分结果，并在可以安全更新时复用上一个组件。
          诊断渲染问题时用 <code class="text-brand-400">PI_TUI_WRITE_LOG</code> 捕获原始 ANSI 流，
          并测试窄宽度、宽字符、尺寸变化、主题切换、焦点转移以及普通与全屏两种模式。
        </p>
      </section>
    </div>
  </div>
</template>
