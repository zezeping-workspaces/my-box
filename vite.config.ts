import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from '@vitejs/plugin-vue-jsx'
import tailwindcss from '@tailwindcss/vite'
import chroma from 'chroma-js';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [oklchToRgbPlugin(), tailwindcss(), vue(), vueJsx()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  }
}));


function oklchToRgbPlugin() {
  return {
    name: 'vite-plugin-oklch-to-rgb',
    transform(code: string, id: string) {
      if (/\.css$/.test(id)) {
        const regex = /oklch\(([^)]+)\)/g;
        let matches = null;
        while ((matches = regex.exec(code)) !== null) {
          const oklchValue = matches[0];
          const [l, c, h] = matches[1].split(' ').map(Number);
          const rgb = chroma.oklch(l, c, h).rgb(); // 将 oklch 转换为 rgb
          const rgbString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
          code = code.replace(oklchValue, rgbString);
        }
      }
      return {
        code,
        map: null,
      };
    },
  };
}