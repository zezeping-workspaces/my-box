import { getSqliteInstance } from "@/services/sqlite";
interface DicStockExtra {
	today_begin_price: number;
	yestoday_end_price: number;
}

class DicStock {
	id?: number;
	market?: string;
	code?: string;
	name?: string;
	price?: number;
	price_at?: Date;
	detail?: string;
	extra?: DicStockExtra;
	updated_at?: Date;
	created_at?: Date;

	constructor(data: Partial<DicStock>) {
		Object.assign(this, {
			...data
		});
	}

	async save(): Promise<boolean> {
		const sqliteInstance = getSqliteInstance();

		const dbStocks: any = await sqliteInstance.select(`SELECT * FROM dic_stocks WHERE market = $1 AND code = $2;`, [this.market, this.code]);
		if (dbStocks.length > 0) {
			this.id = dbStocks[0].id
			if (dbStocks[0].price === this.price) {
				return false
			}
		}
		if (this.id) {
			this.updated_at = new Date()
			await sqliteInstance.execute(
				`UPDATE dic_stocks set market = $1, code = $2, name = $3, price = $4, price_at = $5, detail = $6, extra = $7, updated_at = $8 where id = $9;`,
				[this.market, this.code, this.name, this.price, this.price_at, this.detail, this.extra, this.updated_at, this.id]
			);
		}
		else {
			const result = await sqliteInstance.execute(
				`INSERT INTO dic_stocks(market, code, name, price, price_at, detail, extra) values($1, $2, $3, $4, $5, $6, $7);`,
				[this.market, this.code, this.name, this.price, this.price_at, this.detail, this.extra]
			);
			this.id = result.lastInsertId
		}
		return true
	}
}

export default DicStock