<template>
  <div
    class="flex flex-col h-screen bg-gray-100 dark:bg-slate-900 gap-3 text-black dark:text-white"
  >
    <div class="flex flex-row gap-2 items-center justify-between p-3 w-full dark:bg-slate-800">
      <h1 class="block w-full font-base">
        <strong>Tmux Builder</strong> | <small>Build & export your new TMUX layout</small>
      </h1>

      <div class="flex items-center gap-2 text-white">
        <button
          class="flex items-center gap-2 py-1 px-2 bg-gray-700 hover:bg-blue-800 transition-colors rounded-md font-semibold cursor-pointer"
          :title="'Undo last change'"
          @click="() => alert('Undo')"
        >
          <i class="fa fa-undo" />
          <small v-text="'Undo'" />
        </button>

        <button
          class="flex items-center bg-gray-700 gap-2 py-1 px-3 hover:bg-blue-800 transition-colors rounded-md font-semibold cursor-pointer"
          :title="'Do full reset'"
          @click.prevent="reset"
        >
          <i class="fa fa-delete-left" />
          <small v-text="'Reset'" />
        </button>

        <export-dialog />
      </div>
    </div>

    <div
      class="flex justify-evenly gap-1 rounded-lg h-full overflow-scroll scrollbar-hide px-3"
      :key="refreshToken"
    >
      <preview-pane :pane="rootPane" />
    </div>

    <status-bar />
  </div>
</template>

<script>
import StatusBar from './components/StatusBar.vue'
import PreviewPane from './components/PreviewPane.vue'
import ExportDialog from './components/ExportDialog.vue'

// TO DO: add multi-window support

export default {
  name: 'TmuxLayoutBuilder',

  components: { StatusBar, PreviewPane, ExportDialog },

  data() {
    return {
      refreshToken: 0,
      rootPane: {
        id: 0,
        items: [],
        command: '',
        direction: ''
      }
    }
  },

  mounted() {
    this.rootPane = this.$layout.rootPane
  },

  methods: {
    reset() {
      if (confirm('Are you sure? This will delete the current layout.')) {
        this.$layout.resetBuilder()
        this.rootPane = {
          id: 0,
          items: [],
          command: '',
          direction: ''
        }
        this.refreshToken++
      }
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
