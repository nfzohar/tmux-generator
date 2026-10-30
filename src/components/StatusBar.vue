<template>
  <div
    class="flex flex-row gap-2 items-center justify-between px-3 py-2 w-full text-sm bg-white ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-0"
  >
    <div class="flex items-center gap-2 min-w-0">
      <button
        class="flex items-center shrink-0 p-2 bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white transition-colors rounded-md cursor-pointer"
        :title="'Add new window'"
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
            class="py-1 px-2 w-36 rounded-md font-semibold bg-white dark:bg-slate-700 border border-green-700 focus:outline-none"
            maxlength="40"
            :aria-label="`Window ${index + 1} name`"
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
              class="flex items-center gap-1.5 py-1 pl-2 cursor-pointer"
              :class="$layout.windows.length > 1 ? 'pr-1' : 'pr-2'"
              :title="'Click to open, double-click to rename'"
              @click="$layout.selectWindow(window.id)"
              @dblclick="startRenaming(window)"
            >
              <span class="opacity-70" v-text="index + 1" />
              <span v-text="window.name" />
            </button>
            <button
              v-if="$layout.windows.length > 1"
              class="flex items-center py-1 pl-1 pr-2 cursor-pointer opacity-60 hover:opacity-100"
              :title="`Close ${window.name}`"
              :aria-label="`Close ${window.name}`"
              @click="$layout.removeWindow(window.id)"
            >
              <i class="fa fa-xmark" />
            </button>
          </div>
        </template>
      </div>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <div class="flex items-center gap-2 mx-2">
        <div class="flex items-center gap-1" :title="'Select status bar foreground color'">
          <label :for="'foreground_color_select'" v-text="'Text'" />
          <input
            id="foreground_color_select"
            v-model="$layout.colors.txt"
            class="w-5 h-5 rounded-xs border-2 border-gray-300 dark:border-gray-700"
            type="color"
          />
        </div>
        <div class="flex items-center gap-1" :title="'Select status bar background color'">
          <label :for="'background_color_select'" v-text="'Background'" />
          <input
            id="background_color_select"
            v-model="$layout.colors.bg"
            class="w-5 h-5 rounded-xs border-2 border-gray-300 dark:border-gray-700"
            type="color"
          />
        </div>
      </div>

      <span
        class="py-1 px-2 rounded-md border border-gray-300 dark:border-gray-800"
        :style="{ backgroundColor: $layout.colors.bg, color: $layout.colors.txt }"
        :title="'Status bar custom color preview'"
        v-text="timestamp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import format from 'date-fns/format'
import type { TmuxWindow } from '../generator'

export default defineComponent({
  name: 'StatusBar',

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
