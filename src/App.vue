<template>
  <div class="flex flex-col h-screen bg-gray-100 dark:bg-slate-900 text-black dark:text-white">
    <div class="flex items-center justify-between p-3 w-full dark:bg-slate-800">
      <h1 class="flex items-center gap-1 w-full">
        <b>Tmux Builder</b>|<small>Build & export your new TMUX layout</small>
      </h1>

      <div class="flex items-center gap-2">
        <button
          class="flex items-center bg-green-700 gap-2 py-1 px-3 hover:bg-green-800 transition-colors rounded-md text-white font-semibold cursor-pointer"
          @click="splitIntoGroup('vertical')"
        >
          <i class="fa fa-arrows-up-down" />
          <small v-text="'Export'" />
        </button>
      </div>
    </div>

    <div class="w-full px-1 dark:hidden">
      <hr class="border" />
    </div>

    <layout-builder />
  </div>
</template>

<script>
import LayoutBuilder from './components/LayoutBuilder.vue'

export default {
  name: 'TmuxLayoutBuilder',

  components: { LayoutBuilder },

  data() {
    return {
      rootPane: { id: 0, items: [], direction: null }
    }
  },

  mounted() {
    this.rootPane = this.currentLayout?.panes ?? this.rootPane
  },

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
