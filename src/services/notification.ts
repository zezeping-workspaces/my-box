import { isPermissionGranted, requestPermission, sendNotification as sendSystemNotification, Options } from '@tauri-apps/plugin-notification';

export async function onGranted(callback: () => Promise<void>) {
	let permissionGranted = await isPermissionGranted();
	// If not we need to request it
	if (!permissionGranted) {
		const permission = await requestPermission();
		permissionGranted = permission === 'granted';
	}
	if (permissionGranted) {
		await callback()
	}
}

export function sendNotification(options: Options | string): void {
	sendSystemNotification(options)
}

async function init() {
	await onGranted(async () => {
		console.log('notification is granted')
	})
}

export default {
	init
}