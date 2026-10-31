<template>
  <div
    class="flex flex-col h-screen bg-gray-200 dark:bg-slate-900 gap-3 text-gray-900 dark:text-white"
  >
    <div
      class="flex flex-row gap-2 items-center justify-between p-3 w-full bg-white ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-0"
    >
      <h1 class="block w-full min-w-0 truncate">
        <strong>Tmux Builder</strong> | <small>Build & export your new TMUX layout</small>
      </h1>

      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2 py-1 px-2 bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white transition-colors rounded-md font-semibold cursor-pointer"
          :title="'Undo last change'"
          @click="undoLastChange()"
        >
          <i class="fa fa-undo" />
          <small v-text="'Undo'" />
        </button>

        <button
          class="flex items-center gap-2 py-1 px-3 bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white transition-colors rounded-md font-semibold cursor-pointer"
          :title="'Do full reset'"
          @click.prevent="confirmingReset = true"
        >
          <i class="fa fa-delete-left" />
          <small v-text="'Reset'" />
        </button>

        <export-dialog :windows="$layout.windows" />
      </div>
    </div>

    <div class="flex gap-1 rounded-lg flex-1 min-h-0 overflow-scroll scrollbar-hide px-3">
      <preview-pane :key="$layout.activeWindowId" :pane="$layout.activeWindow.rootPane" />
    </div>

    <status-bar />

    <confirm-dialog
      :show="confirmingReset"
      :title="'Reset the layout?'"
      :message="'This deletes every window, pane and command and resets the status bar colors. It can\'t be undone.'"
      :confirm-label="'Reset'"
      :confirm-icon="'fa-delete-left'"
      :cancel-label="'Cancel'"
      danger
      @confirm="reset()"
      @cancel="confirmingReset = false"
    />

    <confirm-dialog
      :show="nothingToUndo"
      :title="'Nothing to undo'"
      :message="'There are no more changes to undo.'"
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
