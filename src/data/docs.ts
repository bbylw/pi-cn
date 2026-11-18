// 分组结构与上游 earendil-works/pi 文档 docs.json 的导航保持一致，
// 仅列出本站已翻译的页面，避免出现死链。
// 该数据同时驱动导航菜单、搜索索引与上一页/下一页导航。

export interface DocEntry {
  path: string;
  label: string;
  desc: string;
  keywords: string;
}

export interface DocGroup {
  title: string;
  items: DocEntry[];
}

export const docGroups: DocGroup[] = [
  {
    title: "入门",
    items: [
      {
        path: "/",
        label: "概述",
        desc: "Pi 是什么，为什么选择它",
        keywords: "home overview 首页 介绍",
      },
      {
        path: "/quickstart",
        label: "快速开始",
        desc: "安装、连接模型、完成第一个任务",
        keywords: "install npm curl bun pnpm nix 安装 卸载 uninstall",
      },
      {
        path: "/how-pi-works",
        label: "Pi 如何工作",
        desc: "工具、上下文、会话与 agent 循环",
        keywords: "agent loop tools context 原理 架构",
      },
    ],
  },
  {
    title: "运行 Pi",
    items: [
      {
        path: "/usage",
        label: "在终端使用 Pi",
        desc: "输入、命令、快捷键和排队消息",
        keywords: "terminal tui editor queue 输入 快捷键",
      },
      {
        path: "/models",
        label: "选择模型",
        desc: "订阅、API Key、本地模型与兼容端点",
        keywords: "model login oauth api key ollama lmstudio 本地模型",
      },
      {
        path: "/sessions",
        label: "管理会话与上下文",
        desc: "恢复、分支、压缩与分享",
        keywords: "session resume continue branch export share 会话 恢复",
      },
      {
        path: "/security",
        label: "安全运行 Pi",
        desc: "项目信任、隔离方式与恢复",
        keywords: "security trust sandbox 安全 信任",
      },
      {
        path: "/containerization",
        label: "隔离 Pi",
        desc: "Docker、Docker Sandboxes、OpenShell、Gondolin",
        keywords: "docker sandbox isolation 容器 隔离 虚拟机",
      },
      {
        path: "/terminal-setup",
        label: "配置终端",
        desc: "修改键、滚动、链接、图片与 IME 问题",
        keywords: "terminal kitty ghostty iterm wezterm 输入法 乱码",
      },
      {
        path: "/shell-aliases",
        label: "配置 Shell 命令",
        desc: "shellPath、命令前缀与 Bash 别名",
        keywords: "bash zsh fish alias shell 别名",
      },
      {
        path: "/tmux",
        label: "在 tmux 中运行",
        desc: "通过扩展键区分 Shift+Enter 与 Enter",
        keywords: "tmux extended keys shift enter",
      },
      {
        path: "/windows",
        label: "在 Windows 上运行",
        desc: "Git Bash、PowerShell 与 WSL",
        keywords: "windows powershell wsl git bash",
      },
      {
        path: "/termux",
        label: "在 Android 上运行",
        desc: "Termux 安装、共享存储与剪贴板",
        keywords: "android termux 手机 安卓",
      },
    ],
  },
  {
    title: "自定义 Pi",
    items: [
      {
        path: "/configuration",
        label: "配置 Pi",
        desc: "agent 目录、项目 .pi 与上下文文件",
        keywords: "config agents.md settings.json 配置 目录",
      },
      {
        path: "/prompt-templates",
        label: "提示模板",
        desc: "把 Markdown 文件变成可复用命令",
        keywords: "prompt template markdown 模板 命令",
      },
      {
        path: "/skills",
        label: "添加技能",
        desc: "按需加载的专门指令与配套文件",
        keywords: "skill skills 技能 指令",
      },
      {
        path: "/themes",
        label: "创建主题",
        desc: "选择或自定义终端配色",
        keywords: "theme color 主题 配色 颜色",
      },
      {
        path: "/packages",
        label: "使用生态包",
        desc: "通过 npm 或 git 打包分发资源",
        keywords: "package npm git 包 分发 画廊",
      },
      {
        path: "/mcp",
        label: "连接 MCP 服务器",
        desc: "连接 Model Context Protocol 服务器",
        keywords: "mcp model context protocol stdio http 服务器",
      },
    ],
  },
  {
    title: "在 Pi 上构建",
    items: [
      {
        path: "/extensions",
        label: "构建扩展",
        desc: "TypeScript 模块扩展 Pi 的行为",
        keywords: "extension typescript tool command event 扩展 工具",
      },
      {
        path: "/custom-provider",
        label: "添加自定义提供商",
        desc: "注册端点、认证与自定义流式",
        keywords: "provider endpoint stream 自定义 提供商 api",
      },
      {
        path: "/tui",
        label: "构建终端 UI 组件",
        desc: "用 pi-tui 构建自定义组件与浮层",
        keywords: "tui component overlay 组件 界面",
      },
      {
        path: "/sdk",
        label: "使用 SDK",
        desc: "在 Node.js 或 Bun 应用中嵌入 Pi",
        keywords: "sdk node bun embed 嵌入 编程",
      },
    ],
  },
  {
    title: "参考",
    items: [
      {
        path: "/cli",
        label: "命令行",
        desc: "全部命令与选项、打印/JSON/RPC 模式",
        keywords: "cli flags options print 命令行 参数",
      },
      {
        path: "/slash-commands",
        label: "斜杠命令",
        desc: "交互会话中的内置命令",
        keywords: "slash command /login /model /resume 命令",
      },
      {
        path: "/settings",
        label: "设置",
        desc: "全部设置项及默认值",
        keywords: "settings defaults 设置 默认值",
      },
      {
        path: "/keybindings",
        label: "键位绑定",
        desc: "全部动作 ID 与默认按键",
        keywords: "keybinding keyboard shortcut 快捷键 按键",
      },
      {
        path: "/providers",
        label: "模型提供商",
        desc: "认证方式与提供商专属配置",
        keywords: "provider anthropic openai google azure bedrock openrouter 认证",
      },
      {
        path: "/session-format",
        label: "会话文件格式",
        desc: "JSONL 条目类型与树结构",
        keywords: "jsonl format tree 会话 格式 文件",
      },
      {
        path: "/compaction",
        label: "压缩与分支摘要",
        desc: "阈值、保留边界、分支摘要与扩展钩子",
        keywords: "compaction summary 压缩 摘要 上下文",
      },
      {
        path: "/json",
        label: "JSON 事件流",
        desc: "流式事件、工具执行与压缩事件",
        keywords: "json event stream 事件 流",
      },
      {
        path: "/rpc",
        label: "RPC 协议",
        desc: "通过 stdin/stdout 控制 Pi 子进程",
        keywords: "rpc stdin stdout jsonl 协议 进程",
      },
    ],
  },
];

export const docsHubEntry: DocEntry = {
  path: "/docs",
  label: "文档中心",
  desc: "全部指南与参考的总览",
  keywords: "docs documentation 文档 目录 总览",
};

/** 按导航顺序展开的全部文档条目（不含首页），用于上一页/下一页。 */
export const docOrder: DocEntry[] = docGroups.flatMap((group) =>
  group.items.filter((item) => item.path !== "/"),
);

export const searchIndex: DocEntry[] = [docsHubEntry, ...docGroups.flatMap((group) => group.items)];

export function getDocNeighbors(path: string): { prev?: DocEntry; next?: DocEntry } {
  const index = docOrder.findIndex((entry) => entry.path === path);
  if (index === -1) return {};
  return {
    prev: index > 0 ? docOrder[index - 1] : undefined,
    next: index < docOrder.length - 1 ? docOrder[index + 1] : undefined,
  };
}
