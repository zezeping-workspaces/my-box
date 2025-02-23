<script lang="tsx" setup>
import { computed } from "vue";
import { useTheme } from "@/hooks/useTheme";
const { persistedTheme, setTheme } = useTheme();

const currentTheme = computed({
  get: () => persistedTheme.value,
  set: (value) => {
    setTheme(value);
  },
});
</script>

<template>
  <form class="[grid-area:main]" @submit.prevent>
    <div class="form-item flex gap-2">
      <!-- title -->
      <label class="form-item-title font-bold">主题:</label>
      <div class="form-item-content flex gap-2">
        <label
          ><input
            type="radio"
            name="theme"
            value="system"
            v-model="currentTheme"
          />自动</label
        >
        <label
          ><input
            type="radio"
            name="theme"
            value="dark"
            v-model="currentTheme"
          />暗黑</label
        >
        <label
          ><input
            type="radio"
            name="theme"
            value="light"
            v-model="currentTheme"
          />明亮</label
        >
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped></style>
