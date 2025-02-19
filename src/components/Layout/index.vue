<script lang="tsx" setup>
import { theme as antdTheme } from "ant-design-vue";
import { useTheme } from "@/hooks/useTheme";
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
    <main class="layout container mx-auto">
      <slot></slot>
      <div>{{ theme }}</div>
    </main>
  </a-config-provider>
</template>

<style lang="scss" scoped></style>
