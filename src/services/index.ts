import { appLocalDataDir } from '@tauri-apps/api/path';
import { listen } from '@tauri-apps/api/event';
import Database from '@tauri-apps/plugin-sql';

async function init() {
	const appLocalDataPath = await appLocalDataDir();
	console.log(`app local data: ${appLocalDataPath}`);
	const db = await Database.load('sqlite:data.db');

	await listen_backend_events();
}

async function listen_backend_events() {
	listen<any>('BOX::SNIPPET::INPUT_EVENT', (event) => {
		console.log(123, event)
	})
}


export default {
	init
}