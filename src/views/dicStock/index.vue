<script lang="tsx" setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const stockType = computed({
  get: () => route.name,
  set: (value) => {
    router.push({ name: value });
  },
});
</script>

<template>
  <main class="h-full grid grid-rows-[auto_1fr]">
    <a-radio-group class="stock-type !mb-4" v-model:value="stockType" button-style="solid">
      <a-radio-button value="dicStock/aStock">A股</a-radio-button>
      <a-radio-button value="dicStock/etfStock">EFT基金</a-radio-button>
    </a-radio-group>
    <div class="stock-type-page">
      <router-view></router-view>
    </div>
  </main>
</template>

<style lang="scss" scoped></style>
