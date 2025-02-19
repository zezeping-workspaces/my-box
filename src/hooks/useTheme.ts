import type { ComputedRef, Ref } from "vue";
import { computed, /*watchEffect, */onMounted, onUnmounted } from "vue";
import { useStorage } from '@vueuse/core'

const USE_STORAGE_THEME = `use_storage_theme`
type Theme = "light" | "dark" | "system";

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
let storedTheme = useStorage(USE_STORAGE_THEME, 'system', localStorage) as Ref<Theme>
export function useTheme(): { theme: ComputedRef<Theme>; persistedTheme: Ref<Theme>; setTheme: (newTheme: Theme) => void } {
	// const theme = ref<Theme>(storedTheme.value || (prefersDark.matches ? "dark" : "light"));
	const theme = computed(() => ['light', 'dark'].includes(storedTheme.value) ? storedTheme.value : (prefersDark.matches ? "dark" : "light"))
	const persistedTheme = computed(() => `${storedTheme.value}`.split('@')[0] as Theme)

	const setTheme = (newTheme: Theme) => {
		storedTheme.value = newTheme === 'system' ? `system@${Date.now()}` as any : newTheme;
		document.documentElement.classList.toggle("dark", newTheme === "system" ? prefersDark.matches : newTheme === "dark");
	};

	// 监听系统主题变化
	const syncSystemTheme = () => {
		if (!['light', 'dark'].includes(storedTheme.value)) {
			setTheme('system');
		}
	};

	onMounted(() => {
		prefersDark.addEventListener("change", syncSystemTheme);
		syncSystemTheme();
	});

	onUnmounted(() => {
		prefersDark.removeEventListener("change", syncSystemTheme);
	});

	// watchEffect(() => {
	// 	setTheme(theme.value);
	// });

	return { theme, persistedTheme, setTheme };
}