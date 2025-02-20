import notification from './notification';
import snippet from './snippet';

import { appLocalDataDir } from '@tauri-apps/api/path';
import Database from '@tauri-apps/plugin-sql';

async function init() {
	const appLocalDataPath = await appLocalDataDir();
	console.log(`app local data: ${appLocalDataPath}`);
	const db = await Database.load('sqlite:data.db');

	await notification.init()
	await snippet.init()
}


export default {
	init
}