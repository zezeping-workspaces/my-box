<script lang="tsx" setup>
import { computed, createVNode, defineAsyncComponent } from "vue";
import { DicStock } from "@/model";
import { useSqliteList } from "@/hooks/useSqliteList";
import { getSqliteInstance } from "@/services/sqlite";
import { useModal } from "@/hooks/useModal";
import { notification } from "ant-design-vue";
import { usePublicData } from "@/hooks/usePublicData";
import dayjs from "dayjs";

const sqliteInstance = getSqliteInstance();
const modal = useModal();
const market = usePublicData("/data/markets.json");
const list = useSqliteList({
  query: {},
  onLoad: async () => {
    let whereConditions = [];
    let whereSegment = "";

    if (list.query.market) {
      whereConditions.push(`market = '${list.query.market}'`);
    }
    if (list.query.code) {
      whereConditions.push(`code LIKE '%${list.query.code}%'`);
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
  },
  columns: [
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
    { title: "价格时间", dataIndex: "price_at", key: "price_at", align: "center" },
  ],
});
list.onLoad();

const onChange = (pagination: any) => {
  list.pagination = pagination;
  list.onLoad();
};

function getPercent(a: number, b: number) {
  return (((a - b) / b) * 100).toFixed(2);
}

const partialRecords = computed(() => {
  return list.records.slice(0, 300);
});
</script>

<template>
  <main class="min-w-[1000px] p-4">
    <div class="search-bar mb-4">
      <a-form layout="inline" :model="list.query" @finish="() => list.onLoad()">
        <a-form-item>
          <a-select
            class="!w-[100px]"
            v-model:value="list.query.market"
            :options="market.records"
            show-search
            placeholder="market"
            clearable
          >
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-input v-model:value="list.query.code" placeholder="code"></a-input>
        </a-form-item>
        <a-form-item>
          <div class="flex gap-2 items-center">
            <a-button type="primary" html-type="submit" :disabled="list.loading">
              搜索
            </a-button>
            <a-button @click="list.onReset">重置</a-button>
            <a-divider type="vertical"></a-divider>
          </div>
        </a-form-item>
      </a-form>
    </div>

    <a-table
      :dataSource="partialRecords"
      :columns="list.columns"
      :pagination="false"
      @change="onChange"
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
        <template v-else-if="column.dataIndex === 'price_at'">
          {{ text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "" }}
        </template>
      </template>
    </a-table>
  </main>
</template>

<style lang="scss" scoped></style>
