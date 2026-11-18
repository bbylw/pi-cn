import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/HomePage.vue"),
    meta: { title: "Pi - 极简编码 Agent 框架" },
  },
  {
    path: "/quickstart",
    name: "Quickstart",
    component: () => import("../pages/QuickstartPage.vue"),
    meta: { title: "快速开始 - Pi" },
  },
  {
    path: "/how-pi-works",
    name: "HowPiWorks",
    component: () => import("../pages/HowPiWorksPage.vue"),
    meta: { title: "Pi 如何工作 - Pi" },
  },
  {
    path: "/usage",
    name: "Usage",
    component: () => import("../pages/UsagePage.vue"),
    meta: { title: "使用指南 - Pi" },
  },
  {
    path: "/models",
    name: "Models",
    component: () => import("../pages/ModelsPage.vue"),
    meta: { title: "选择模型 - Pi" },
  },
  {
    path: "/providers",
    name: "Providers",
    component: () => import("../pages/ProvidersPage.vue"),
    meta: { title: "模型提供商 - Pi" },
  },
  {
    path: "/extensions",
    name: "Extensions",
    component: () => import("../pages/ExtensionsPage.vue"),
    meta: { title: "扩展 - Pi" },
  },
  {
    path: "/skills",
    name: "Skills",
    component: () => import("../pages/SkillsPage.vue"),
    meta: { title: "技能 - Pi" },
  },
  {
    path: "/mcp",
    name: "Mcp",
    component: () => import("../pages/McpPage.vue"),
    meta: { title: "MCP 服务器 - Pi" },
  },
  {
    path: "/configuration",
    name: "Configuration",
    component: () => import("../pages/ConfigurationPage.vue"),
    meta: { title: "配置 - Pi" },
  },
  {
    path: "/packages",
    name: "Packages",
    component: () => import("../pages/PackagesPage.vue"),
    meta: { title: "生态包 - Pi" },
  },
  {
    path: "/docs",
    name: "Docs",
    component: () => import("../pages/DocsPage.vue"),
    meta: { title: "文档 - Pi" },
  },
  // New documentation pages
  {
    path: "/security",
    name: "Security",
    component: () => import("../pages/SecurityPage.vue"),
    meta: { title: "安全 - Pi" },
  },
  {
    path: "/sessions",
    name: "Sessions",
    component: () => import("../pages/SessionsPage.vue"),
    meta: { title: "会话管理 - Pi" },
  },
  {
    path: "/compaction",
    name: "Compaction",
    component: () => import("../pages/CompactionPage.vue"),
    meta: { title: "上下文压缩 - Pi" },
  },
  {
    path: "/containerization",
    name: "Containerization",
    component: () => import("../pages/ContainerizationPage.vue"),
    meta: { title: "容器化 - Pi" },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../pages/SettingsPage.vue"),
    meta: { title: "设置 - Pi" },
  },
  {
    path: "/sdk",
    name: "Sdk",
    component: () => import("../pages/SdkPage.vue"),
    meta: { title: "SDK - Pi" },
  },
  {
    path: "/cli",
    name: "Cli",
    component: () => import("../pages/CliPage.vue"),
    meta: { title: "命令行 - Pi" },
  },
  {
    path: "/slash-commands",
    name: "SlashCommands",
    component: () => import("../pages/SlashCommandsPage.vue"),
    meta: { title: "斜杠命令 - Pi" },
  },
  // Terminal and environment guides
  {
    path: "/terminal-setup",
    name: "TerminalSetup",
    component: () => import("../pages/TerminalSetupPage.vue"),
    meta: { title: "配置终端 - Pi" },
  },
  {
    path: "/shell-aliases",
    name: "ShellAliases",
    component: () => import("../pages/ShellAliasesPage.vue"),
    meta: { title: "配置 shell 命令 - Pi" },
  },
  {
    path: "/tmux",
    name: "Tmux",
    component: () => import("../pages/TmuxPage.vue"),
    meta: { title: "在 tmux 中运行 Pi - Pi" },
  },
  {
    path: "/windows",
    name: "Windows",
    component: () => import("../pages/WindowsPage.vue"),
    meta: { title: "在 Windows 上运行 Pi - Pi" },
  },
  {
    path: "/termux",
    name: "Termux",
    component: () => import("../pages/TermuxPage.vue"),
    meta: { title: "在 Android 上用 Termux 运行 Pi - Pi" },
  },
  // Customization references
  {
    path: "/prompt-templates",
    name: "PromptTemplates",
    component: () => import("../pages/PromptTemplatesPage.vue"),
    meta: { title: "提示模板 - Pi" },
  },
  {
    path: "/themes",
    name: "Themes",
    component: () => import("../pages/ThemesPage.vue"),
    meta: { title: "主题 - Pi" },
  },
  {
    path: "/custom-provider",
    name: "CustomProvider",
    component: () => import("../pages/CustomProviderPage.vue"),
    meta: { title: "自定义提供商 - Pi" },
  },
  {
    path: "/tui",
    name: "Tui",
    component: () => import("../pages/TuiPage.vue"),
    meta: { title: "终端 UI - Pi" },
  },
  // Protocol and format references
  {
    path: "/keybindings",
    name: "Keybindings",
    component: () => import("../pages/KeybindingsPage.vue"),
    meta: { title: "键位绑定 - Pi" },
  },
  {
    path: "/session-format",
    name: "SessionFormat",
    component: () => import("../pages/SessionFormatPage.vue"),
    meta: { title: "会话文件格式 - Pi" },
  },
  {
    path: "/json",
    name: "Json",
    component: () => import("../pages/JsonPage.vue"),
    meta: { title: "JSON 事件流 - Pi" },
  },
  {
    path: "/rpc",
    name: "Rpc",
    component: () => import("../pages/RpcPage.vue"),
    meta: { title: "RPC 模式 - Pi" },
  },
  {
    path: "/development",
    redirect: "/docs",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || "Pi - 极简编码 Agent 框架";
  next();
});

export default router;
