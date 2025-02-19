import { createPinia as createVuePinia } from 'pinia'

export const createPinia = () => {
	const pinia = createVuePinia()
	return pinia
}

export default createPinia()