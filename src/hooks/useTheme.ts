import type { Ref } from "vue";
import { ref, /*watchEffect, */onMounted, onUnmounted } from "vue";

type Theme = "light" | "dark";

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
let storedTheme = localStorage.getItem("theme") as Theme | null;
export function useTheme(): { theme: Ref<Theme>; setTheme: (newTheme: Theme) => void } {
	const theme = ref<Theme>(storedTheme || (prefersDark.matches ? "dark" : "light"));

	const setTheme = (newTheme: Theme | 'system', persist = true) => {
		theme.value = newTheme === "system" ? (prefersDark.matches ? "dark" : "light") : newTheme;
		if (persist) {
			localStorage.setItem("theme", newTheme);
			storedTheme = theme.value;
		}
		document.documentElement.classList.toggle("dark", newTheme === "dark");
	};

	// 监听系统主题变化
	const syncSystemTheme = () => {
		if (!localStorage.getItem("theme") && !storedTheme) {
			setTheme(prefersDark.matches ? "dark" : "light", false);
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

	return { theme, setTheme };
}