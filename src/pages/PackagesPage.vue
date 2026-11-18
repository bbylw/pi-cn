<script setup lang="ts">
import CodeBlock from "../components/CodeBlock.vue";

const installCode = `pi install npm:@example/pi-tools@1.0.0
pi install git:github.com/example/pi-tools@v1
pi install ./local-package

pi list
pi remove <source>
pi update --extensions`;

const tryCode = `pi -e npm:@example/pi-tools`;

const sources = [
  { source: "npm", example: "npm:@example/pi-tools@1.0.0", behavior: "安装到 Pi 的 npm 目录下" },
  {
    source: "git",
    example: "git:github.com/example/pi-tools@v1",
    behavior: "克隆并对齐到所选 ref",
  },
  { source: "URL", example: "https://github.com/example/pi-tools", behavior: "按 git 来源处理" },
  { source: "本地", example: "./pi-tools", behavior: "直接从解析后的路径加载，不复制" },
];

const layout = `my-pi-package/
├── package.json
├── extensions/
├── skills/
├── prompts/
└── themes/`;

const manifest = `{
  "name": "my-pi-package",
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./src/extension.ts"],
    "skills": ["./resources/skills"],
    "prompts": ["./resources/prompts/*.md"],
    "themes": ["./resources/themes/*.json"]
  }
}`;

const changelog = `{
  "name": "my-pi-package",
  "version": "1.2.0",
  "pi": {
    "changelogPath": "./docs/CHANGELOG.md"
  }
}`;

const filterConfig = `{
  "packages": [
    {
      "source": "npm:@example/pi-tools",
      "extensions": ["extensions/*.ts", "!extensions/legacy.ts"],
      "skills": [],
      "prompts": ["prompts/review.md"]
    }
  ]
}`;

const hostPackages = [
  "@earendil-works/pi-ai",
  "@earendil-works/pi-agent-core",
  "@earendil-works/pi-coding-agent",
  "@earendil-works/pi-tui",
  "typebox",
];
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">Pi 包</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          Pi 包把扩展、技能、提示模板和主题作为一个单元安装和分发。当某项自定义需要通过 npm 或 git
          分享，
          或多个资源应当放在一起时，就使用包。包就是一个普通目录或 npm
          包，可以暴露约定的资源目录、在
          <code class="text-brand-400">package.json</code> 的
          <code class="text-brand-400">pi</code> 键下声明显式路径，
          并自带运行时依赖。
        </p>
      </div>

      <!-- Install -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">安装与管理包</h2>
        <p class="text-surface-300 mb-3">可以从 npm、git 或本地路径安装：</p>
        <CodeBlock :code="installCode" language="bash" />
        <p class="text-surface-300 mb-3">
          <code class="text-brand-400">pi list</code> 显示已配置的包，<code class="text-brand-400"
            >pi remove &lt;source&gt;</code
          >
          移除包，<code class="text-brand-400">pi update --extensions</code>
          对齐包安装。全部命令与选项见
          <router-link to="/cli" class="text-brand-400 hover:text-brand-300">命令行参考</router-link
          >。
        </p>
        <p class="text-surface-300 mb-3">
          已配置的包在启动时安装失败（例如 npm 无法访问 registry）时，Pi
          会警告、跳过该包的资源并继续运行，
          下次启动或执行 <code class="text-brand-400">/reload</code> 时会再次尝试。<code
            class="text-brand-400"
            >pi install</code
          >
          和
          <code class="text-brand-400">pi update --extensions</code> 仍会报告失败并以非零状态退出。
        </p>
        <p class="text-surface-300 mb-3">
          个人安装写入 <code class="text-brand-400">~/.pi/agent/settings.json</code>，加
          <code class="text-brand-400">--local</code> 或
          <code class="text-brand-400">-l</code> 则写入
          <code class="text-brand-400">.pi/settings.json</code>， Pi
          只在授予项目信任后才读取该文件。
        </p>
        <p class="text-surface-400 text-sm">
          项目包在执行项目信任解析后才安装和加载。包可以执行扩展代码，也可以包含指示模型运行程序的技能；
          安装第三方包前先检查源码，授予项目信任前先检查项目包声明。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          用 <code class="text-brand-400">-e</code> 可以为单次调用试用包而不写入设置：
        </p>
        <CodeBlock :code="tryCode" language="bash" />
        <p class="text-surface-400 text-sm mt-3">
          Pi 把 <code class="text-brand-400">-e</code> 包缓存在
          <code class="text-brand-400">~/.pi/agent/tmp/extensions/</code>，
          每次启动和 <code class="text-brand-400">/reload</code> 都会检查。npm 包在 registry
          有更新的匹配版本时重装，
          但固定到精确版本号（如 <code class="text-brand-400">@1.2.3</code>）的不会被检查；git
          包会获取并重置到远程分支或 ref， ref
          是已检出的提交哈希时不获取。检查失败或处于离线模式时，Pi 加载缓存副本。
        </p>
      </section>

      <!-- Sources -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择来源</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">来源</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">示例</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">行为</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sources" :key="s.source" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ s.source }}</td>
                <td class="py-3 px-4">
                  <code class="text-brand-400 text-xs">{{ s.example }}</code>
                </td>
                <td class="py-3 px-4 text-surface-300">{{ s.behavior }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-surface-400 text-sm mt-3">
          带版本的 npm 规格是固定的，git 标签和提交同样固定；包更新会对齐检出，但不会移动已配置的
          ref。
          相对本地路径从包含它的设置文件解析；文件路径加载单个扩展，目录遵循普通包的发现规则。
        </p>
      </section>

      <!-- Create -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">创建包</h2>
        <p class="text-surface-300 mb-3">最简单的包使用约定目录：</p>
        <CodeBlock :code="layout" language="text" />
        <p class="text-surface-300 text-sm mb-3">
          没有 <code class="text-brand-400">pi</code> 清单时，Pi 从这些目录中发现
          TypeScript/JavaScript 扩展、技能目录、Markdown 提示和 JSON
          主题。资源位于别处或需要过滤时，使用显式清单：
        </p>
        <CodeBlock :code="manifest" language="json" filename="package.json" />
        <p class="text-surface-400 text-sm mt-3">
          路径相对于包根目录，数组接受 glob 模式和排除项。通过 glob
          无法遍历到的、以点开头或符号链接的资源根目录，
          请直接列出。<code class="text-brand-400">pi-package</code> 关键字让 npm 包有资格出现在
          <a
            href="https://pi.dev/packages"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 hover:text-brand-300"
            >Pi 包画廊</a
          >
          中，
          可选的 <code class="text-brand-400">pi.image</code> 和
          <code class="text-brand-400">pi.video</code> 字段添加预览。
        </p>
      </section>

      <!-- Changelog -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">显示更新日志</h2>
        <p class="text-surface-300 mb-3">
          包更新后，Pi 可以在下一次全新启动时显示 “Extension
          Updates”，读取包更新日志中比上次所见版本更新的条目。
          第一次看到某个包时只记录版本，不显示内容。这适用于至少加载一个扩展的包；只提供技能、提示模板或主题的包不会显示更新日志。
        </p>
        <p class="text-surface-300 text-sm mb-3">
          默认读取包根目录的 <code class="text-brand-400">CHANGELOG.md</code>，可用
          <code class="text-brand-400">pi.changelogPath</code> 指向其他文件，或设为
          <code class="text-brand-400">""</code> 禁用：
        </p>
        <CodeBlock :code="changelog" language="json" />
        <p class="text-surface-400 text-sm mt-3">
          版本标题使用与 Pi 更新日志相同的格式，例如
          <code class="text-brand-400">## [1.2.0]</code> 或
          <code class="text-brand-400">## 1.2.0 - 2026-01-01</code>。条目与
          <code class="text-brand-400">package.json</code> 的
          <code class="text-brand-400">version</code> 比较，因此 git
          包只有在该字段增加时才显示更新日志。
          <code class="text-brand-400">collapseChangelog</code> 设置会把该区段压缩为每个包一行。
        </p>
      </section>

      <!-- Dependencies -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">声明依赖</h2>
        <p class="text-surface-300 mb-3">
          扩展导入的运行时包放在 <code class="text-brand-400">dependencies</code> 中，Pi 在安装 npm
          或 git 来源时会安装包的依赖。 Pi 向扩展和技能提供以下包：
        </p>
        <div class="flex flex-wrap gap-2 mb-4">
          <code
            v-for="p in hostPackages"
            :key="p"
            class="px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700/50 text-brand-400 text-xs"
            >{{ p }}</code
          >
        </div>
        <p class="text-surface-300 text-sm">
          在 <code class="text-brand-400">peerDependencies</code> 中以
          <code class="text-brand-400">"*"</code> 范围声明这些由宿主提供的包，
          并不要打包它们。Pi 会为受管理的 npm 包以及用 npm、pnpm 或 Bun 安装的 git 包关闭自动 peer
          安装；
          本地包不会被安装或修改，其依赖树由包作者负责。
          不要把宿主提供的包列进 <code class="text-brand-400">dependencies</code>：物理副本可能绕过
          Pi 的扩展模块映射，
          产生重复的类、注册表和初始化工作；Pi 检测到这种清单配置时会给出扩展警告。
          以依赖形式使用的其他 Pi 包必须包含在发布的 tarball 中，并通过其
          <code class="text-brand-400">node_modules</code> 资源路径引用。
        </p>
      </section>

      <!-- Filtering -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择包资源</h2>
        <p class="text-surface-300 mb-3">设置中的对象形式可以收窄从包中加载的资源：</p>
        <CodeBlock :code="filterConfig" language="json" />
        <p class="text-surface-300 text-sm mt-3">
          对每种资源类型：省略属性表示加载包允许的全部内容；<code class="text-brand-400">[]</code>
          表示不加载该类型； <code class="text-brand-400">!pattern</code> 排除 glob 匹配；<code
            class="text-brand-400"
            >+path</code
          >
          包含一个精确的允许路径；
          <code class="text-brand-400">-path</code>
          排除一个精确路径。过滤器是在包清单基础上收窄，不会暴露包本身未声明的资源。
        </p>
        <p class="text-surface-400 text-sm mt-3">
          运行 <code class="text-brand-400">pi config</code> 启用或禁用发现的资源与 Pi
          的内置扩展；它从个人配置开始，
          按 Tab 切换范围，或用
          <code class="text-brand-400">pi config --local</code> 从项目覆盖开始。
        </p>
      </section>

      <!-- Scope and identity -->
      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">范围与身份</h2>
        <p class="text-surface-300 text-sm">
          同一个包可以同时出现在个人和项目设置中，项目条目通常会替换个人条目；当项目条目带
          <code class="text-brand-400">autoload: false</code> 时，它作为对个人包的过滤增量生效。 Pi
          用包名标识 npm 包、用不含 ref 的仓库 URL 标识 git 包、用解析后的绝对路径标识本地包，
          避免同一个包通过等价声明加载两次。
        </p>
      </section>
    </div>
  </div>
</template>
