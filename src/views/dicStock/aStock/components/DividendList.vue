<script lang="tsx" setup>
import dayjs from "dayjs";
import { DicStock } from "@/model";
const props = defineProps<{
  stock: DicStock;
  rData: Record<string, any>[];
}>();

const columns = [
  {
    title: "报告期",
    dataIndex: "报告期",
    customRender: ({ text }: any) => (text ? dayjs(text).format("YYYY-MM-DD") : ""),
  },
  {
    title: "业绩披露日期",
    dataIndex: "业绩披露日期",
    customRender: ({ text }: any) => (text ? dayjs(text).format("YYYY-MM-DD") : ""),
  },
  {
    title: "送转股份-送转总比例",
    dataIndex: "送转股份-送转总比例",
  },
  {
    title: "送转股份-送股比例",
    dataIndex: "送转股份-送股比例",
  },
  {
    title: "送转股份-转股比例",
    dataIndex: "送转股份-转股比例",
  },
  {
    title: "现金分红-现金分红比例",
    dataIndex: "现金分红-现金分红比例",
  },
  {
    title: "现金分红-现金分红比例描述",
    dataIndex: "现金分红-现金分红比例描述",
  },
  {
    title: "现金分红-股息率",
    dataIndex: "现金分红-股息率",
  },
  {
    title: "每股收益",
    dataIndex: "每股收益",
  },
  {
    title: "每股净资产",
    dataIndex: "每股净资产",
  },
  {
    title: "每股公积金",
    dataIndex: "每股公积金",
  },
  {
    title: "每股未分配利润",
    dataIndex: "每股未分配利润",
  },
  {
    title: "净利润同比增长",
    dataIndex: "净利润同比增长",
  },
  {
    title: "总股本",
    dataIndex: "总股本",
  },
  {
    title: "预案公告日",
    dataIndex: "预案公告日",
    customRender: ({ text }: any) => (text ? dayjs(text).format("YYYY-MM-DD") : ""),
  },
  {
    title: "股权登记日",
    dataIndex: "股权登记日",
    customRender: ({ text }: any) => (text ? dayjs(text).format("YYYY-MM-DD") : ""),
  },
  {
    title: "除权除息日",
    dataIndex: "除权除息日",
    customRender: ({ text }: any) => (text ? dayjs(text).format("YYYY-MM-DD") : ""),
  },
  {
    title: "方案进度",
    dataIndex: "方案进度",
  },
  {
    title: "最新公告日期",
    dataIndex: "最新公告日期",
    customRender: ({ text }: any) => (text ? dayjs(text).format("YYYY-MM-DD") : ""),
  },
];
</script>

<template>
  <a-table :columns="columns" :data-source="rData" bordered></a-table>
</template>

<style lang="scss" scoped></style>
