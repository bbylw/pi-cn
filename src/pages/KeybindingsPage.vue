<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const configCode = `{
  "$schema": "https://pi.dev/schemas/keybindings.schema.json",
  "app.session.new": "ctrl+shift+n",
  "app.session.tree": ["ctrl+shift+t", "alt+shift+t"]
}`;

const disableCode = `{
  "tui.altScreen.pageUp": []
}`;

const cursor = [
  { id: "tui.editor.cursorUp", def: "up", desc: "光标上移，在顶部时浏览更早的历史" },
  { id: "tui.editor.cursorDown", def: "down", desc: "光标下移，在底部时浏览更新的历史" },
  { id: "tui.editor.historyPrevious", def: "无", desc: "选择上一条提示历史" },
  { id: "tui.editor.historyNext", def: "无", desc: "选择下一条提示历史" },
  { id: "tui.editor.cursorLeft", def: "left, ctrl+b", desc: "光标左移" },
  { id: "tui.editor.cursorRight", def: "right, ctrl+f", desc: "光标右移" },
  { id: "tui.editor.cursorWordLeft", def: "alt+left, ctrl+left, alt+b", desc: "按词左移" },
  { id: "tui.editor.cursorWordRight", def: "alt+right, ctrl+right, alt+f", desc: "按词右移" },
  { id: "tui.editor.cursorLineStart", def: "home, ctrl+a", desc: "移到行首" },
  { id: "tui.editor.cursorLineEnd", def: "end, ctrl+e", desc: "移到行尾" },
  { id: "tui.editor.jumpForward", def: "ctrl+]", desc: "向前跳到指定字符" },
  { id: "tui.editor.jumpBackward", def: "ctrl+alt+]", desc: "向后跳到指定字符" },
  { id: "tui.editor.pageUp", def: "pageUp, ctrl+pageUp", desc: "向上翻页" },
  { id: "tui.editor.pageDown", def: "pageDown, ctrl+pageDown", desc: "向下翻页" },
];

const editing = [
  { id: "tui.editor.deleteCharBackward", def: "backspace", desc: "向后删除一个字符" },
  { id: "tui.editor.deleteCharForward", def: "delete, ctrl+d", desc: "向前删除一个字符" },
  { id: "tui.editor.deleteWordBackward", def: "ctrl+w, alt+backspace", desc: "向后删除一个词" },
  { id: "tui.editor.deleteWordForward", def: "alt+d, alt+delete", desc: "向前删除一个词" },
  { id: "tui.editor.deleteToLineStart", def: "ctrl+u", desc: "删除到行首" },
  { id: "tui.editor.deleteToLineEnd", def: "ctrl+k", desc: "删除到行尾" },
  { id: "tui.editor.yank", def: "ctrl+y", desc: "粘贴最近删除的文本" },
  { id: "tui.editor.yankPop", def: "alt+y", desc: "在 yank 后循环更早的删除内容" },
  {
    id: "tui.editor.undo",
    def: "ctrl+-（Windows 用 ctrl+z；WSL 用 alt+z）",
    desc: "撤销上一次编辑",
  },
];

const inputSelect = [
  { id: "tui.input.newLine", def: "shift+enter, ctrl+j", desc: "插入换行" },
  { id: "tui.input.submit", def: "enter", desc: "提交输入" },
  { id: "tui.input.tab", def: "tab", desc: "补全或切换焦点" },
  { id: "tui.input.copy", def: "ctrl+c", desc: "复制选中内容" },
  { id: "tui.select.up", def: "up", desc: "列表选择上移" },
  { id: "tui.select.down", def: "down", desc: "列表选择下移" },
  { id: "tui.select.pageUp", def: "pageUp", desc: "列表向上翻页" },
  { id: "tui.select.pageDown", def: "pageDown", desc: "列表向下翻页" },
  { id: "tui.select.confirm", def: "enter", desc: "确认选择" },
  { id: "tui.select.cancel", def: "escape, ctrl+c", desc: "取消选择" },
];

const fullscreen = [
  { id: "tui.altScreen.pageUp", def: "pageUp", desc: "向上滚动一页转录" },
  { id: "tui.altScreen.pageDown", def: "pageDown", desc: "向下滚动一页转录" },
  { id: "tui.altScreen.halfPageUp", def: "无", desc: "向上滚动半页" },
  { id: "tui.altScreen.halfPageDown", def: "无", desc: "向下滚动半页" },
  { id: "tui.altScreen.lineUp", def: "无", desc: "向上滚动一行" },
  { id: "tui.altScreen.lineDown", def: "无", desc: "向下滚动一行" },
  {
    id: "tui.altScreen.previousPrompt",
    def: "ctrl+shift+up, ctrl+up（Windows/WSL 仅 ctrl+up）",
    desc: "跳到上一个标记的消息",
  },
  {
    id: "tui.altScreen.nextPrompt",
    def: "ctrl+shift+down, ctrl+down（Windows/WSL 仅 ctrl+down）",
    desc: "跳到下一个标记的消息",
  },
  {
    id: "tui.altScreen.search",
    def: "ctrl+shift+f（Windows/WSL 为 ctrl+f）",
    desc: "搜索已渲染的转录",
  },
  { id: "tui.altScreen.searchNext", def: "enter, ctrl+g", desc: "选择下一个搜索结果" },
  {
    id: "tui.altScreen.searchPrevious",
    def: "shift+enter, ctrl+shift+g",
    desc: "选择上一个搜索结果",
  },
  { id: "tui.altScreen.searchClose", def: "escape", desc: "关闭转录搜索" },
  { id: "tui.altScreen.top", def: "ctrl+home", desc: "跳到转录开头" },
  { id: "tui.altScreen.bottom", def: "ctrl+end", desc: "跳到转录末尾并跟随新输出" },
];

const app = [
  { id: "app.interrupt", def: "escape", desc: "取消当前运行" },
  { id: "app.clear", def: "ctrl+c", desc: "清空编辑器（第一次）/ 退出（第二次）" },
  { id: "app.exit", def: "ctrl+d", desc: "编辑器为空时退出" },
  { id: "app.suspend", def: "ctrl+z（Windows 无默认值）", desc: "挂起到后台" },
  {
    id: "app.editor.external",
    def: "ctrl+g",
    desc: "用外部编辑器打开（externalEditor、$VISUAL、$EDITOR、Windows 记事本或 nano）",
  },
  {
    id: "app.clipboard.pasteImage",
    def: "ctrl+v（Windows/WSL 另有 alt+v）",
    desc: "粘贴文件、图片或剪贴板文本",
  },
];

const sessions = [
  { id: "app.session.new", def: "无", desc: "开始新会话（/new）" },
  { id: "app.session.tree", def: "无", desc: "打开会话树导航（/tree）" },
  { id: "app.session.fork", def: "无", desc: "分叉当前会话（/fork）" },
  { id: "app.session.resume", def: "无", desc: "打开恢复会话选择器（/resume）" },
  { id: "app.session.togglePath", def: "ctrl+p", desc: "切换路径显示" },
  { id: "app.session.toggleSort", def: "ctrl+s", desc: "切换排序模式" },
  { id: "app.session.toggleNamedFilter", def: "ctrl+n", desc: "只显示已命名会话" },
  { id: "app.session.rename", def: "ctrl+r", desc: "重命名会话" },
  { id: "app.session.delete", def: "ctrl+d", desc: "删除会话" },
  { id: "app.session.deleteNoninvasive", def: "ctrl+backspace", desc: "查询为空时删除会话" },
];

const models = [
  { id: "app.model.select", def: "ctrl+l", desc: "打开模型选择器" },
  { id: "app.model.cycleForward", def: "ctrl+p", desc: "循环到下一个模型" },
  {
    id: "app.model.cycleBackward",
    def: "shift+ctrl+p（Windows/WSL 为 alt+p）",
    desc: "循环到上一个模型",
  },
  { id: "app.models.save", def: "ctrl+s", desc: "保存所选默认模型或范围模型配置到设置" },
  { id: "app.thinking.cycle", def: "shift+tab", desc: "循环思考级别" },
  { id: "app.thinking.save", def: "ctrl+s", desc: "把当前思考级别保存到设置" },
  { id: "app.thinking.toggle", def: "ctrl+t", desc: "折叠或展开思考块" },
];

const display = [
  { id: "app.tools.expand", def: "ctrl+o", desc: "折叠或展开工具输出" },
  {
    id: "app.message.copy",
    def: "ctrl+x",
    desc: "复制 /tree 中选中的消息；全屏模式按 fullscreenCopyOnSelect 决定复制选区或最后一条助手消息；OAuth 登录页复制登录 URL",
  },
  {
    id: "app.message.followUp",
    def: "alt+enter（Windows/WSL 为 ctrl+q）",
    desc: "排队一条后续消息",
  },
  {
    id: "app.message.dequeue",
    def: "alt+up（Windows/WSL 为 alt+q）",
    desc: "把排队的消息放回编辑器",
  },
];

const tree = [
  { id: "app.tree.foldOrUp", def: "ctrl+left, alt+left", desc: "折叠当前分支段，或跳到上一段起点" },
  {
    id: "app.tree.unfoldOrDown",
    def: "ctrl+right, alt+right",
    desc: "展开当前分支段，或跳到下一段起点/分支末尾",
  },
  { id: "app.tree.editLabel", def: "shift+l", desc: "编辑选中节点的标签" },
  { id: "app.tree.toggleLabelTimestamp", def: "shift+t", desc: "切换树中的标签时间戳" },
  { id: "app.tree.filter.default", def: "ctrl+d", desc: "树筛选切回默认视图" },
  { id: "app.tree.filter.noTools", def: "ctrl+t", desc: "隐藏工具结果的筛选" },
  { id: "app.tree.filter.userOnly", def: "ctrl+u", desc: "只显示用户消息的筛选" },
  { id: "app.tree.filter.labeledOnly", def: "ctrl+l", desc: "只显示带标签条目的筛选" },
  { id: "app.tree.filter.all", def: "ctrl+a", desc: "显示全部条目的筛选" },
  { id: "app.tree.filter.cycleForward", def: "ctrl+o", desc: "向前循环树筛选" },
  { id: "app.tree.filter.cycleBackward", def: "shift+ctrl+o", desc: "向后循环树筛选" },
];

const scopedModels = [
  { id: "app.models.enableAll", def: "ctrl+a", desc: "启用全部模型（或匹配当前搜索的模型）" },
  { id: "app.models.clearAll", def: "ctrl+x", desc: "清空全部模型（或匹配当前搜索的模型）" },
  { id: "app.models.toggleProvider", def: "ctrl+p", desc: "切换当前提供商的全部模型" },
  { id: "app.models.reorderUp", def: "alt+up", desc: "把选中模型在循环顺序中上移" },
  { id: "app.models.reorderDown", def: "alt+down", desc: "把选中模型在循环顺序中下移" },
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">键位绑定</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 把快捷键暴露为具名动作，例如
          <code class="text-brand-400">app.session.new</code>。你可以在用户配置中修改默认绑定，
          或给原本没有绑定键的动作分配按键。运行
          <code class="text-brand-400">/hotkeys</code> 可查看当前生效的快捷键。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">分配键位</h2>
        <p class="text-surface-300 text-sm mb-3">
          创建 <code class="text-brand-400">&lt;agent-dir&gt;/keybindings.json</code>，agent
          目录默认是
          <code class="text-brand-400">~/.pi/agent</code>。每个动作标识映射到一个键或一组键：
        </p>
        <CodeBlock :code="configCode" language="json" />
        <p class="text-surface-300 text-sm mt-4">
          配置值会替换该动作的默认绑定。用空数组可以禁用某个动作的所有键位：
        </p>
        <CodeBlock :code="disableCode" language="json" />
        <p class="text-surface-400 text-sm mt-3">
          修改文件后在活动会话中运行 <code class="text-brand-400">/reload</code> 使其生效。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">按键语法</h2>
        <p class="text-surface-300 text-sm mb-3">
          按键写成 <code class="text-brand-400">修饰键+按键</code>。修饰键为
          <code class="text-brand-400">ctrl</code>、<code class="text-brand-400">shift</code>、
          <code class="text-brand-400">alt</code>、<code class="text-brand-400">super</code
          >，可以组合。
        </p>
        <ul class="space-y-2 text-surface-300 text-sm">
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              ><strong class="text-surface-100">字母与数字：</strong
              ><code class="text-brand-400">a-z</code>、<code class="text-brand-400">0-9</code
              >。</span
            >
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              ><strong class="text-surface-100">特殊键：</strong
              ><code class="text-brand-400">escape</code>、<code class="text-brand-400">esc</code
              >、<code class="text-brand-400">enter</code>、<code class="text-brand-400"
                >return</code
              >、<code class="text-brand-400">tab</code>、<code class="text-brand-400">space</code
              >、<code class="text-brand-400">backspace</code>、<code class="text-brand-400"
                >delete</code
              >、<code class="text-brand-400">insert</code>、<code class="text-brand-400"
                >clear</code
              >、<code class="text-brand-400">home</code>、<code class="text-brand-400">end</code
              >、<code class="text-brand-400">pageUp</code>、<code class="text-brand-400"
                >pageDown</code
              >、<code class="text-brand-400">up</code>、<code class="text-brand-400">down</code
              >、<code class="text-brand-400">left</code>、<code class="text-brand-400">right</code
              >。</span
            >
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              ><strong class="text-surface-100">功能键：</strong
              ><code class="text-brand-400">f1</code>-<code class="text-brand-400">f12</code
              >。</span
            >
          </li>
          <li class="flex items-start gap-2">
            <span class="text-brand-400 mt-1">•</span
            ><span
              ><strong class="text-surface-100">符号：</strong
              ><code class="text-brand-400"
                >` - = [ ] \ ; ' , . / ! @ # $ % ^ &amp; * ( ) _ + | ~ { } : &lt; &gt; ?</code
              >。</span
            >
          </li>
        </ul>
        <p class="text-surface-400 text-sm mt-3">
          示例：<code class="text-brand-400">ctrl+shift+x</code>、<code class="text-brand-400"
            >alt+ctrl+x</code
          >、 <code class="text-brand-400">super+k</code>、<code class="text-brand-400">ctrl+1</code
          >。 <code class="text-brand-400">super</code> 绑定需要终端单独上报该修饰键（通常是 Kitty
          键盘协议），不支持该协议的终端可能无效。
        </p>
      </section>

      <section
        v-for="group in [
          {
            title: '光标移动',
            note: '专用的历史动作不受光标位置影响，并优先于使用同一按键的应用动作。',
            rows: cursor,
          },
          { title: '文本编辑', note: '', rows: editing },
          { title: '输入与选择', note: '', rows: inputSelect },
          {
            title: '全屏模式',
            note: '全屏模式下这些动作优先于使用同一按键的编辑器动作。当浮层或可滚动列表（补全、/settings、模型选择器）获得焦点时，滚动与提示跳转会作用于该列表。',
            rows: fullscreen,
          },
          {
            title: '应用',
            note: '原生 Windows 上 app.suspend 没有默认值，因为 Windows 终端不支持 Unix 作业控制；手动绑定后 Pi 只显示状态消息。WSL 使用正常的 ctrl+z 与 fg。',
            rows: app,
          },
          { title: '会话', note: '', rows: sessions },
          { title: '模型与思考', note: '', rows: models },
          { title: '显示与消息队列', note: '', rows: display },
          { title: '树导航', note: '', rows: tree },
          {
            title: '范围模型选择器',
            note: '仅在 /scoped-models 打开的选择器内生效。',
            rows: scopedModels,
          },
        ]"
        :key="group.title"
        class="mb-12"
      >
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">{{ group.title }}</h2>
        <p v-if="group.note" class="text-surface-400 text-sm mb-3">{{ group.note }}</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">动作 ID</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">默认</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in group.rows" :key="row.id" class="border-b border-surface-800/50">
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ row.id }}</code></td>
                <td class="py-3 px-4">
                  <code class="text-surface-200 text-xs">{{ row.def }}</code>
                </td>
                <td class="py-3 px-4 text-surface-300">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
