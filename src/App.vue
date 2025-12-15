<template>
  <div
    class="flex flex-col h-screen bg-gray-100 dark:bg-slate-900 gap-5 text-black dark:text-white"
  >
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

    <div class="flex justify-evenly gap-1 rounded-lg h-full overflow-scroll scrollbar-hide px-2">
      <preview-pane :pane="rootPane" />
    </div>

    <status-bar />
  </div>
</template>

<script>
import StatusBar from './components/StatusBar.vue'
import PreviewPane from './components/PreviewPane.vue'
import ExportDialog from './components/ExportDialog.vue'

// TO DO: add sidebar customization, add multi-window support

export default {
  name: 'TmuxLayoutBuilder',

  components: { StatusBar, PreviewPane, ExportDialog },

  data() {
    return {
      rootPane: { id: 0, direction: '', items: [] }
    }
  },

  mounted() {
    this.$layout.tmuxTree = this.rootPane
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
