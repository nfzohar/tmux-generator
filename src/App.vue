<template>
  <div class="flex h-screen bg-gray-900 text-black dark:text-white">
    <the-sidebar
      :session-name="sessionName"
      :mouse-enabled="mouseEnabled"
      :current-layout="currentWindow?.layout"
      :panes="currentWindow?.panes || []"
      :selected-pane="selectedPane"
      @update:session-name="sessionName = $event"
      @update:mouse-enabled="mouseEnabled = $event"
      @change-layout="changeLayout"
      @add-pane="addPane"
      @remove-pane="removePane"
      @update-pane="updatePane"
      @select-pane="setSelectedPane"
      @split-pane="splitPane"
      @reorder-panes="reorderPanes"
    />

    <div class="flex flex-col w-full mx-2 py-1 h-screen">
      <div
        class="flex items-center justify-between h-min py-1 px-2 bg-gray-600 border-3 border-gray-700 rounded-t-md"
      >
        <span class="font-bold text-sm" v-text="sessionName" />

        <div class="flex gap-2">
          <i
            class="bg-gray-700 border-gray-700 border py-1 px-2 rounded-md fa fa-window-minimize"
          />
          <span
            class="bg-gray-700 border-gray-700 border py-1 px-2 rounded-md cursor-pointer"
            :title="'Toggle fullscreen'"
            @click="toggleFullscreen"
          >
            <i class="fa fa-window-maximize" />
          </span>

          <span
            class="bg-red-700 border-red-700 border py-1 px-2 rounded-md cursor-pointer"
            :title="'Exit app'"
            @click="exitApp"
          >
            <i class="fa fa-times" />
          </span>
        </div>
      </div>

      <div class="h-full p-3 bg-black border-x-3 border-b-3 border-gray-700 rounded-b-md">
        <a-pane-group v-if="isGroup" :pane="rootPane" />
        <a-pane v-else :pane="rootPane" />
      </div>
    </div>
  </div>
</template>

<script>
import TheSidebar from './components/Sidebar.vue'

export default {
  name: 'TmuxLayoutBuilder',

  components: { TheSidebar },

  data() {
    return {
      rootPane: { id: 0, children: [], direction: null }
    }
  },

  computed: {
    isGroup() {
      return this.rootPane?.items?.length ?? false
    },
    currentLayout() {
      return this.$layout.currentLayout ?? null
    },
    sessionName() {
      return this.currentLayout?.name ?? 'New session'
    }
  },

  methods: {
    toggleFullscreen() {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
      } else {
        const elem = document.documentElement

        if (elem.requestFullscreen) {
          elem.requestFullscreen()
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen()
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen()
        }
      }
    },

    exitApp() {
      if (window.confirm('Are you sure you want to leave the app?')) {
        window.close()
      }
    }
  }
}
</script>
