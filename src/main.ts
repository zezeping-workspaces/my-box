import { createApp } from "vue";
import App from "./App.vue";
import Antd from 'ant-design-vue';
import "./assets/styles/tailwindcss.css";
import 'ant-design-vue/dist/reset.css';
import "./assets/styles/application.scss";

const app = createApp(App);
app.use(Antd);
app.mount("#app");
