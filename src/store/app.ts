import { defineStore } from 'pinia'


interface AppState {
}

export const useAppStore = defineStore('app', {
	state: (): AppState => ({
	})
})
