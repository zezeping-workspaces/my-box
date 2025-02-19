import { createApp } from "vue";
import App from "./App.vue";
import Antd from 'ant-design-vue';
import store from './store'
import router from './router';
import services from './services'
import "./assets/styles/tailwindcss.css";
import 'ant-design-vue/dist/reset.css';
import "./assets/styles/application.scss";


async function init() {
	services.init()
}

async function startApp() {
	try {
		await init()
	} catch (error) {
		console.error(error)
	}
	

	const app = createApp(App);
	app.use(Antd);
	app.use(store);
	app.use(router);
	app.mount("#app");
}
startApp();
