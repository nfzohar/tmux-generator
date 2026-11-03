<template>
  <div
    class="flex flex-row flex-wrap sm:flex-nowrap gap-2 items-center justify-between px-3 py-2 w-full text-sm bg-white ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-0"
  >
    <div class="flex items-center gap-2 min-w-0 basis-full sm:basis-auto">
      <button
        class="flex items-center shrink-0 p-2 pointer-coarse:p-2.5 bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white transition-colors rounded-md cursor-pointer"
        :title="$label('window-add')"
        :aria-label="$label('window-add')"
        @click="$layout.addWindow()"
      >
        <i class="fa fa-plus" />
      </button>

      <div ref="tabs" class="flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-hide">
        <template v-for="(window, index) in $layout.windows" :key="window.id">
          <input
            v-if="renamingWindowId === window.id"
            v-focus
            :value="window.name"
            class="py-1 pointer-coarse:py-2 pointer-coarse:text-base px-2 w-36 rounded-md font-semibold bg-white dark:bg-slate-700 border border-green-700 focus:outline-none"
            maxlength="40"
            :aria-label="$label('window-name-input', { number: index + 1 })"
            @input="rename"
            @keydown.enter="finishRenaming"
            @keydown.esc="cancelRenaming"
            @blur="finishRenaming"
          />
          <div
            v-else
            class="flex items-center rounded-md font-semibold whitespace-nowrap transition-colors"
            :class="
              window.id === $layout.activeWindowId
                ? 'bg-green-700 hover:bg-green-800 text-white'
                : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white'
            "
            :data-active="window.id === $layout.activeWindowId || undefined"
          >
            <button
              class="flex items-center gap-1.5 py-1 pointer-coarse:py-2 pl-2 cursor-pointer touch-manipulation"
              :class="$layout.windows.length > 1 ? 'pr-1' : 'pr-2'"
              :title="$label('window-tab-title')"
              @click="$layout.selectWindow(window.id)"
              @dblclick="startRenaming(window)"
            >
              <span class="opacity-70" v-text="index + 1" />
              <span v-text="window.name" />
            </button>
            <button
              v-if="$layout.windows.length > 1"
              class="flex items-center py-1 pointer-coarse:py-2 pl-1 pr-2 cursor-pointer opacity-60 hover:opacity-100"
              :title="$label('window-close', { name: window.name })"
              :aria-label="$label('window-close', { name: window.name })"
              @click="$layout.removeWindow(window.id)"
            >
              <i class="fa fa-xmark" />
            </button>
          </div>
        </template>
      </div>
    </div>

    <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
      <div class="flex items-center gap-2 sm:mx-2">
        <div class="flex items-center gap-1" :title="$label('status-text-color-title')">
          <label :for="'foreground_color_select'" v-text="$label('status-text-color')" />
          <input
            id="foreground_color_select"
            v-model="$layout.colors.txt"
            class="w-5 h-5 pointer-coarse:w-7 pointer-coarse:h-7 rounded-xs border-2 border-gray-300 dark:border-gray-700"
            type="color"
          />
        </div>
        <div class="flex items-center gap-1" :title="$label('status-background-color-title')">
          <label :for="'background_color_select'" v-text="$label('status-background-color')" />
          <input
            id="background_color_select"
            v-model="$layout.colors.bg"
            class="w-5 h-5 pointer-coarse:w-7 pointer-coarse:h-7 rounded-xs border-2 border-gray-300 dark:border-gray-700"
            type="color"
          />
        </div>
      </div>

      <span
        class="py-1 px-2 rounded-md border whitespace-nowrap border-gray-300 dark:border-gray-800"
        :style="{ backgroundColor: $layout.colors.bg, color: $layout.colors.txt }"
        :title="$label('status-preview-title')"
        v-text="timestamp"
      />

      <theme-toggle class="ml-auto sm:ml-0" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import format from 'date-fns/format'
import ThemeToggle from './ThemeToggle.vue'
import type { TmuxWindow } from '../generator'

export default defineComponent({
  name: 'StatusBar',

  components: { ThemeToggle },

  directives: {
    focus: {
      mounted: (el: HTMLInputElement) => {
        el.focus()
        el.select()
      }
    }
  },

  data() {
    return {
      renamingWindowId: null as number | null,
      nameBeforeRenaming: '',
      snapshotBeforeRenaming: '',
      timestamp: '',
      timer: undefined as ReturnType<typeof setInterval> | undefined
    }
  },

  watch: {
    // Keep the active tab visible when the tabs overflow
    '$layout.activeWindowId'() {
      this.$nextTick(() => {
        const tabs = this.$refs.tabs as HTMLElement
        tabs.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      })
    }
  },

  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
  },

  beforeUnmount() {
    clearInterval(this.timer)
  },

  methods: {
    startRenaming(window: TmuxWindow) {
      this.renamingWindowId = window.id
      this.nameBeforeRenaming = window.name
      this.snapshotBeforeRenaming = this.$layout.snapshot()
    },

    rename(event: Event) {
      if (this.renamingWindowId !== null) {
        this.$layout.renameWindow(this.renamingWindowId, (event.target as HTMLInputElement).value)
      }
    },

    // Renaming is one undo step, an empty name keeps the old one
    finishRenaming() {
      const id = this.renamingWindowId
      if (id === null) {
        return
      }
      this.renamingWindowId = null

      const name = this.$layout.windows.find((window) => window.id === id)?.name.trim()
      this.$layout.renameWindow(id, name || this.nameBeforeRenaming)

      if (name && name !== this.nameBeforeRenaming) {
        this.$layout.pushHistory(this.snapshotBeforeRenaming)
      }
    },

    cancelRenaming() {
      if (this.renamingWindowId !== null) {
        this.$layout.renameWindow(this.renamingWindowId, this.nameBeforeRenaming)
        this.renamingWindowId = null
      }
    },

    updateTime() {
      this.timestamp = format(new Date(), 'HH:mm dd-MMM-yy')
    }
  }
})
</script>
