import { appLocalDataDir } from '@tauri-apps/api/path';
import Database from '@tauri-apps/plugin-sql';

let sqliteInstance: Database;
async function init() {
	const appLocalDataPath = await appLocalDataDir();
	console.log(`app local data: ${appLocalDataPath}`);
	const db = await Database.load('sqlite:data.db');
	sqliteInstance = db;
}

export function getSqliteInstance(): Database {
	return sqliteInstance
}

export default {
	init
}