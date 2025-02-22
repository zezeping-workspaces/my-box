import { interval } from "rxjs";
import { startWith } from "rxjs/operators";
import { getSqliteInstance } from "./sqlite";
import { sendNotification } from './notification';
import { usePublicData, Options as PublciDataOptions } from "@/hooks/usePublicData";
import { fetchStocksApi, } from "@/api";

async function init() {
	const market = usePublicData("/data/markets.json");
	await new Promise((resolve) => setTimeout(resolve, 1000));
	const subscription = interval(60 * 1000)
		.pipe(
			startWith(0) // 立即触发一次
		)
		.subscribe(() => {
			if (market.records.length) {
				updateSqliteStocks(market);
			}
		});
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