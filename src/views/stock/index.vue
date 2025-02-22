<script lang="tsx" setup>
import { createVNode, defineAsyncComponent } from "vue";
import { useSqliteList } from "@/hooks/useSqliteList";
import { getSqliteInstance } from "@/services/sqlite";
import { useModal } from "@/hooks/useModal";
import { notification } from "ant-design-vue";
import { usePublicData } from "@/hooks/usePublicData";
import dayjs from "dayjs";
import { max } from "rxjs";

const sqliteInstance = getSqliteInstance();
const modal = useModal();
const market = usePublicData("/data/markets.json");
const list = useSqliteList({
  query: {},
  onLoad: async () => {
    const limit = list.pagination.pageSize;
    const offset = (list.pagination.current - 1) * list.pagination.pageSize;
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
      `SELECT * FROM stocks${whereSegment} limit ${limit} offset ${offset};`
    );
    const totalValue = await sqliteInstance.select(
      `select COUNT(*) as count from stocks${whereSegment};`
    );
    if (Array.isArray(totalValue) && totalValue.length) {
      list.pagination.total = totalValue[0].count;
    }

    list.records = records;
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
      dataIndex: "today_begin_price",
      key: "today_begin_price",
      align: "center",
    },
    {
      title: "昨收",
      dataIndex: "yestoday_end_price",
      key: "yestoday_end_price",
      align: "center",
    },
    {
      title: "低价告警",
      dataIndex: "notice_lower_price",
      key: "notice_lower_price",
      align: "center",
    },
    {
      title: "高价告警",
      dataIndex: "notice_higher_price",
      key: "notice_higher_price",
      align: "center",
    },
    {
      title: "告警开关",
      dataIndex: "notice_enabled",
      key: "notice_enabled",
      align: "center",
    },
    {
      title: "remark",
      dataIndex: "remark",
      key: "remark",
      responsive: ["xl"],
      align: "center",
      ellipsis: true,
    },
    { title: "价格时间", dataIndex: "price_at", key: "price_at", align: "center" },
    { title: "创建时间", dataIndex: "created_at", key: "created_at", responsive: ["xl"] },
    { title: "更新时间", dataIndex: "updated_at", key: "updated_at", responsive: ["xl"] },
    { title: "操作", dataIndex: "operation" },
  ],
});
list.onLoad();

const onChange = (pagination: any) => {
  list.pagination = pagination;
  list.onLoad();
};

const onCreate = () => {
  const instance = modal.create({
    title: "新增",
    onCancel: () => {},
    onOk: () => {},
    slots: {
      default: () =>
        createVNode(
          defineAsyncComponent(() => import("./Form.vue")),
          {
            onSubmit: async () => {
              instance.close();
              await list.onLoad();
            },
          }
        ),
    },
  });
};

const onUpdated = (record: Record<string, any>) => {
  const instance = modal.create({
    title: "编辑",
    slots: {
      default: () =>
        createVNode(
          defineAsyncComponent(() => import("./Form.vue")),
          {
            record,
            onSubmit: async () => {
              instance.close();
              await list.onLoad();
            },
          }
        ),
    },
  });
};

const onDelete = async (record: Record<string, any>) => {
  await sqliteInstance
    .execute(`DELETE FROM stocks where id = $1;`, [record.id])
    .catch((e) => {
      notification.error({
        message: "错误",
        description: `${e}`,
      });
    });
  list.onLoad();
};

const onNoticeEnabled = async (checked: boolean, record: Record<string, any>) => {
  await sqliteInstance
    .execute(`UPDATE stocks set notice_enabled = $1 where id = $2;`, [checked, record.id])
    .catch((e) => {
      notification.error({
        message: "错误",
        description: `${e}`,
      });
    });
  list.onLoad();
  if (checked && (!record.notice_lower_price || !record.notice_higher_price)) {
    notification.warning({
      message: "警告",
      description: `请先设置告警价格才能生效`,
    });
  }
};

function getPercent(a: number, b: number) {
  return (((a - b) / b) * 100).toFixed(2);
}
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
            <a-button @click="onCreate">新增</a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>

    <a-table
      :dataSource="list.records"
      :columns="list.columns"
      :pagination="list.pagination"
      @change="onChange"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'code'">
          <a-tag>{{ text }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'price'">
          <div v-if="text" class="min-w-[100px]">
            <template v-if="text > record.yestoday_end_price">
              <a-tag color="red">{{ text }}</a-tag>
            </template>
            <template v-else-if="text < record.yestoday_end_price">
              <a-tag color="green">{{ text }}</a-tag>
            </template>
            <template v-else>
              <a-tag>{{ text }}</a-tag>
            </template>
            <span>{{ getPercent(text, record.yestoday_end_price) }}%</span>
          </div>
        </template>
        <template v-if="column.dataIndex === 'today_begin_price'">
          <div v-if="text" class="min-w-[100px]">
            <template v-if="text > record.yestoday_end_price">
              <a-tag color="red">{{ text }}</a-tag>
            </template>
            <template v-else-if="text < record.yestoday_end_price">
              <a-tag color="green">{{ text }}</a-tag>
            </template>
            <template v-else>
              <a-tag>{{ text }}</a-tag>
            </template>
            <span>{{ getPercent(text, record.yestoday_end_price) }}%</span>
          </div>
        </template>
        <template v-if="column.dataIndex === 'yestoday_end_price'">
          <a-tag>{{ text }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'notice_lower_price'">
          <div v-if="text" class="min-w-[100px]">
            <template v-if="record.price > text">
              <a-tag color="red">{{ text }}</a-tag>
            </template>
            <template v-else-if="record.price < text">
              <a-tag color="green">{{ text }}</a-tag>
            </template>
            <template v-else>
              <a-tag>{{ text }}</a-tag>
            </template>
            <span>{{ getPercent(record.price, text) }}%</span>
          </div>
        </template>
        <template v-if="column.dataIndex === 'notice_higher_price'">
          <div v-if="text" class="min-w-[100px]">
            <template v-if="record.price > text">
              <a-tag color="red">{{ text }}</a-tag>
            </template>
            <template v-else-if="record.price < text">
              <a-tag color="green">{{ text }}</a-tag>
            </template>
            <template v-else>
              <a-tag>{{ text }}</a-tag>
            </template>
            <span>{{ getPercent(record.price, text) }}%</span>
          </div>
        </template>
        <template v-if="column.dataIndex === 'notice_enabled'">
          <a-switch
            checked-children="开"
            un-checked-children="关"
            :checked-value="1"
            :un-checked-value="0"
            v-model:checked="record.notice_enabled"
            @change="(checked: boolean) => onNoticeEnabled(checked, record)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'price_at'">
          {{ text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "" }}
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <a-button type="text" @click="onUpdated(record)">编辑</a-button>
          <a-popconfirm title="确认删除?" @confirm="onDelete(record)">
            <a-button danger type="text">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </main>
</template>

<style lang="scss" scoped></style>
