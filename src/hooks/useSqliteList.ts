import { Reactive, reactive } from "vue"

interface Options {
	loading?: boolean;
	query?: Record<string, any>;
	pagination?: {
		current: number,
		pageSize: number,
		total: number,
		showTotal: (total: number) => string
	};
	records?: Record<string, any>[];
	columns?: Record<string, any>[];
	onLoad?: () => Promise<void>;
	onReset?: () => Promise<void>;
}

export function useSqliteList(options: Options): Reactive<Required<Options>> {
	const state = reactive<Required<Options>>({
		loading: options.loading || false,
		query: options.query || {},
		pagination: options.pagination || {
			current: 1,
			pageSize: 20,
			total: 0,
			showTotal: (total) => `总: ${total} 条`,  // 显示总数
		},
		records: options.records || [],
		columns: options.columns || [],
		async onLoad() {
			try {
				state.loading = true
				await options.onLoad?.();
			} finally {
				state.loading = false
			}
		},
		async onReset() {
			try {
				if (options.onReset) {
					await options.onReset();
				} else {
					state.query = options.query || {}
				}
				await state.onLoad()
			} finally {
				state.loading = false
			}
		}
	})
	return state
}