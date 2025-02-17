import { createApp } from "vue";
import App from "./App.vue";
import Antd from 'ant-design-vue';
import "./assets/styles/tailwindcss.css";
import 'ant-design-vue/dist/reset.css';
import "./assets/styles/application.scss";

import { appLocalDataDir } from '@tauri-apps/api/path';
import Database from '@tauri-apps/plugin-sql';
async function init() {
	const appLocalDataPath = await appLocalDataDir();
	console.log(`app local data: ${appLocalDataPath}`);
	const db = await Database.load('sqlite:data.db');
}

async function startApp() {
	await init();

	const app = createApp(App);
	app.use(Antd);
	app.mount("#app");
}

startApp();
