<script lang="tsx" setup>
import { theme as antdTheme } from "ant-design-vue";
import { useTheme } from "@/hooks/useTheme";
// import WindowTitle from "./WindowTitle.vue";
import Header from "./Header/index.vue";

const { theme } = useTheme();
</script>

<template>
  <a-config-provider
    :theme="{
      algorithm: [
        antdTheme.compactAlgorithm,
        theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      ],
    }"
  >
    <main class="layout container mx-auto h-full grid grid-rows-[auto_1fr]">
      <!-- <div class="layout-top-fixed-header fixed top-0 left-0 right-0">
        <WindowTitle></WindowTitle>
      </div> -->
      <Header class="layout-header"></Header>
      <div class="layout-body">
        <slot></slot>
      </div>
    </main>
  </a-config-provider>
</template>

<style lang="scss" scoped></style>
