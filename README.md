<p align="center">
  <a href="https://pi.dev">
    <img alt="pi logo" src="https://pi.dev/logo-auto.svg" width="128">
  </a>
</p>
<p align="center">
  <a href="https://discord.com/invite/3cU7Bz4UPx"><img alt="Discord" src="https://img.shields.io/badge/discord-community-5865F2?style=flat-square&logo=discord&logoColor=white" /></a>
  <a href="https://www.npmjs.com/package/@earendil-works/pi-coding-agent"><img alt="npm" src="https://img.shields.io/npm/v/@earendil-works/pi-coding-agent?style=flat-square" /></a>
</p>

> 默认情况下，来自新贡献者的新 issue 和 PR 会被自动关闭。维护者每天审查被自动关闭的 issue。参见 [CONTRIBUTING.md](https://github.com/earendil-works/pi/blob/main/CONTRIBUTING.md)。

# Pi Agent Harness

这里是 Pi agent harness 项目的主页，其中包含我们可自我扩展的编码 agent。

* **[@earendil-works/pi-coding-agent](https://github.com/earendil-works/pi/blob/main/packages/coding-agent)**：交互式编码 agent CLI
* **[@earendil-works/pi-agent-core](https://github.com/earendil-works/pi/blob/main/packages/agent)**：具备工具调用和状态管理的 agent 运行时
* **[@earendil-works/pi-ai](https://github.com/earendil-works/pi/blob/main/packages/ai)**：统一的多提供商 LLM API（OpenAI、Anthropic、Google 等）

想进一步了解 Pi：

* [访问 pi.dev](https://pi.dev)，附带演示的项目官网
* [阅读文档](https://pi.dev/docs/latest)，你也可以让 agent 自行解释

## 所有软件包

| 软件包 | 说明 |
|---------|-------------|
| **[@earendil-works/pi-ai](https://github.com/earendil-works/pi/blob/main/packages/ai)** | 统一的多提供商 LLM API（OpenAI、Anthropic、Google 等） |
| **[@earendil-works/pi-agent-core](https://github.com/earendil-works/pi/blob/main/packages/agent)** | 具备工具调用和状态管理的 agent 运行时 |
| **[@earendil-works/pi-coding-agent](https://github.com/earendil-works/pi/blob/main/packages/coding-agent)** | 交互式编码 agent CLI |
| **[@earendil-works/pi-tui](https://github.com/earendil-works/pi/blob/main/packages/tui)** | 采用差分渲染的终端 UI 库 |

关于 Slack/聊天自动化和工作流，参见 [earendil-works/pi-chat](https://github.com/earendil-works/pi-chat)。

## 权限与容器化

Pi 不包含内置的权限系统来限制对文件系统、进程、网络或凭据的访问。默认情况下，它以启动它的用户和进程的权限运行。

如果你需要更强的边界隔离，请对 Pi 进行容器化或沙箱化。参见 [packages/coding-agent/docs/containerization.md](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/containerization.md)，其中介绍了三种方案：

- **Gondolin 扩展**：将 `pi` 和提供商认证保留在主机上，同时把内置工具和 `!` 命令路由到本地 Linux 微型虚拟机中。
- **纯 Docker**：将整个 `pi` 进程运行在本地容器中，实现简单的隔离。
- **OpenShell**：将整个 `pi` 进程运行在受策略控制的沙箱中。

## 贡献

关于贡献指南，参见 [CONTRIBUTING.md](https://github.com/earendil-works/pi/blob/main/CONTRIBUTING.md)；关于项目专属规则（同时面向人类和 agent），参见 [AGENTS.md](https://github.com/earendil-works/pi/blob/main/AGENTS.md)。Pi 的长期规划也可以在 [RFCs](https://rfc.earendil.com/keyword/pi/) 中找到。

## 开发

```bash
npm install --ignore-scripts  # 安装所有依赖，但不运行生命周期脚本
npm run build        # 构建所有软件包
npm run check        # 代码检查、格式化和类型检查
./test.sh            # 运行测试（在没有 API 密钥时跳过依赖 LLM 的测试）
./pi-test.sh         # 从源码运行 pi（可在任意目录下执行）
```

## 供应链加固

我们将 npm 依赖变更视为需要审查的代码变更。

- 直接的外部依赖被固定到精确版本。内部工作区软件包则仍使用版本范围。
- `.npmrc` 设置了 `save-exact=true` 和 `min-release-age=2`，以在 npm 解析依赖时避免使用当天发布的依赖。
- `package-lock.json` 是依赖的权威来源。除非设置了 `PI_ALLOW_LOCKFILE_CHANGE=1`，否则 pre-commit 会阻止意外提交 lockfile。
- `npm run check` 会验证已固定的直接依赖、原生 TypeScript 导入兼容性以及生成的 coding-agent shrinkwrap。
- 已发布的 CLI 软件包包含 `packages/coding-agent/npm-shrinkwrap.json`，它由根 lockfile 生成，用于为 npm 用户固定传递依赖。
- 发布冒烟测试使用 `npm run release:local` 进行构建、打包，并在打标签发布前在仓库外创建隔离的 npm 和 Bun 安装。
- 本地发布安装、文档中记录的 npm 安装，以及 `pi update --self`，在支持的情况下均使用 `--ignore-scripts`。
- CI 使用 `npm ci --ignore-scripts` 安装依赖，并有一个定时的 GitHub 工作流运行 `npm audit --omit=dev` 以及 `npm audit signatures --omit=dev`。
- Shrinkwrap 生成对依赖的生命周期脚本设有明确的白名单；新增带生命周期脚本的依赖在通过审查前会导致检查失败。

## 分享你的开源编码 agent 会话

如果你使用 Pi 或其他编码 agent 进行开源工作，请分享你的会话。

公开的开源会话数据有助于用真实世界的任务、工具使用、失败与修复来改进编码 agent，而不是依赖玩具式的基准测试。

完整的说明请参见 [这篇 X 帖子](https://x.com/badlogicgames/status/2037811643774652911)。

要发布会话，请使用 [`badlogic/pi-share-hf`](https://github.com/badlogic/pi-share-hf)。阅读其 README.md 获取安装说明。你只需要一个 Hugging Face 账户、Hugging Face CLI 以及 `pi-share-hf`。

你也可以观看 [这个视频](https://x.com/badlogicgames/status/2041151967695634619)，其中我演示了如何发布自己的 `pi-mono` 会话。

我会定期在这里发布自己的 `pi-mono` 工作会话：

- [Hugging Face 上的 badlogicgames/pi-mono](https://huggingface.co/datasets/badlogicgames/pi-mono)

## 许可证

MIT

<p align="center">
  <a href="https://pi.dev">pi.dev</a> 域名由以下方慷慨捐赠
  <br /><br />
   <a href="https://exe.dev"><img src="https://github.com/earendil-works/pi/raw/main/packages/coding-agent/docs/images/exy.png" alt="Exy mascot" width="48" /><br />exe.dev</a>
</p>
