import { getCurrentWindow } from "@tauri-apps/api/window";
import sqlite from './sqlite'
import notification from './notification';
import snippet from './snippet';
import stock from './stock';
import { usePublicData, Options as PublciDataOptions } from "@/hooks/usePublicData";

export function isMainWindow() {
	const window = getCurrentWindow()
	return window.label === 'main'
}

async function init() {
	if (isMainWindow()) {
		await usePublicData("/data/markets.json").onLoad();
		await sqlite.init()
		await notification.init()
		await snippet.init()
		await stock.init()
	}
}

export default {
	init
}