<script lang="tsx" setup>
import { useForm } from "@/hooks/useForm";
import { getSqliteInstance } from "@/services/sqlite";
import { notification } from "ant-design-vue";

const props = defineProps({
  record: Object,
});
const emit = defineEmits(["submit"]);

const sqliteInstance = getSqliteInstance();
const form = useForm({
  model: {
    ...props.record,
  },
  onSubmit: async () => {
    const model = form.model;
    const { tag = "", code = "", content = "", remark = "" } = model;
    let sql = `INSERT INTO snippets(tag, code, content, remark) values($1, $2, $3, $4)`;
    if (props.record) {
      sql = `UPDATE snippets set tag = $1, code = $2, content = $3, remark = $4, updated_at = datetime('now', 'localtime') where id = ${props.record.id}`;
    }
    try {
      await sqliteInstance.execute(sql, [tag, code, content, remark]);
      emit("submit");
    } catch (error) {
      notification.error({
        message: "错误",
        description: error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  },
});
</script>

<template>
  <main>
    <a-form :model="form.model" v-bind="{ ...form.layout }" @finish="form.onSubmit">
      <a-form-item
        label="tag"
        name="tag"
        :rules="{ required: true, message: 'tag is required' }"
      >
        <a-input
          v-model:value.trim="form.model.tag"
          placeholder="tag"
          clearable
        ></a-input>
      </a-form-item>
      <a-form-item
        label="code"
        name="code"
        :rules="{ required: true, message: 'code is required' }"
      >
        <a-input
          v-model:value.trim="form.model.code"
          placeholder="code"
          clearable
        ></a-input>
      </a-form-item>
      <a-form-item
        label="content"
        name="content"
        :rules="{ required: true, message: 'content is required' }"
      >
        <a-textarea v-model:value="form.model.content" placeholder="content"></a-textarea>
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
