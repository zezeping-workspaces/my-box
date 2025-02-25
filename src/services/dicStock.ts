import client from "@/utils/apollo";
import dayjs from "dayjs";
import { usePublicData } from "@/hooks/usePublicData";
import { getSqliteInstance } from "./sqlite";
import { DicStock } from '@/model';
import axios from "axios";
const SUBSCRIBE_DATA = `
  subscription StocksFile($channel: String!) {
    stocksFile(channel: $channel) {
      file
    }
  }
`;

function subscribeChannel(channel: string) {
	const market = usePublicData("/data/markets.json");
	const sqliteInstance = getSqliteInstance();
	const marketValue = market.getValueFromLabel(channel)
	client.subscribe(
		{ query: SUBSCRIBE_DATA, variables: { channel } },
		{
			async next(data: any) {
				const stocksFile = data.data.stocksFile.file;
				const url = `https://zezeping.com/gateway/${stocksFile}`;
				const { data: rData } = await axios.get(url, {
					headers: {
						'Content-Type': 'application/json'
					}
				})
				console.log(1, stocksFile, rData)
				for (const newStock of rData) {
					const { code, name, price, update_time: updateTime, detail } = newStock;
					const extra = {
						today_begin_price: (detail["今开"] || detail["开盘价"]),
						yestoday_end_price: detail["昨收"],
					}
					const priceAt = dayjs(updateTime).date();
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
}

export default {
	init
}