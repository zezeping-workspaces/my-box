<script lang="tsx" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useTheme } from "@/hooks/useTheme";
import Information from "./Information.vue";

const { persistedTheme, theme } = useTheme();
const route = useRoute();

const menus = computed(() => [
  {
    title: "基本配置",
    path: "/preferences/base",
    active: route.path === "/preferences/base",
  },
]);
</script>

<template>
  <main class="grid">
    <div class="[grid-area:header]"></div>
    <ul class="[grid-area:aside] menus">
      <template v-for="menu in menus" :key="menu.path">
        <li
          class="menu-item text-center text-xl font-bold"
          :class="{ active: menu.active }"
        >
          <router-link :to="menu.path">{{ menu.title }}</router-link>
        </li>
      </template>
    </ul>
    <div class="[grid-area:main]">
      <router-view></router-view>
      <Information></Information>
    </div>
    <div class="[grid-area:footer]">
      <div>persistedTheme: {{ persistedTheme }}, theme: {{ theme }}</div>
      <router-link to="/">Home</router-link>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.grid {
  grid-template-areas: "header header" "aside main" "footer footer";
  grid-template-columns: minmax(150px, 1fr) 5fr;
  grid-template-rows: auto 1fr auto;
}

.menus {
  .menu-item {
    &.active {
      color: var(--color-primary);
    }
  }
}
</style>
