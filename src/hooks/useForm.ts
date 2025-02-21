import { Reactive, reactive, inject } from 'vue'

export interface Options {
	layout?: Record<string, any>;
	loading?: boolean;
	model?: Record<string, any>;
	onSubmit: () => Promise<void>;
	onCancel?: () => Promise<void>;
	onClose?: () => Promise<void>;
}

export function useForm(options: Options): Reactive<Required<Options>> {
	const modal = inject<any>('modal')
	const state = reactive<Required<Options>>({
		layout: {
			labelCol: { span: 4 },
			wrapperCol: { span: 20 },
			autoComplete: 'off',
		},
		loading: options.loading || false,
		model: options.model || {},
		onSubmit: async () => {
			try {
				state.loading = true
				await options.onSubmit?.();
			} finally {
				state.loading = false
			}
		},
		onCancel: async () => {
			await state.onClose()
		},
		onClose: async () => {
			modal?.close()
		}
	})
	return state
}