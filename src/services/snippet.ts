import type { Ref } from "vue";
import { listen } from '@tauri-apps/api/event';
import { useStorage } from '@vueuse/core'
import { getSqliteInstance } from "@/services/sqlite";
import { writeText as clipboardWriteText } from '@tauri-apps/plugin-clipboard-manager';
import { invoke } from '@tauri-apps/api/core';

const USE_STORAGE_SERVICES_SNIPPET_INPUT_TEXT = `box::use_storage_services_snippet_input_text`
const storedSnippetInputText = useStorage(USE_STORAGE_SERVICES_SNIPPET_INPUT_TEXT, '', localStorage) as Ref<string>
async function init() {
	await listenInputEvents();

	async function listenInputEvents() {
		listen<any>('BOX::SNIPPET::INPUT_EVENT', async (event) => {
			// console.log('snippet input event', event.payload.key, storedSnippetInputText.value)
			switch (event.payload.key) {
				case '@': {
					storedSnippetInputText.value = '@'
					break
				}
				case '$': {
					const inputText = storedSnippetInputText.value.slice(1, storedSnippetInputText.value.length)
					const [tag, code] = inputText.split(':')
					if (tag && code) {
						const sqliteInstance = getSqliteInstance()
						const snippets: any = await sqliteInstance.select(`select * from snippets where tag = '${tag}' AND code = '${code}' --case-insensitive limit 1;`)
						if (snippets.length > 0) {
							const snippet = snippets[0]
							await clipboardWriteText(snippet.content) // copy
							await invoke('snippet_write_content_handler', { inputText: `@${inputText}$`, replaceContent: snippet.content, });
						}
					}

					storedSnippetInputText.value = ''
					break
				}
				default: {
					if (event.payload.key) {
						if (storedSnippetInputText.value.length < 30) { // 防止保存字符串过长
							storedSnippetInputText.value += event.payload.key
						}
					} else if (event.payload.backspace) {
						storedSnippetInputText.value = storedSnippetInputText.value.slice(0, -1)
					}
				}
			}
		})
	}
}

export default {
	init
}