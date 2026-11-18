<script setup lang="ts">
const currentYear = new Date().getFullYear();

const docSections = [
  {
    title: "快速开始",
    links: [
      { label: "快速开始", path: "/quickstart" },
      { label: "使用指南", path: "/usage" },
      { label: "模型提供商", path: "/providers" },
      { label: "扩展与技能", path: "/extensions" },
    ],
  },
  {
    title: "进阶文档",
    links: [
      { label: "安全", path: "/security" },
      { label: "会话管理", path: "/sessions" },
      { label: "上下文压缩", path: "/compaction" },
      { label: "容器化", path: "/containerization" },
    ],
  },
  {
    title: "开发",
    links: [
      { label: "设置", path: "/settings" },
      { label: "SDK", path: "/sdk" },
      { label: "生态包", path: "/packages" },
      { label: "文档中心", path: "/docs" },
    ],
  },
];

const socialLinks = [
  {
    label: "GitHub",
    url: "https://github.com/earendil-works/pi",
    icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  {
    label: "Discord",
    url: "https://discord.com/invite/3cU7Bz4UPx",
    icon: "M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.011c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
  },
  {
    label: "npm",
    url: "https://www.npmjs.com/package/@earendil-works/pi-coding-agent",
    icon: "M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z",
  },
  {
    label: "X (Twitter)",
    url: "https://x.com/pidotdev",
    icon: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
];
</script>

<template>
  <footer class="footer-bar border-t border-surface-800/50 bg-surface-950/50 backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:py-12">
      <!-- 桌面端：品牌 + 四列链接 -->
      <div class="hidden md:grid md:grid-cols-5 gap-8">
        <div class="md:col-span-1">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center"
            >
              <span class="text-surface-950 font-display font-bold text-lg">π</span>
            </div>
            <span class="font-display font-semibold text-xl text-surface-50">Pi</span>
          </div>
          <p class="text-surface-400 text-sm leading-relaxed">
            极简终端编码 Agent 框架。<br />让你的工作流适应 Pi，而非相反。
          </p>
        </div>

        <div v-for="section in docSections" :key="section.title">
          <h4 class="font-semibold text-surface-100 mb-4">{{ section.title }}</h4>
          <ul class="space-y-2">
            <li v-for="link in section.links" :key="link.label">
              <router-link
                :to="link.path"
                class="text-surface-400 hover:text-brand-400 text-sm transition-colors"
              >
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-surface-100 mb-4">社区</h4>
          <ul class="space-y-2">
            <li v-for="link in socialLinks" :key="link.label">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-surface-400 hover:text-brand-400 text-sm transition-colors"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 移动端：紧凑品牌行 + 社区图标 + 折叠链接组 -->
      <div class="md:hidden">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center"
            >
              <span class="text-surface-950 font-display font-bold text-lg">π</span>
            </div>
            <span class="font-display font-semibold text-lg text-surface-50">Pi</span>
          </div>
          <ul class="flex items-center gap-1 shrink-0" aria-label="社区链接">
            <li v-for="link in socialLinks" :key="link.label">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="link.label"
                class="flex items-center justify-center w-11 h-11 rounded-xl text-surface-400 hover:text-brand-400 hover:bg-surface-800/60 active:bg-surface-800 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                  <path :d="link.icon" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
        <p class="mt-3 text-surface-400 text-xs leading-relaxed">
          极简终端编码 Agent 框架。让你的工作流适应 Pi，而非相反。
        </p>

        <nav class="mt-6" aria-label="文档链接">
          <details v-for="section in docSections" :key="section.title" class="footer-group">
            <summary
              class="flex items-center justify-between min-h-11 py-3 text-sm font-semibold text-surface-100 cursor-pointer select-none"
            >
              {{ section.title }}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="footer-chevron w-4 h-4 text-surface-500"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <ul class="pb-3 grid grid-cols-2 gap-x-4">
              <li v-for="link in section.links" :key="link.label">
                <router-link
                  :to="link.path"
                  class="flex items-center min-h-11 text-sm text-surface-400 hover:text-brand-400 active:text-brand-400 transition-colors"
                >
                  {{ link.label }}
                </router-link>
              </li>
            </ul>
          </details>
        </nav>
      </div>

      <div
        class="mt-8 pt-6 md:mt-12 md:pt-8 border-t border-surface-800/50 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4"
      >
        <p class="text-surface-500 text-xs sm:text-sm text-center">
          © {{ currentYear }} Earendil Inc. & Contributors. MIT License.
        </p>
        <p class="text-surface-500 text-xs text-center">
          pi.dev 域名由
          <a
            href="https://exe.dev"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-500 hover:text-brand-400"
            >exe.dev</a
          >
          慷慨捐赠
        </p>
      </div>
    </div>
  </footer>
</template>
