import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";

// 仅在缺少原生 Popover 支持时按需加载 polyfill
if (!Object.hasOwn(HTMLElement.prototype, "popover")) {
  void import("@oddbird/popover-polyfill");
}

const app = createApp(App);
app.use(router);
app.mount("#app");
