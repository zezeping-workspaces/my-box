<script lang="tsx" setup>
import { ref, computed } from "vue";
import { useAsyncState } from "@vueuse/core";
import { DicStock } from "@/model";
import { useSqliteList } from "@/hooks/useSqliteList";
import { getSqliteInstance } from "@/services/sqlite";
// import { usePublicData } from "@/hooks/usePublicData";
import dayjs from "dayjs";
import { fetch } from "@tauri-apps/plugin-http";
import { merge } from "lodash-es";

const sqliteInstance = getSqliteInstance();
// const market = usePublicData("/data/markets.json");
const list = useSqliteList({
  query: { market: "ETF" },
  onLoad: async () => {
    let whereConditions = [];
    let whereSegment = "";

    // if (list.query.market) {
    //   whereConditions.push(`market = '${list.query.market}'`);
    // }
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
    { title: "code", dataIndex: "code", key: "code", fixed: "left", align: "center" },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      align: "center",
      ellipsis: true,
    },
    { title: "价格", dataIndex: "price", key: "price", align: "center" },
    {
      title: "今开",
      dataIndex: "extra.today_begin_price",
      key: "extra.today_begin_price",
      align: "center",
    },
    {
      title: "昨收",
      dataIndex: "extra.yestoday_end_price",
      key: "extra.yestoday_end_price",
      align: "center",
    },
    {
      title: "股息",
      dataIndex: "extra.dividend",
      key: "extra.dividend",
      align: "center",
    },
    {
      title: "股息登记日",
      dataIndex: "extra.dividend_record_at",
      key: "extra.dividend_record_at",
      align: "center",
    },
    { title: "价格时间", dataIndex: "price_at", key: "price_at", align: "center" },
  ]),
});
list.onLoad();

const onChange = (pagination: any) => {
  list.pagination = pagination;
  // list.onLoad();
};

function getPercent(a: number, b: number) {
  return (((a - b) / b) * 100).toFixed(2);
}
const dividendRefershedCount = ref(0);
const dividendState = useAsyncState(
  async () => {
    for (const stock of list.records) {
      if (stock.market !== "A") continue;
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
  <main class="min-w-[1000px]">
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
    >
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
            <span>{{ getPercent(text, record.extra.yestoday_end_price) }}%</span>
          </div>
        </template>
        <template v-if="column.dataIndex === 'extra.today_begin_price'">
          <div v-if="record.extra.today_begin_price" class="min-w-[100px]">
            <template
              v-if="record.extra.today_begin_price > record.extra.yestoday_end_price"
            >
              <a-tag color="red">{{ record.extra.today_begin_price }}</a-tag>
            </template>
            <template
              v-else-if="record.extra.today_begin_price < record.extra.yestoday_end_price"
            >
              <a-tag color="green">{{ record.extra.today_begin_price }}</a-tag>
            </template>
            <template v-else>
              <a-tag>{{ record.extra.today_begin_price }}</a-tag>
            </template>
            <span
              >{{
                getPercent(
                  record.extra.today_begin_price,
                  record.extra.yestoday_end_price
                )
              }}%</span
            >
          </div>
        </template>
        <template v-if="column.dataIndex === 'extra.yestoday_end_price'">
          <a-tag>{{ record.extra.yestoday_end_price }}</a-tag>
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
