<script lang="tsx" setup>
import { ref, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import Fuse from "fuse.js";
export interface AppSearchItem {
  app?: string;
  title: string;
  description: string;
  url: string;
  icon?: string;
  tags?: string[];
}
const initialSearchItems: AppSearchItem[] = [
  { title: "Snippet", description: "代码段", url: "/snippet" },
  { title: "DicStock", description: "股票字典", url: "/dicStock" },
  { title: "Stock", description: "股票", url: "/stock" },
];
const fuse = new Fuse(initialSearchItems, {
  includeScore: true,
  includeMatches: true,
  threshold: 0.6,
  minMatchCharLength: 2,
  keys: ["title", "description", "tags"],
});

const router = useRouter();
const open = ref<boolean>(false);
const searchText = ref<string>("");
const searchItems = computed(() => {
  if (!searchText.value) return initialSearchItems;
  return fuse.search(searchText.value).map((result) => result.item);
});
const selectedItem = ref<AppSearchItem | null>(null);
const escapeRegExp = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 反斜杠转义
};
const onHighlightMatch = (text: string) => {
  const regex = searchText.value
    ? new RegExp(`(${escapeRegExp(searchText.value)})`, "gi")
    : "";
  return text.split(regex).map((part) =>
    part.toLowerCase() === searchText.value.toLowerCase()
      ? `<span class="text-gray-600 font-bold bg-yellow-200 rounded">
          ${part}
        </span>`
      : part
  );
};

const onSelectItem = (selectedItem: any) => {
  router.push(selectedItem.url);
  open.value = false;
};
const onKeyDown = (event: KeyboardEvent) => {
  // 检测操作系统并判断是否按下 Command (Mac) 或 Ctrl (Windows/Linux) + K
  if ((event.metaKey && event.key === "k") || (event.ctrlKey && event.key === "k")) {
    event.preventDefault(); // 防止默认行为
    open.value = !open.value;
  } else if (event.key === "ArrowUp") {
    const index = searchItems.value.findIndex(
      (item) => item.url === selectedItem.value?.url
    );
    selectedItem.value =
      searchItems.value[
        (index - 1 + searchItems.value.length) % searchItems.value.length
      ];
  } else if (event.key === "ArrowDown") {
    const index = searchItems.value.findIndex(
      (item) => item.url === selectedItem.value?.url
    );
    selectedItem.value = searchItems.value[(index + 1) % searchItems.value.length];
  } else if (event.key === "Enter") {
    if (selectedItem.value) {
      onSelectItem(selectedItem.value);
    }
  }
};
document.addEventListener("keydown", onKeyDown);
onUnmounted(() => {
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <a-modal
    v-model:open="open"
    title="搜索"
    width="80%"
    :footer="null"
    :maskClosable="false"
  >
    <a-input size="large" v-model:value="searchText" placeholder="搜索" autoFocus />
    <!-- 搜索结果 -->
    <div className="flex-1 flex flex-col gap-2 pt-2 overflow-auto">
      <template v-for="item in searchItems" :key="item.url">
        <router-link :to="item.url">
          <a-card
            class="card w-full px-4 py-2 cursor-pointer"
            :class="{
              active: selectedItem?.url === item.url,
            }"
            @mouseover="selectedItem = item"
            @click="onSelectItem(item)"
          >
            <div class="flex items-center justify-between">
              <h3
                class="text-base font-semibold mb-1"
                v-html="onHighlightMatch(item.title).join('')"
              ></h3>
              <span v-if="item.app" className="badge badge-primary badge-sm">
                {item.app}
              </span>
            </div>
            <p
              className="text-sm mb-2"
              v-html="onHighlightMatch(item.description).join('')"
            ></p>
            <div v-if="item.tags?.length" className="flex flex-wrap gap-1">
              <template v-for="tag in item.tags" :key="tag">
                <span
                  className="badge badge-outline badge-sm"
                  v-html="onHighlightMatch(tag).join('')"
                >
                </span>
              </template>
            </div>
          </a-card>
        </router-link>
      </template>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.card {
  &.active {
    filter: invert(20%);
  }
}
</style>
