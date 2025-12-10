<template>
  <div class="flex flex-col h-screen bg-gray-100 dark:bg-slate-900 text-black dark:text-white">
    <div class="flex flex-row gap-2 items-center justify-between p-3 w-full dark:bg-slate-800">
      <h1 class="block w-full font-base">
        <strong>Tmux Builder</strong> | <small>Build & export your new TMUX layout</small>
      </h1>

      <div class="flex items-center gap-2 text-white">
        <button
          class="flex items-center gap-2 py-1 px-2 bg-gray-700 hover:bg-blue-800 transition-colors rounded-md font-semibold cursor-pointer"
          @click="'undolast'"
        >
          <i class="fa fa-undo" />
        </button>

        <export-dialog />
      </div>
    </div>

    <hr class="border w-full px-1 dark:hidden" />
    <div class="flex justify-evenly gap-1 rounded-lg h-full p-5 overflow-scroll scrollbar-hide">
      <preview-pane />
    </div>
  </div>
</template>

<script>
import PreviewPane from './components/PreviewPane.vue'
import ExportDialog from './components/ExportDialog.vue'

export default {
  name: 'TmuxLayoutBuilder',

  components: { PreviewPane, ExportDialog },

  computed: {
    sessionName() {
      return this.currentLayout?.name || 'New session'
    },
    isGroup() {
      return this.rootPane?.items?.length ?? false
    },
    currentLayout() {
      return this.$layout.currentLayout ?? null
    },
    token() {
      return this.$layout.refreshToken
    }
  }
}
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
