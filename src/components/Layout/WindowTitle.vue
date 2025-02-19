<script lang="tsx" setup>
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();
const onMinimize = async () => {
    appWindow.minimize();
}

const onToggleMaximize = async () => {
    appWindow.toggleMaximize();
}

const onClose = async () => {
    appWindow.hide();
}

const onStartDrag = async (event: MouseEvent) => {
    if (event.button === 0) { // 左键拖动
        appWindow.startDragging();
        // cursor
        document.body.style.cursor = 'move';
        document.addEventListener('mouseup', () => {
            document.body.style.cursor = 'default';
        });
    }
}
</script>

<template>
    <div class="window-title flex items-center justify-between p-2 user-select-none" @mousedown="onStartDrag">
        <div></div>
        <div class="buttons relative z-10 inline-flex justify-end gap-2">
            <button @click="onMinimize">
                <img class="w-4 h-4 filter brightness-20 dark:invert" src="/window-minsize.svg" alt="Minimize" />
            </button>
            <button @click="onToggleMaximize">
                <img class="w-4 h-4 filter brightness-20 dark:invert" src="/window-maxsize.svg" alt="Maximize" />
            </button>
            <button @click="onClose">
                <img class="w-4 h-4 filter brightness-20 dark:invert" src="/window-close.svg" alt="Close" />
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>