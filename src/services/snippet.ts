import { sendNotification } from '@tauri-apps/plugin-notification';
import type { Ref } from "vue";
import { listen } from '@tauri-apps/api/event';
import { useStorage } from '@vueuse/core'

const USE_STORAGE_SERVICES_SNIPPET_SWITCH = `box::use_storage_services_snippet_switch`
let storedSnippetSwitch = useStorage(USE_STORAGE_SERVICES_SNIPPET_SWITCH, false, localStorage) as Ref<boolean>
async function init() {
	await listenInputEvents();
}

async function listenInputEvents() {
	listen<any>('BOX::SNIPPET::INPUT_EVENT', (event) => {
		if (!event.payload.key && event.payload.middle_mouse) {
			storedSnippetSwitch.value = !storedSnippetSwitch.value
			sendNotification({
				title: 'MyBox',
				body: `Snippet ${storedSnippetSwitch.value ? 'ON' : 'OFF'}`,
			})
		}
	})
}


export default {
	init
}