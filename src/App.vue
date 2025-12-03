<template>
  <div class="flex flex-col h-screen bg-gray-900 text-black dark:text-white">
    <div class="flex items-center justify-between py-3 px-5 w-full bg-gray-800">
      <div class="flex flex-col">
        <h1 class="text-3xl font-bold w-full" v-text="'Tmux Builder'" />
        <p class="text-sm text-gray-400 w-full" v-text="'Build & export your new TMUX layout'" />
      </div>

      <div class="flex items-center gap-2">
        <span>1</span>
        <span>2</span>
      </div>
    </div>

    <layout-builder />
  </div>
</template>

<script>
import TheSidebar from './components/Sidebar.vue'
import LayoutBuilder from './components/LayoutBuilder.vue'

export default {
  name: 'TmuxLayoutBuilder',

  components: { TheSidebar, LayoutBuilder },

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
