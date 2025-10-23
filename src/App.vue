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
    <the-editor />

    <div class="flex-1 p-3">
      <div class="h-full flex-1 p-5 bg-gray-900 border-5 border-gray-700 rounded-lg">
        <a-pane-group v-if="isGroup" :pane="mainPane" />
        <a-pane v-else :pane="mainPane" />
      </div>
    </div>
  </div>
</template>

<script>
import TheSidebar from './components/Sidebar.vue'
import APane from './components/PreviewPane.vue'
import APaneGroup from './components/PreviewPaneGroup.vue'

export default {
  name: 'TmuxLayoutBuilder',

  components: { TheSidebar, APane, APaneGroup },

  data() {
    return {
      mainPane: { id: 0, children: [], direction: null }
    }
  },

  computed: {
    isGroup() {
      return this.mainPane?.items?.length ?? false
    }
  },

  methods: {
    splitPane(paneId, direction) {
      if (!this.currentWindow) return

      const newPane = {
        id: Date.now().toString(),
        command: '',
        name: `pane-${this.currentWindow.panes.length + 1}`,
        parentId: paneId,
        splitDirection: direction
      }

      this.windows = this.windows.map((w) =>
        w.id === this.activeWindow ? { ...w, panes: [...w.panes, newPane] } : w
      )
    },
    addPane() {
      if (!this.currentWindow) return

      const newPane = {
        id: Date.now().toString(),
        command: '',
        name: `pane-${this.currentWindow.panes.length + 1}`
      }

      this.windows = this.windows.map((w) =>
        w.id === this.activeWindow ? { ...w, panes: [...w.panes, newPane] } : w
      )
    },
    removePane(paneId) {
      if (!this.currentWindow || this.currentWindow.panes.length <= 1) return

      this.windows = this.windows.map((w) =>
        w.id === this.activeWindow ? { ...w, panes: w.panes.filter((p) => p.id !== paneId) } : w
      )

      if (this.selectedPane === paneId) {
        this.selectedPane = null
      }
    },
    updatePane(paneId, updates) {
      this.windows = this.windows.map((w) =>
        w.id === this.activeWindow
          ? {
              ...w,
              panes: w.panes.map((p) => (p.id === paneId ? { ...p, ...updates } : p))
            }
          : w
      )
    },
    changeLayout(layout) {
      this.windows = this.windows.map((w) => (w.id === this.activeWindow ? { ...w, layout } : w))
    },
    setSelectedPane(paneId) {
      this.selectedPane = paneId
    },
    reorderPanes(draggedPaneId, targetPaneId) {
      if (!draggedPaneId || !this.currentWindow || draggedPaneId === targetPaneId) {
        return
      }

      const newPanes = [...this.currentWindow.panes]
      const draggedIndex = newPanes.findIndex((p) => p.id === draggedPaneId)
      const targetIndex = newPanes.findIndex((p) => p.id === targetPaneId)

      const [removed] = newPanes.splice(draggedIndex, 1)
      newPanes.splice(targetIndex, 0, removed)

      this.windows = this.windows.map((w) =>
        w.id === this.activeWindow ? { ...w, panes: newPanes } : w
      )
    }
  }
}
</script>
