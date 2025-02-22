import { Reactive, reactive } from "vue"
import axios from 'axios'

export interface Options {
	loading: boolean;
	records: Record<string, any>[];
	onLoad: () => Promise<void>;
	getLabelFromValue(value: string): string;
	getValueFromLabel(label: string): string;
}

export function usePublicData(path: string): Reactive<Options> {
	const state = reactive<Required<Options>>({
		loading: false,
		records: [],
		async onLoad() {
			try {
				state.loading = true
				const { data: rData } = await axios.get(path);
				state.records = rData
			} finally {
				state.loading = false
			}
		},
		getLabelFromValue(value: string): string {
			const record = state.records.find((r) => r.value === value)
			return record ? record.label : null
		},
		getValueFromLabel(label: string): string {
			const record = state.records.find((r) => r.label === label)
			return record ? record.value : null
		}
	})

	state.onLoad()
	return state
}