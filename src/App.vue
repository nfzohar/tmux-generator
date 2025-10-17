<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
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
    <!-- <the-preview
      :configuration="configuration"
      :window-name="currentWindow?.name"
      :layout="currentWindow?.layout"
      :panes="currentWindow?.panes || []"
      :selected-pane="selectedPane"
      :selected-pane-name="selectedPaneName"
      @select-pane="setSelectedPane"
      @split-pane="splitPane"
      @show-export="showExportDialog = true"
      @reorder-panes="reorderPanes"
    />
    <export-dialog
      :show="showExportDialog"
      :session-name="sessionName"
      :mouse-enabled="mouseEnabled"
      :panes="currentWindow?.panes || []"
      @close="showExportDialog = false"
    /> -->
  </div>
</template>

<script>
import TheSidebar from './components/Sidebar.vue'
import ThePreview from './components/Preview.vue'
import TheEditor from './components/Editor.vue'
import ExportDialog from './components/ExportDialog.vue'

export default {
  name: 'TmuxLayoutBuilder',

  components: { TheSidebar, ThePreview, ExportDialog, TheEditor },

  data() {
    return {
      sessionName: 'my-session',
      mouseEnabled: false,

      selectedPane: null,
      activeWindow: '1',

      showExportDialog: false,

      windows: [
        {
          id: '1',
          name: 'main',
          panes: [{ id: '1', command: '', name: 'pane-1' }],
          layout: 'horizontal'
        }
      ]
    }
  },

  computed: {
    configuration() {
      return {
        sessionName: this.sessionName,
        mouseIsEnabled: this.mouseEnabled,
        layout: {}
      }
    },
    currentWindow() {
      return this.windows.find((w) => w.id === this.activeWindow)
    },
    selectedPaneName() {
      if (!this.selectedPane || !this.currentWindow) return ''
      const pane = this.currentWindow.panes.find((p) => p.id === this.selectedPane)
      return pane ? pane.name : ''
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
