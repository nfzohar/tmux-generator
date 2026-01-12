import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash'

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

      this.rootPane = this.traverseTree(this.rootPane, (pane) => {
        if (pane?.id != freshPaneId) {
          return pane
        }

        return {
          id: pane.id,
          items: freshPane.items,
          command: freshPane?.command,
          direction: freshPane?.direction
        }
      })

      console.log(this.rootPane)
    },

    traverseTree(pane, method) {
      if (!pane) {
        return
      }

      const updatedPane = method(pane)

      if (!updatedPane.items?.length) {
        return updatedPane
      }

      return {
        ...updatedPane,
        items: updatedPane.items.map((child) => this.traverseTree(child, method))
      }
    },

    resetBuilder() {
      this.nextPaneId = 1
      this.rootPane = {
        id: 0,
        items: [],
        command: '',
        direction: ''
      }
      this.colors = {
        txt: '#000000',
        bg: '#26A269'
      }
    }
  }
})
