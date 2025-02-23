<script lang="tsx" setup>
import { computedAsync } from '@vueuse/core'
import { appLocalDataDir } from "@tauri-apps/api/path";

const dbPath = computedAsync(async () => {
  const appLocalDataPath = await appLocalDataDir();
  return `${appLocalDataPath}/data.db`;  
})
</script>

<template>
  <a-descriptions bordered title="Info">
    <a-descriptions-item label="数据库路径">{{ dbPath }}</a-descriptions-item>
  </a-descriptions>
</template>

<style lang="scss" scoped></style>
