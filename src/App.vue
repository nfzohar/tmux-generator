<template>
  <div
    class="flex flex-col h-dvh bg-gray-200 dark:bg-slate-900 gap-3 text-gray-900 dark:text-white"
  >
    <div
      class="flex flex-row gap-2 items-center justify-between p-3 w-full bg-white ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-0"
    >
      <h1 class="block w-full min-w-0 truncate">
        <strong v-text="$label('app-title')" /><span class="hidden sm:inline">
          | <small v-text="$label('app-subtitle')" />
        </span>
      </h1>

      <div class="flex items-center gap-2 shrink-0">
        <button
          class="flex items-center gap-2 py-1 pointer-coarse:py-2 px-2 bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white transition-colors rounded-md font-semibold cursor-pointer"
          :title="$label('undo-title')"
          :aria-label="$label('undo-title')"
          @click="undoLastChange()"
        >
          <i class="fa fa-undo" />
          <small class="hidden sm:inline" v-text="$label('undo')" />
        </button>

        <button
          class="flex items-center gap-2 py-1 pointer-coarse:py-2 px-3 bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white transition-colors rounded-md font-semibold cursor-pointer"
          :title="$label('reset-title')"
          :aria-label="$label('reset-title')"
          @click.prevent="confirmingReset = true"
        >
          <i class="fa fa-delete-left" />
          <small class="hidden sm:inline" v-text="$label('reset')" />
        </button>

        <export-dialog :windows="$layout.windows" />
      </div>
    </div>

    <div class="flex gap-1 rounded-lg flex-1 min-h-0 overflow-scroll scrollbar-hide px-3">
      <preview-pane
        :key="$layout.activeWindowId"
        :pane="$layout.activeWindow.rootPane"
        @reset="confirmingReset = true"
      />
    </div>

    <status-bar />

    <confirm-dialog
      :show="confirmingReset"
      :title="$label('reset-confirm-title')"
      :message="$label('reset-confirm-message')"
      :confirm-label="$label('reset')"
      :confirm-icon="'fa-delete-left'"
      :cancel-label="$label('dialog-cancel')"
      danger
      @confirm="reset()"
      @cancel="confirmingReset = false"
    />

    <confirm-dialog
      :show="nothingToUndo"
      :title="$label('undo-nothing-title')"
      :message="$label('undo-nothing-message')"
      @confirm="nothingToUndo = false"
      @cancel="nothingToUndo = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import StatusBar from './components/StatusBar.vue'
import PreviewPane from './components/PreviewPane.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import ExportDialog from './components/ExportDialog.vue'

export default defineComponent({
  name: 'TmuxLayoutBuilder',

  components: { StatusBar, PreviewPane, ConfirmDialog, ExportDialog },

  data() {
    return {
      confirmingReset: false,
      nothingToUndo: false
    }
  },

  methods: {
    undoLastChange() {
      if (!this.$layout.undo()) {
        this.nothingToUndo = true
      }
    },

    reset() {
      this.$layout.resetBuilder()
      this.confirmingReset = false
    }
  }
})
</script>

<style>
/* hide scrollbar for Chrome, Safari, and Edge */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* hide scrollbar for Firefox */
.scrollbar-hide {
  scrollbar-width: none;
}
</style>
