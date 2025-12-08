<template>
  <div class="flex flex-col h-screen bg-gray-100 dark:bg-slate-900 text-black dark:text-white overflow-scroll">
    <div class="flex flex-row gap-2 items-center justify-between p-3 w-full dark:bg-slate-800">
      <h1 class="block w-full font-base">
        <strong>Tmux Builder</strong> | <small>Build & export your new TMUX layout</small>
      </h1>

      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2 py-1 px-2 bg-gray-700 hover:bg-blue-800 transition-colors rounded-md text-white font-semibold cursor-pointer"
          @click="'undolast'"
        >
          <i class="fa fa-undo" />
        </button>

        <button
          class="flex items-center bg-green-700 gap-2 py-1 px-3 hover:bg-green-800 transition-colors rounded-md text-white font-semibold cursor-pointer"
          @click="'export'"
        >
          <i class="fa fa-arrows-up-down" />
          <small v-text="'Export'" />
        </button>
      </div>
    </div>

    <hr class="border w-full px-1 dark:hidden" />

    <div class="flex justify-evenly gap-1 rounded-lg h-full p-5">
      <preview-pane />
    </div>
  </div>
</template>

<script>
import PreviewPane from './components/PreviewPane.vue'

export default {
  name: 'TmuxLayoutBuilder',

  components: { PreviewPane },

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
