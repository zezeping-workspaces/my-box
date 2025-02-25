import type { Ref } from "vue";
import { interval } from "rxjs";
import { startWith } from "rxjs/operators";
import { getSqliteInstance } from "./sqlite";
import { sendNotification } from './notification';
import { usePublicData, Options as PublciDataOptions } from "@/hooks/usePublicData";
import { fetchStocksApi, } from "@/api";
import { useStorage } from '@vueuse/core'
import dayjs from "dayjs";
import axios from "axios";
import { message } from '@tauri-apps/plugin-dialog';

async function init() {
	const market = usePublicData("/data/markets.json");
	const _subscription = interval(60 * 1000)
		.pipe(
			startWith(0) // 立即触发一次
		)
		.subscribe(() => {
			if (market.records.length) {
				updateSqliteStocks(market);
				checkTimeBuyReverseRepurchaseFund();
			}
		});
}

const isHolidayMap: Record<string, string> = {}
export async function checkIsBusinessDay() {
	const now = dayjs();
	const day = now.day();
	const dateStr = now.format('YYYY-MM-DD');
	// 判断是否是周六或周日
	if (day === 0 || day === 6) {
		return false; // 股市休市
	}
	if (!isHolidayMap[dateStr]) {
		const { data: rHolidaysData } = await axios.get(`https://zezeping.com/gateway/api/calendar/holiday?date=${dateStr}`);
		const holidaySummary = rHolidaysData.simple_events.map((item: any) => item.summary).join('&')
		Object.assign(isHolidayMap, {
			[dateStr]: holidaySummary.includes('休') ? 'true' : 'false'
		})
	}
	if (isHolidayMap[dateStr] === 'true') return false;
	return true
}

export async function checkIsBusinessTime() {
	const hours = dayjs().hour();
	const minutes = dayjs().minute();
	const day = dayjs().day();
	const dateStr = dayjs().format('YYYY-MM-DD');
	if (!await checkIsBusinessDay()) {
		return false; // 股市休市
	}
	const isWorkMoning = (hours === 9 && minutes >= 30) || (hours > 9 && hours < 11) || (hours === 11 && minutes <= 30); // 判断是否在上午交易时段
	const isWorkAfternoon = (hours >= 13 && hours < 15) || (hours === 15 && minutes <= 0); // 判断是否在下午交易时段
	if (!isWorkMoning && !isWorkAfternoon) return false;
}

const USE_STORAGE_SERVICES_STOCK_BUY_REVERSE_REPURCHASE_FUND = `box::use_storage_services_stock_buy_reverse_repurchase_fund`
const storedStockBuyReverseRepurchaseFund = useStorage(USE_STORAGE_SERVICES_STOCK_BUY_REVERSE_REPURCHASE_FUND, '', localStorage) as Ref<string>

// 是否需要购买逆回购
async function checkTimeBuyReverseRepurchaseFund() {
	// 15点到15点半购买逆回购基金
	const now = dayjs();
	const todayIdentify = now.format("YYYY-MM-DD");
	if (storedStockBuyReverseRepurchaseFund.value === todayIdentify) return
	if (now.hour() === 15 && now.minute() > 0 && now.minute() <= 30) {
		// 判断是否为交易日
		if (await checkIsBusinessDay()) {
			message('请购买逆回购基金!', { title: '交易提醒', kind: 'info' }); // 提醒购买逆回购基金
			sendNotification({
				title: "交易提醒",
				body: `请购买逆回购基金!`,
			})
		}
		storedStockBuyReverseRepurchaseFund.value = todayIdentify
	}
}


async function updateSqliteStocks(market: PublciDataOptions) {
	try {
		const sqliteInstance = getSqliteInstance();
		const stocks: any = await sqliteInstance.select(`select * from stocks;`)
		for (const stock of stocks) {
			const { data: rData } = await fetchStocksApi(market.getLabelFromValue(stock.market), [stock.code]);
			const newStock = rData?.data?.stocks?.[0];
			if (newStock) {
				await sqliteInstance.execute(
					`UPDATE stocks set name = $1, price = $2, price_at = $3, today_begin_price = $4, yestoday_end_price = $5, detail = $6 where id = $7;`,
					[
						newStock.name,
						newStock.price,
						newStock.updateTime,
						newStock.detail?.["今开"] || newStock.detail?.["开盘价"],
						newStock.detail?.["昨收"],
						newStock.detail,
						stock.id
					])
			}
			if (stock.notice_enabled) {
				if (stock.notice_lower_price && newStock.price < stock.notice_lower_price) {
					sendNotification({
						title: "低价告警",
						body: `${newStock.name}(${newStock.code}), 当前价格: ${newStock.price}, 低于通知价格: ${stock.notice_lower_price}`,
					})
				}
				if (stock.notice_higher_price && newStock.price > stock.notice_higher_price) {
					sendNotification({
						title: "高价告警",
						body: `${newStock.name}(${newStock.code}), 当前价格: ${newStock.price}, 高于通知价格: ${stock.notice_higher_price}`,
					})
				}
			}
		}
	} catch (error) {
		console.error(error)
	}
}

export default {
	init
}