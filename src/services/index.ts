import { getCurrentWindow } from "@tauri-apps/api/window";
import sqlite from './sqlite'
import notification from './notification';
import snippet from './snippet';
import stock from './stock';

export function isMainWindow() {
	const window = getCurrentWindow()
	return window.label === 'main'
}

async function init() {
	if (isMainWindow()) {
		await sqlite.init()
		await notification.init()
		await snippet.init()
		await stock.init()
	}
}

export default {
	init
}