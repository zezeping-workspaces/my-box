import { createApp } from "vue";
import App from "./App.vue";
import Antd from 'ant-design-vue';
import services from './services'
import "./assets/styles/tailwindcss.css";
import 'ant-design-vue/dist/reset.css';
import "./assets/styles/application.scss";


async function init() {
	services.init()
}

async function startApp() {
	await init()

	const app = createApp(App);
	app.use(Antd);
	app.mount("#app");
}
startApp();
