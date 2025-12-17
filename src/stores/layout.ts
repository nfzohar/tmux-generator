import { defineStore } from 'pinia'

export const layout = defineStore('layout', {
  state: () => ({
    nextPaneId: 1,
    rootPane: {
      id: 0,
      items: [],
      command: '',
      direction: ''
    },
    colors: {
      txt: '#000000',
      bg: '#26A269'
    }
  }),

  actions: {
    setNextPaneId() {
      this.nextPaneId += 1
    },

    updatePane(freshPane) {
      const freshPaneId = freshPane?.id

      if (freshPaneId === 0) {
        // Replace rootPane completely
        this.rootPane = freshPane
        return
      }

      this.traverseTree(this.rootPane, (pane) => {
        if (pane?.id === freshPaneId) {
          pane.items = freshPane.items
          pane.command = freshPane?.command
          pane.direction = freshPane?.direction
        }
      })
    },

    traverseTree(pane, method = () => {}) {
      if (!pane) return

      method(pane)

      if (pane.items?.length) {
        pane.items.forEach((child) => this.traverseTree(child, method))
      }
    },

    resetBuilder() {
      this.nextPaneId = 1
      this.rootPane.id = 0
      this.rootPane.items = []
      this.rootPane.command = ''
      this.rootPane.direction = ''
      this.colors.txt = '#000000'
      this.colors.bg = '#26A269'
    }
  }
})
