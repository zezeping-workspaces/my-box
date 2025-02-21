<script lang="tsx" setup>
import { createVNode, defineAsyncComponent, ref } from "vue";
import { useSqliteList } from "@/hooks/useSqliteList";
import { getSqliteInstance } from "@/services/sqlite";
import { useModal } from "@/hooks/useModal";
import { notification } from "ant-design-vue";

const sqliteInstance = getSqliteInstance();
const modal = useModal();
const tagOptions = ref([]);
const list = useSqliteList({
  onLoad: async () => {
    const limit = list.pagination.pageSize;
    const offset = (list.pagination.current - 1) * list.pagination.pageSize;
    let whereConditions = [];
    let whereSegment = "";

    if (list.query.tag) {
      whereConditions.push(`tag = ${list.query.tag}`);
    }
    if (list.query.code) {
      whereConditions.push(`code LIKE '%${list.query.code}%'`);
    }
    if (whereConditions.length) {
      whereSegment = ` WHERE ${whereConditions.join(" AND ")} --case-insensitive`;
    }

    const records: any = await sqliteInstance.select(
      `SELECT * FROM snippets${whereSegment} limit ${limit} offset ${offset};`
    );
    const totalValue = await sqliteInstance.select(
      `select COUNT(*) as count from snippets${whereSegment};`
    );
    const tags: any = await sqliteInstance.select(`SELECT DISTINCT tag FROM snippets;`);
    if (Array.isArray(totalValue) && totalValue.length) {
      list.pagination.total = totalValue[0].count;
    }

    console.log(4, tags);
    list.records = records;
    tagOptions.value = tags.map((item: any) => ({ label: item.tag, value: item.tag }));
    console.log(5, tagOptions.value);
  },
  columns: [
    { title: "id", dataIndex: "id", key: "id" },
    { title: "tag", dataIndex: "tag", key: "tag" },
    { title: "code", dataIndex: "code", key: "code" },
    { title: "content", dataIndex: "content", key: "content", ellipsis: true },
    { title: "remark", dataIndex: "remark", key: "remark", ellipsis: true },
    { title: "created_at", dataIndex: "created_at", key: "created_at" },
    { title: "updated_at", dataIndex: "updated_at", key: "updated_at" },
    { title: "operation", dataIndex: "operation" },
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
    .execute(`DELETE FROM snippets where id = $1;`, [record.id])
    .catch((e) => {
      notification.error({
        message: "错误",
        description: `${e}`,
      });
    });
  list.onLoad();
};
</script>

<template>
  <main class="p-4">
    <div class="search-bar mb-4">
      <a-form layout="inline" :model="list.query" @finish="() => list.onLoad()">
        <a-form-item>
          <a-select
            class="!w-[100px]"
            v-model:value="list.query.tag"
            :loading="list.loading"
            :options="tagOptions"
            show-search
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
        <template v-if="column.dataIndex === 'tag'">
          <a-tag>{{ text }}</a-tag>
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
