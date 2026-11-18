import { onUnmounted, ref } from "vue";

export type CopyStatus = "idle" | "copied" | "failed";

// VoiceOver 会跳过与上一条相同的 live region 消息，重复时追加不换行空格使其不同。
let lastMessage = "";

function legacyCopy(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;inset-block-start:0;opacity:0";
  document.body.append(field);
  field.select();
  try {
    return document.execCommand("copy");
  } finally {
    field.remove();
  }
}

export function useClipboard(resetDelay = 2000) {
  const status = ref<CopyStatus>("idle");
  const message = ref("");
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(text: string) {
    if (!text) return;
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 仅在 Async Clipboard 缺失或被拒绝时退回 execCommand
      ok = legacyCopy(text);
    }
    clearTimeout(timer);
    status.value = ok ? "copied" : "failed";
    let text_ = ok ? "已复制" : "复制失败";
    if (text_ === lastMessage) text_ += "\u00A0";
    lastMessage = text_;
    message.value = "";
    requestAnimationFrame(() => {
      message.value = text_;
    });
    timer = setTimeout(() => {
      status.value = "idle";
      message.value = "";
    }, resetDelay);
  }

  onUnmounted(() => clearTimeout(timer));

  return { status, message, copy };
}
