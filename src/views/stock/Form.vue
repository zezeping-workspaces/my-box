<script lang="tsx" setup>
import { useForm } from "@/hooks/useForm";
import { getSqliteInstance } from "@/services/sqlite";
import { notification } from "ant-design-vue";
import { usePublicData } from "@/hooks/usePublicData";
import { fetchStocksApi } from "@/api";
import { AStockApi } from "@/api/StockApi";
import { watch } from "vue";

AStockApi.fetchStocksApi(["000625", "600519"]).then((list) => {
  console.log(list);
});

const props = defineProps({
  record: Object,
});
const emit = defineEmits(["submit"]);

const sqliteInstance = getSqliteInstance();
const market = usePublicData("/data/markets.json");
const form = useForm({
  model: {
    ...props.record,
  },
  onSubmit: async () => {
    const model = form.model;
    const {
      market,
      code,
      name,
      price,
      price_at,
      today_begin_price,
      yestoday_end_price,
      notice_lower_price,
      notice_higher_price,
      remark = "",
    } = model;
    let sql = `INSERT INTO stocks(market, code, name, price, price_at, today_begin_price, yestoday_end_price, notice_lower_price, notice_higher_price, remark) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;
    let sqlData = [
      market,
      code,
      name,
      price,
      price_at,
      today_begin_price,
      yestoday_end_price,
      notice_lower_price,
      notice_higher_price,
      remark,
    ];
    if (props.record) {
      sql = `UPDATE stocks set notice_lower_price = $1, notice_higher_price = $2, remark = $3, updated_at = datetime('now', 'localtime') where id = ${props.record.id}`;
      sqlData = [notice_lower_price, notice_higher_price, remark];
    }
    try {
      await sqliteInstance.execute(sql, sqlData);
      emit("submit");
    } catch (error) {
      notification.error({
        message: "错误",
        description: error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  },
});

const onQueryCode = async (marketValue: string, code: string) => {
  const marketLabel = market.getLabelFromValue(marketValue);
  if (!marketLabel || !code) return;

  let stock = null;
  if (marketLabel === "A股") {
    const stocks = await AStockApi.fetchStocksApi([code]);
    stock = stocks?.[0];
  }
  if (!stock) {
    const { data: rData } = await fetchStocksApi(marketLabel, [code]);
    stock = rData?.data?.stocks?.[0];
  }
  Object.assign(form.model, {
    name: stock?.name,
    price: stock?.price,
    price_at: stock?.updateTime,
    today_begin_price: stock?.detail?.["open_price"],
    yestoday_end_price: stock?.detail?.["close_price"],
  });
};

watch(
  () => [market.records, form.model.market, form.model.code],
  () => {
    onQueryCode(form.model.market, form.model.code);
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <main>
    <a-form :model="form.model" v-bind="{ ...form.layout }" @finish="form.onSubmit">
      <a-form-item
        label="market"
        name="market"
        :rules="{ required: true, message: 'market is required' }"
      >
        <!-- <a-input
          v-model:value="form.model.market"
          placeholder="market"
          clearable
        ></a-input> -->
        <a-select
          v-model:value="form.model.market"
          :options="market.records"
          show-search
          clearable
          placeholder="market is required"
        >
        </a-select>
      </a-form-item>
      <a-form-item
        label="code"
        name="code"
        :rules="{ required: true, message: 'code is required' }"
      >
        <a-input
          v-model:value="form.model.code"
          placeholder="code"
          clearable
          :disabled="!form.model.market"
          @blur="() => onQueryCode(form.model.market, form.model.code)"
        ></a-input>
      </a-form-item>
      <a-form-item
        label="名称"
        name="name"
        :rules="{ required: true, message: '名称 is required' }"
      >
        <a-input v-model:value="form.model.name" placeholder="名称" disabled></a-input>
      </a-form-item>
      <a-form-item
        label="价格"
        name="price"
        :rules="{ required: true, message: 'price is required' }"
      >
        <a-input-number
          class="!min-w-[200px]"
          v-model:value="form.model.price"
          :min="0"
          :step="0.001"
          :string-mode="false"
          placeholder="价格"
          disabled
        />
      </a-form-item>
      <a-form-item label="低价告警" name="notice_lower_price">
        <a-input-number
          class="!min-w-[200px]"
          v-model:value="form.model.notice_lower_price"
          :min="0"
          :step="0.001"
          :string-mode="false"
          placeholder="低价告警"
        />
      </a-form-item>
      <a-form-item label="高价告警" name="notice_higher_price">
        <a-input-number
          class="!min-w-[200px]"
          v-model:value="form.model.notice_higher_price"
          :min="0"
          :step="0.001"
          :string-mode="false"
          placeholder="高价告警"
        />
      </a-form-item>
      <a-form-item label="remark" name="remark">
        <a-textarea v-model:value="form.model.remark" placeholder="remark"></a-textarea>
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 12, offset: 4 }">
        <a-button type="primary" html-type="submit">提交</a-button>
        <a-button style="margin-left: 10px" @click="form.onCancel">取消</a-button>
      </a-form-item>
    </a-form>
  </main>
</template>

<style lang="scss" scoped></style>
