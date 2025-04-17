import axios from 'axios'
import * as http from '@tauri-apps/plugin-http';
import dayjs from "dayjs";

export class AStockApi {
	static marketPrefix(code: string) {
		code = code.toString().trim();
		// 检查是否为纯数字
		if (!/^\d+$/.test(code)) {
			return code;
		}
		// 根据代码开头判断交易所
		if (code.startsWith('6') || code.startsWith('9') || code.startsWith('688')) {  // 沪市 (A股/B股/科创板)
			return "SH";
		} else if (code.startsWith('0') || code.startsWith('2') || code.startsWith('3')) {  // 深市 (A股/B股/创业板)
			return "SZ";
		} else if (code.startsWith('4') || code.startsWith('8')) {  // 北交所/老三板
			return "BJ";
		} else {
			throw new Error("无法识别的股票代码");
		}
	}
	// zezeping
	static async fetchZZPStocksApi(codes: string[]) {
		const channel = 'A股'
		const query = `
		mutation stocks($channel: String!, $codes: [String!]!) {
				stocks(channel: $channel, codes: $codes) { code, name, price, detail, updateTime }
			}
	`;
		const variables = {
			channel,
			codes
		};
		try {
			// console.log(variables)
			const { data: rData } = await axios.post('https://zezeping.com/gateway/graphql', {
				query,
				variables
			}, {
				headers: {
					'Content-Type': 'application/json'
				}
			})
			const list = rData?.data?.stocks || []
			return list
		} catch (error) {
			console.error(error)
			await new Promise((resolve) => setTimeout(resolve, 3000))
			return []
		}

	}
	// Tecent  http://qt.gtimg.cn/q=sz000625,sh600519
	static async fetchTXStocksApi(codes: string[]) {
		let list: any[] = []
		try {
			const codesWithMarketPrefix = codes.map(code => `${AStockApi.marketPrefix(code)}${code}`.toLowerCase())
			const apiUrl = `http://qt.gtimg.cn/q=${codesWithMarketPrefix.join(',')}`
			const response: any = await http.fetch(apiUrl, {
				method: 'GET',
			})
			const arrayBuffer = await response.arrayBuffer();
			// https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
			let utf8decoder = new TextDecoder('GBK')
			const resData = utf8decoder.decode(new Uint8Array(arrayBuffer))
			let arr = resData.split(';');
			for (let i = 0; i < arr.length; i++) {
				const data = arr[i].split('~')
				if (data.length > 33) {
					list.push({
						code: data[2],
						name: data[1],
						price: Number(data[3]),
						updateTime: dayjs(data[30], "YYYYMMDDHHmmss").toDate(),
						detail: {
							close_price: Number(data[4]),
							open_price: Number(data[5]),
						},
						_from: `腾讯股票 ${codes.join(',')}`
					})
				}
			}
			return list
		} catch (e) {
			console.error(e)
			await new Promise((resolve) => setTimeout(resolve, 3000))
			return []
		}
	}
	static async fetchStocksApi(codes: string[]) {
		const list = await Promise.race([
			AStockApi.fetchZZPStocksApi(codes),
			AStockApi.fetchTXStocksApi(codes)
		])
		return list
	}
}