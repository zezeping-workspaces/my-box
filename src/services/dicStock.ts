import client from "@/utils/apollo";
import dayjs from "dayjs";
import { usePublicData } from "@/hooks/usePublicData";
import { getSqliteInstance } from "./sqlite";
import { DicStock } from '@/model';
import { fetch } from '@tauri-apps/plugin-http';
const SUBSCRIBE_DATA = `
  subscription StocksFile($channel: String!) {
    stocksFile(channel: $channel) {
      file
    }
  }
`;

function subscribeChannel(channel: string) {
	const market = usePublicData("/data/markets.json");
	const marketValue = market.getValueFromLabel(channel)
	client.subscribe(
		{ query: SUBSCRIBE_DATA, variables: { channel } },
		{
			async next(data: any) {
				const stocksFile = data.data.stocksFile.file;
				const url = `https://zezeping.com/gateway/${stocksFile}`.replace("cos", "cos/_sign");
				const newStocks: any = await fetch(url).then((response) => response.json()).catch((error) => {
					console.error(1, error);
					throw error
				});
				for (const newStock of newStocks) {
					const { code, name, price, update_time: updateTime, detail } = newStock;
					const extra = {
						today_begin_price: (detail["今开"] || detail["开盘价"]),
						yestoday_end_price: detail["昨收"],
					}
					const priceAt = dayjs(updateTime).toDate();
					const dicStock = new DicStock({
						market: marketValue,
						code,
						name,
						price,
						price_at: priceAt,
						detail,
						extra
					})
					await dicStock.save();
				}
			},
			error(err) {
				console.error("Subscription error:", err);
			},
			complete() {
				console.log("Subscription completed");
			}
		}
	);
}

async function init() {
	subscribeChannel('A股');
	subscribeChannel('ETF基金');
}

export default {
	init
}