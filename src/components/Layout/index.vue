<script lang="tsx" setup>
import { theme as antdTheme } from "ant-design-vue";
import { useTheme } from "@/hooks/useTheme";
// import WindowTitle from "./WindowTitle.vue";

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
      <div class="layout-header">
        <!-- <WindowTitle></WindowTitle> -->
      </div>
      <div class="layout-body">
        <slot></slot>
      </div>
    </main>
  </a-config-provider>
</template>

<style lang="scss" scoped></style>
