<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const startCode = `pi --mode rpc --no-session`

const interfaces = [
  { name: 'SDK', boundary: '进程内', model: '直接的 TypeScript 方法与事件', fit: '需要完整 API 访问的 Node.js 或 Bun 宿主' },
  { name: 'RPC', boundary: '子进程', model: 'JSONL 命令、响应与事件', fit: '其他语言、隔离进程、IDE 或自定义客户端' },
]

const records = [
  { dir: 'stdin', record: '命令', purpose: '让 Pi 执行提示、检查状态、修改配置或管理会话' },
  { dir: 'stdout', record: 'response', purpose: '报告某条命令是否成功并返回命令数据' },
  { dir: 'stdout', record: '会话事件', purpose: '流式输出运行、消息、工具、队列、压缩与重试活动' },
  { dir: '双向', record: '扩展 UI 记录', purpose: '在 Pi 与客户端之间转发扩展交互' },
]

const correlateCode = `{"id":"req-1","type":"get_state"}
{"id":"req-1","type":"response","command":"get_state","success":true,"data":{"...":"..."}}`

const promptCode = `{"id":"req-2","type":"prompt","message":"Review this repository"}
{"id":"req-2","type":"response","command":"prompt","success":true,"data":{"disposition":"started"}}`

const errorCode = `{"id":"req-3","type":"response","command":"set_model","success":false,"error":"Model not found: invalid/model"}
{"type":"response","command":"parse","success":false,"error":"Failed to parse command: Unexpected token..."}`

const pythonCode = `import json
import subprocess

process = subprocess.Popen(
    ["pi", "--mode", "rpc", "--no-session"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
)

assert process.stdin is not None
assert process.stdout is not None

command = {"id": "prompt-1", "type": "prompt", "message": "Hello"}
process.stdin.write(json.dumps(command).encode("utf-8") + b"\\n")
process.stdin.flush()

while line := process.stdout.readline():
    record = json.loads(line)
    if record.get("type") == "message_update":
        update = record["assistantMessageEvent"]
        if update["type"] == "text_delta":
            print(update["delta"], end="", flush=True)
    elif record.get("type") == "agent_settled":
        print()
        break

process.stdin.close()
process.wait()`
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-4xl font-display font-bold text-surface-50 mb-4">RPC 模式</h1>
        <p class="text-lg text-surface-400 leading-relaxed">
          RPC 模式把 Pi 作为长期运行的子进程，通过 stdin 与 stdout 上的 JSON 记录控制。适用于语言无关的集成、
          进程隔离、IDE 与自定义界面。进程内的 Node.js 或 Bun 集成优先使用
          <router-link to="/sdk" class="text-brand-400 hover:text-brand-300">SDK</router-link>；
          基于子进程的 TypeScript 集成优先使用导出的 <code class="text-brand-400">RpcClient</code>，
          它负责启动 Pi、关联响应、暴露类型化命令方法并把事件投递给监听者。
        </p>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">选择接口</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">接口</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">进程边界</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">控制模型</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">最适用</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in interfaces" :key="i.name" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ i.name }}</td>
                <td class="py-3 px-4 text-surface-300">{{ i.boundary }}</td>
                <td class="py-3 px-4 text-surface-300">{{ i.model }}</td>
                <td class="py-3 px-4 text-surface-400">{{ i.fit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">启动 RPC 模式</h2>
        <CodeBlock :code="startCode" language="bash" />
        <p class="text-surface-300 text-sm mt-3">
          常规 CLI 选项仍可选择工作目录、模型、工具、资源与会话行为，常用的是
          <code class="text-brand-400">--provider</code>、<code class="text-brand-400">--model</code>、
          <code class="text-brand-400">--name</code>、<code class="text-brand-400">--no-session</code> 与
          <code class="text-brand-400">--session-dir</code>。RPC 模式拒绝
          <code class="text-brand-400">@file</code> 提示参数，请改用
          <code class="text-brand-400">prompt</code> 命令发送提示。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">协议记录</h2>
        <p class="text-surface-300 text-sm mb-3">协议有四类记录：</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-3 px-4 text-surface-300 font-medium">方向</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">记录</th>
                <th class="text-left py-3 px-4 text-surface-300 font-medium">用途</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in records" :key="r.record" class="border-b border-surface-800/50">
                <td class="py-3 px-4 text-surface-100">{{ r.dir }}</td>
                <td class="py-3 px-4"><code class="text-brand-400 text-xs">{{ r.record }}</code></td>
                <td class="py-3 px-4 text-surface-300">{{ r.purpose }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-lg font-display font-semibold text-surface-100 mt-6 mb-2">关联命令与响应</h3>
        <p class="text-surface-300 text-sm mb-3">
          每条命令接受可选的字符串 <code class="text-brand-400">id</code>，匹配的响应会原样带回：
        </p>
        <CodeBlock :code="correlateCode" language="json" />
        <p class="text-surface-300 text-sm mt-3">
          当可能有多条命令同时在途时应使用唯一 ID。命令处理是异步的，客户端应按 ID 而不是响应顺序关联。
          会话事件通常没有命令 ID，因为它们描述会话活动；<code class="text-brand-400">bash_execution_update</code>
          是例外：发起它的 <code class="text-brand-400">bash</code> 命令有 ID 时，输出事件会重复该 ID。
          <code class="text-brand-400">extension_ui_response</code> 使用其
          <code class="text-brand-400">extension_ui_request</code> 提供的 ID，不产生普通命令响应。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">分帧</h2>
        <p class="text-surface-300 text-sm">
          RPC 使用严格 JSONL 分帧：每条记录写一个完整 JSON 对象并以 LF（<code class="text-brand-400">\n</code>）结尾。
          把 stdout 当作字节或 UTF-8 流，仅按 LF 切分记录，并剥掉可能的前置回车以接受 CRLF。
          不要使用把 Unicode 行/段落分隔符当作记录边界的通用行读取器——Node.js
          <code class="text-brand-400">readline</code> 还会在 <code class="text-brand-400">U+2028</code> 与
          <code class="text-brand-400">U+2029</code> 切分，而它们在 JSON 字符串内是合法的。
          要持续读取 stdout：Pi 会尊重 stdout 背压，但停止读取的客户端可能让进程卡住；写命令时也应尊重 stdin 背压。
          stdout 专用于协议记录，诊断与应用日志写入 stderr。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">运行生命周期</h2>
        <p class="text-surface-300 text-sm mb-3">
          成功的 <code class="text-brand-400">prompt</code> 响应只表示提示被接受、排队或已处理，不代表模型工作完成：
        </p>
        <CodeBlock :code="promptCode" language="json" />
        <p class="text-surface-300 text-sm mt-3">
          <code class="text-brand-400">data.disposition</code> 说明提示的去向；若为
          <code class="text-brand-400">"handled"</code>，本次提示没有启动运行，不要等待
          <code class="text-brand-400">agent_settled</code>。之后继续消费事件：
          <code class="text-brand-400">agent_end</code> 标记一次底层 agent 运行结束，但重试、溢出恢复、压缩、引导或后续工作仍可能继续；
          客户端需要知道 Pi 不会自动继续时，等待 <code class="text-brand-400">agent_settled</code>。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          在发送提示前先订阅，避免错过快速完成。<code class="text-brand-400">RpcClient.promptAndWait()</code>
          内部就是这样做的；若分开调用，请在 <code class="text-brand-400">prompt()</code> 前安装事件监听，
          并只在运行进行中调用 <code class="text-brand-400">waitForIdle()</code>。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">错误与关闭</h2>
        <CodeBlock :code="errorCode" language="json" />
        <p class="text-surface-300 text-sm mt-3">
          失败的命令返回一条 <code class="text-brand-400">success: false</code> 的响应；格式错误的 JSON 产生一条不带请求 ID 的
          <code class="text-brand-400">parse</code> 响应。成功响应只覆盖命令处理，提示被接受后的提供商失败与中止会出现在消息和事件流中。
          客户端还要处理子进程启动失败、意外退出、stderr 诊断、取消以及自身超时；不要把 stderr 当作协议数据解析。
        </p>
        <p class="text-surface-300 text-sm mt-3">
          关闭子进程 stdin 即可请求有序退出：Pi 会释放活动运行时并等待待处理工作完成，给它足够时间再强制终止。
          SIGTERM 与 SIGHUP 也会触发有序关闭；关闭开始后，单个 stdin EOF 或信号不会中断它，第二个信号会立即退出。
          同时关闭 stdin 并发送 SIGTERM 是安全的。扩展也可以调用
          <code class="text-brand-400">ctx.shutdown()</code> 请求关闭。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-display font-semibold text-surface-50 mb-4">最小客户端</h2>
        <p class="text-surface-300 text-sm mb-3">
          下面的 Python 示例使用二进制管道读取，按 LF 切分而不把 Unicode 分隔符当作协议边界：
        </p>
        <CodeBlock :code="pythonCode" language="python" />
      </section>

      <section class="glass-card p-6">
        <h2 class="text-xl font-display font-semibold text-surface-50 mb-3">相关参考</h2>
        <ul class="space-y-2 text-sm">
          <li><router-link to="/json" class="text-brand-400 hover:text-brand-300">JSON 事件流</router-link><span class="text-surface-400">：共用的 stdout 会话事件与流式重建。</span></li>
          <li><router-link to="/session-format" class="text-brand-400 hover:text-brand-300">会话文件格式</router-link><span class="text-surface-400">：会话命令返回的条目。</span></li>
          <li><router-link to="/cli" class="text-brand-400 hover:text-brand-300">命令行</router-link><span class="text-surface-400">：版本相关的完整选项。</span></li>
          <li><router-link to="/sdk" class="text-brand-400 hover:text-brand-300">SDK</router-link><span class="text-surface-400">：进程内集成与 SessionManager API。</span></li>
        </ul>
        <p class="text-surface-400 text-sm mt-3">
          协议定义的权威来源是仓库中的 <code class="text-brand-400">rpc-types.ts</code> 与
          <code class="text-brand-400">rpc-client.ts</code>。
        </p>
      </section>
    </div>
  </div>
</template>
