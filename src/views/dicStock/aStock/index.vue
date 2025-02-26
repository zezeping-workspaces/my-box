<script lang="tsx" setup>
import { ref, computed } from "vue";
import { useAsyncState } from "@vueuse/core";
import { DicStock } from "@/model";
import { useSqliteList } from "@/hooks/useSqliteList";
import { getSqliteInstance } from "@/services/sqlite";
import dayjs from "dayjs";
import { fetch } from "@tauri-apps/plugin-http";
import { merge } from "lodash-es";
import { Tag } from "ant-design-vue";

const sqliteInstance = getSqliteInstance();
// const market = usePublicData("/data/markets.json");
const list = useSqliteList({
  query: {
    market: "A",
  },
  onLoad: async () => {
    let whereConditions = [];
    let whereSegment = "";

    if (list.query.market) {
      whereConditions.push(`market = '${list.query.market}'`);
    }
    if (list.query.code) {
      whereConditions.push(`code = '${list.query.code}'`);
    }
    if (list.query.name) {
      whereConditions.push(`name LIKE '%${list.query.name}%'`);
    }
    if (whereConditions.length) {
      whereSegment = ` WHERE ${whereConditions.join(" AND ")} --case-insensitive`;
    }

    const records: any = await sqliteInstance.select(
      `SELECT * FROM dic_stocks${whereSegment}`
    );
    list.records = records.map((item: any) => {
      return new DicStock({
        ...item,
        detail: item.detail ? JSON.parse(item.detail) : {},
        extra: item.extra ? JSON.parse(item.extra) : {},
      });
    });
    list.pagination.total = list.records.length;
  },
  columns: computed(() => [
    // { title: "id", dataIndex: "id", key: "id" },
    // { title: "market", dataIndex: "market", key: "market" },
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      width: 100,
      fixed: "left",
      align: "center",
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 100,
      fixed: "left",
      align: "center",
      ellipsis: true,
    },
    {
      title: "实时价",
      dataIndex: "price",
      key: "price",
      align: "center",
      sorter: (a: any, b: any) => (a.price || 0) - (b.price || 0),
    },
    {
      title: "涨跌",
      dataIndex: "detail.涨跌",
      customRender: ({ record }: any) => {
        const amount = record.detail.涨跌额;
        return (
          <Tag bordered={false} color={amount < 0 ? "green" : "red"}>
            {record.detail.涨跌幅}% ({amount})
          </Tag>
        );
      },
      sorter: (a: any, b: any) => a.detail.涨跌幅 - b.detail.涨跌幅,
    },
    {
      title: "今开",
      dataIndex: "extra.today_begin_price",
      key: "extra.today_begin_price",
      align: "center",
      customRender: ({ record }: any) => {
        const yestoday_end_price = record.extra.yestoday_end_price || 0;
        return (
          <a-tag
            color={record.extra.today_begin_price >= yestoday_end_price ? "red" : "green"}
          >
            {record.extra.today_begin_price}
          </a-tag>
        );
      },
      sorter: (a: any, b: any) =>
        (a.extra.today_begin_price || 0) - (b.extra.today_begin_price || 0),
    },
    {
      title: "昨收",
      dataIndex: "extra.yestoday_end_price",
      key: "extra.yestoday_end_price",
      align: "center",
      customRender: ({ record }: any) => {
        return <Tag>{record.extra.yestoday_end_price}</Tag>;
      },
      sorter: (a: any, b: any) =>
        (a.extra.yestoday_end_price || 0) - (b.extra.yestoday_end_price || 0),
    },
    {
      title: "最高价",
      dataIndex: "detail.最高价",
      customRender: ({ record }: any) => {
        const start = record.detail.昨收;
        const amount = record.detail.最高;
        if (!amount || !start) {
          return "-";
        }
        return (
          <Tag bordered={false}>
            {getPercent(amount, start)}% ({amount})
          </Tag>
        );
      },
      sorter: (a: any, b: any) => {
        // return a.detail.最高 - b.detail.最高
        const start1 = a.detail.昨收;
        const amount1 = a.detail.最高;
        const value1 = start1 && amount1 ? getPercent(amount1, start1) : 0;
        const start2 = b.detail.昨收;
        const amount2 = b.detail.最高;
        const value2 = start2 && amount2 ? getPercent(amount2, start2) : 0;
        return value1 - value2;
      },
    },
    {
      title: "最低价",
      dataIndex: "detail.最低价",
      customRender: ({ record }: any) => {
        const start = record.detail.昨收;
        const amount = record.detail.最低;
        if (!amount || !start) {
          return "-";
        }
        return (
          <Tag bordered={false}>
            {getPercent(amount, start)}% ({amount})
          </Tag>
        );
      },
      sorter: (a: any, b: any) => {
        // return a.detail.最低 - b.detail.最低
        const start1 = a.detail.昨收;
        const amount1 = a.detail.最低;
        const value1 = start1 && amount1 ? getPercent(amount1, start1) : 0;
        const start2 = b.detail.昨收;
        const amount2 = b.detail.最低;
        const value2 = start2 && amount2 ? getPercent(amount2, start2) : 0;
        return value1 - value2;
      },
    },
    {
      title: "市净率",
      dataIndex: "detail.市净率",
      customRender: ({ record }: any) => record.detail.市净率,
      filters: [
        { text: "<=1", value: ([-Infinity, 1] as unknown) as number },
        { text: "1-2", value: ([1, 2] as unknown) as number },
        { text: "2-3", value: ([2, 3] as unknown) as number },
        { text: "3-5", value: ([3, 5] as unknown) as number },
        { text: ">=5", value: ([5, Infinity] as unknown) as number },
      ],
      onFilter: (value: any, record: any) => {
        return record.detail.市净率 >= value[0] && record.detail.市净率 <= value[1];
      },
      sorter: (a: any, b: any) => a.detail.市净率 - b.detail.市净率,
    },
    {
      title: "市盈率(动)",
      dataIndex: "detail.市盈率(动)",
      customRender: ({ record }: any) => record.detail["市盈率-动态"],
      filters: [
        { text: "<=1", value: ([-Infinity, 1] as unknown) as number },
        { text: "1-2", value: ([1, 2] as unknown) as number },
        { text: "2-3", value: ([2, 3] as unknown) as number },
        { text: "3-5", value: ([3, 5] as unknown) as number },
        { text: "5-10", value: ([5, 10] as unknown) as number },
        { text: "10-15", value: ([10, 15] as unknown) as number },
        { text: ">=15", value: ([15, Infinity] as unknown) as number },
      ],
      onFilter: (value: any, record: any) => {
        return (
          record.detail["市盈率-动态"] >= value[0] &&
          record.detail["市盈率-动态"] <= value[1]
        );
      },
      sorter: (a: any, b: any) => a.detail["市盈率-动态"] - b.detail["市盈率-动态"],
    },
    {
      title: "量比",
      dataIndex: "detail.量比",
      customRender: ({ record }: any) => record.detail["量比"],
      filters: [
        { text: "<=1", value: ([-Infinity, 1] as unknown) as number },
        { text: "1-2", value: ([1, 2] as unknown) as number },
        { text: "2-3", value: ([2, 3] as unknown) as number },
        { text: "3-4", value: ([3, 4] as unknown) as number },
        { text: "4-5", value: ([4, 5] as unknown) as number },
        { text: ">=5", value: ([5, Infinity] as unknown) as number },
      ],
      onFilter: (value: any, record: any) => {
        return record.detail.量比 >= value[0] && record.detail.量比 <= value[1];
      },
      sorter: (a: any, b: any) => a.detail.量比 - b.detail.量比,
    },
    {
      title: "换手率",
      dataIndex: "detail.换手率",
      customRender: ({ record }: any) => record.detail["换手率"] + "%",
      filters: [
        { text: "<=1", value: ([-Infinity, 1] as unknown) as number },
        { text: "1-2", value: ([1, 2] as unknown) as number },
        { text: "2-3", value: ([2, 3] as unknown) as number },
        { text: "3-4", value: ([3, 4] as unknown) as number },
        { text: "4-5", value: ([4, 5] as unknown) as number },
        { text: ">=5", value: ([5, Infinity] as unknown) as number },
      ],
      onFilter: (value: any, record: any) => {
        return record.detail.换手率 >= value[0] && record.detail.换手率 <= value[1];
      },
      sorter: (a: any, b: any) => a.detail.换手率 - b.detail.换手率,
    },
    {
      title: "股息",
      dataIndex: "extra.dividend",
      key: "extra.dividend",
      align: "center",
      sorter: (a: any, b: any) => (a.extra.dividend || 0) - (b.extra.dividend || 0),
    },
    {
      title: "股息登记日",
      dataIndex: "extra.dividend_record_at",
      key: "extra.dividend_record_at",
      align: "center",
      sorter: (a: any, b: any) =>
        (a.extra.dividend_record_at || 0) - (b.extra.dividend_record_at || 0),
    },
    {
      title: "5分钟涨幅",
      dataIndex: "detail.5分钟涨跌",
      customRender: ({ record }: any) => record.detail["5分钟涨跌"] + "%",
      sorter: (a: any, b: any) => a.detail["5分钟涨跌"] - b.detail["5分钟涨跌"],
    },
    {
      title: "60日涨幅",
      dataIndex: "detail.60日涨跌幅",
      customRender: ({ record }: any) => record.detail["60日涨跌幅"] + "%",
      sorter: (a: any, b: any) => a.detail["60日涨跌幅"] - b.detail["60日涨跌幅"],
    },
    {
      title: "年初至今涨幅",
      dataIndex: "detail.年初至今涨跌幅",
      customRender: ({ record }: any) => record.detail["年初至今涨跌幅"] + "%",
      sorter: (a: any, b: any) => a.detail["年初至今涨跌幅"] - b.detail["年初至今涨跌幅"],
    },
    {
      title: "总市值 (流通市值)",
      dataIndex: "detail.总市值/流通市值",
      customRender: ({ record }: any) =>
        `${(record.detail["总市值"] / 1e8).toFixed(2)}亿 (${(
          record.detail["流通市值"] / 1e8
        ).toFixed(2)}亿)`,
      filters: [
        { text: "<=50亿", value: ([0, 50 * 1e8] as unknown) as number },
        { text: "50亿-200亿", value: ([50 * 1e8, 200 * 1e8] as unknown) as number },
        { text: "200亿-500亿", value: ([200 * 1e8, 500 * 1e8] as unknown) as number },
        { text: ">=500亿", value: ([500 * 1e8, Infinity] as unknown) as number },
      ],
      onFilter: (value: any, record: any) => {
        return record.detail.总市值 >= value[0] && record.detail.总市值 <= value[1];
      },
      sorter: (a: any, b: any) => a.detail["总市值"] - b.detail["总市值"],
    },
    { title: "价格时间", dataIndex: "price_at", key: "price_at", align: "center" },
  ]),
});
list.onLoad();

const onChange = (pagination: any) => {
  list.pagination = pagination;
  // list.onLoad();
};

function getPercent(a: number, b: number): number {
  return Number((((a - b) / b) * 100).toFixed(2));
}

const dividendRefershedCount = ref(0);
const dividendState = useAsyncState(
  async () => {
    for (const stock of list.records) {
      // if (stock.market !== "A") continue;
      dividendRefershedCount.value += 1;
      try {
        const rData: any = await fetch(
          `http://akshare.frp.zezeping.com/api/public/stock_fhps_detail_em?symbol=${stock.code}`,
          { method: "GET" }
        ).then((response) => response.json());
        // 查找最近日期
        const closestRecord = rData
          .filter((i: any) => i["股权登记日"] && i["现金分红-股息率"])
          .reduce((closest: any, current: any) => {
            if (!closest) return current;
            const closestDate = dayjs(closest["股权登记日"]);
            const currentDate = dayjs(current["股权登记日"]);
            return closestDate.isAfter(currentDate) ? closest : current;
          }, null);
        merge(stock, {
          extra: {
            dividend: closestRecord["现金分红-股息率"],
            dividend_record_at: dayjs(closestRecord["股权登记日"]).toDate().getTime(),
          },
        });
        await stock.save();
      } catch (e) {
        console.log(e);
      }
    }
    dividendRefershedCount.value = 0;
  },
  null,
  { immediate: false }
);
</script>

<template>
  <main>
    <div class="search-bar mb-4">
      <a-form layout="inline" :model="list.query" @finish="() => list.onLoad()">
        <!-- <a-form-item>
          <a-select
            class="!w-[100px]"
            v-model:value="list.query.market"
            :options="market.records"
            show-search
            placeholder="market"
            clearable
          >
          </a-select>
        </a-form-item> -->
        <a-form-item>
          <a-input v-model:value="list.query.code" placeholder="code"></a-input>
        </a-form-item>
        <a-form-item>
          <a-input v-model:value="list.query.name" placeholder="name"></a-input>
        </a-form-item>
        <a-form-item>
          <div class="flex gap-2 items-center">
            <a-button type="primary" html-type="submit" :disabled="list.loading">
              搜索
            </a-button>
            <a-button @click="list.onReset">重置</a-button>
            <a-divider type="vertical"></a-divider>
            <a-button
              :loading="!!dividendRefershedCount"
              @click="() => dividendState.execute()"
              >获取股息({{ dividendRefershedCount }})</a-button
            >
          </div>
        </a-form-item>
      </a-form>
    </div>

    <a-table
      :dataSource="list.records"
      :columns="list.columns"
      :pagination="list.pagination"
      @change="onChange"
      :sticky="{ offsetHeader: 0 }"
      bordered
    >
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'detail.市净率'">
          <a-tooltip>
            <template #title>
              <kbd class="kbd kbd-xs"
                >市净率一般适用于资产密集型行业(如银行、房地产)。</kbd
              >
              <table class="table table-xs">
                <tbody>
                  <tr>
                    <td>市净率<1</td>
                    <td>表明股价低于公司账面价值，可能被低估;</td>
                  </tr>
                  <tr>
                    <td>市净率>1</td>
                    <td>表明股价高于账面价值，表明市场对公司未来增长有较高预期;</td>
                  </tr>
                </tbody>
              </table>
            </template>
            市净率
          </a-tooltip>
        </template>
        <template v-else-if="column.dataIndex === 'detail.市盈率(动)'">
          <a-tooltip>
            <template #title>
              <table class="table table-xs">
                <tbody>
                  <tr>
                    <td>高市盈率</td>
                    <td>表示市场对公司未来增长有较高预期，可能是成长型公司;</td>
                  </tr>
                  <tr>
                    <td>低市盈率</td>
                    <td>表明股价高于账面价值，表明市场对公司未来增长有较高预期;</td>
                  </tr>
                </tbody>
              </table>
            </template>
            市盈率(动)
          </a-tooltip>
        </template>
        <template v-else-if="column.dataIndex === 'detail.量比'">
          <a-tooltip>
            <template #title>
              <table className="table table-xs">
                <tbody>
                  <tr>
                    <td>量比小于0.5</td>
                    <td>冷清状态，交易稀少;</td>
                  </tr>
                  <tr>
                    <td>量比0.5-1</td>
                    <td>成交量较少，观望情绪浓厚;</td>
                  </tr>
                  <tr>
                    <td>量比等于1</td>
                    <td>表示当前成交量与过去平均水平基本一致;</td>
                  </tr>
                  <tr>
                    <td>量比2-3</td>
                    <td>成交量显著放大，需关注市场动向;</td>
                  </tr>
                  <tr>
                    <td>量比大于3</td>
                    <td>异常放量，可能有重大消息或资金进场;</td>
                  </tr>
                </tbody>
              </table>
            </template>
            量比
          </a-tooltip>
        </template>
        <template v-else-if="column.dataIndex === 'detail.换手率'">
          <a-tooltip>
            <template #title>
              <kbd className="kbd kbd-xs"
                >小盘股:
                由于流通股本较少，换手率通常较高。高换手率可能反映资金集中炒作;</kbd
              >
              <kbd className="kbd kbd-xs"
                >大盘股:
                流通股本较多，换手率通常较低。换手率低不代表不活跃，而是由于盘子大成交量被稀释;</kbd
              >
              <kbd className="kbd kbd-xs"
                >新股:
                新股上市初期换手率通常较高，因为有大量资金交易和锁仓股解禁的影响;</kbd
              >
              <table className="table table-xs">
                <tbody>
                  <tr>
                    <td>换手率较低(1%以下)</td>
                    <td>
                      表明股票交易较为冷清，投资者关注度较低，流动性较差;
                      适合长期投资者持有;
                    </td>
                  </tr>
                  <tr>
                    <td>换手率适中(1%-3%)</td>
                    <td>
                      表明市场交易活跃，投资者关注度适中;
                      一般认为换手率在这个区间较为健康;
                    </td>
                  </tr>
                  <tr>
                    <td>换手率较高(3%-7%)</td>
                    <td>
                      表明市场交易非常活跃，投资者热情高涨; 可能预示短期股价波动加剧;
                    </td>
                  </tr>
                  <tr>
                    <td>{`换手率极高(7%以上)`}</td>
                    <td>
                      通常出现在热门股、消息股或大幅波动时;
                      投资者需警惕，可能是资金快进快出造成的短期行情;
                    </td>
                  </tr>
                </tbody>
              </table>
            </template>
            换手率
          </a-tooltip>
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'code'">
          <a-tag>{{ text }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'price'">
          <div v-if="text" class="min-w-[100px]">
            <template v-if="text > record.extra.yestoday_end_price">
              <a-tag color="red">{{ text }}</a-tag>
            </template>
            <template v-else-if="text < record.extra.yestoday_end_price">
              <a-tag color="green">{{ text }}</a-tag>
            </template>
            <template v-else>
              <a-tag>{{ text }}</a-tag>
            </template>
          </div>
        </template>
        <template v-if="column.dataIndex === 'extra.dividend'">
          <a-tag>{{
            record.extra.dividend ? `${(record.extra.dividend * 100).toFixed(2)}%` : ""
          }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'extra.dividend_record_at'">
          {{
            record.extra.dividend_record_at
              ? dayjs(record.extra.dividend_record_at).format("YYYY-MM-DD")
              : ""
          }}
        </template>
        <template v-else-if="column.dataIndex === 'price_at'">
          {{ text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "" }}
        </template>
      </template>
    </a-table>
  </main>
</template>

<style lang="scss" scoped></style>
