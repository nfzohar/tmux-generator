import { defineStore } from 'pinia'

const storeLocalStorageKey = 'stored_layout'

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

      let paneTree = this.rootPane

      this.traverseTree(paneTree, (pane) => {
        if (pane?.id == freshPaneId) {
          pane.items = freshPane?.items
          pane.command = freshPane?.command
          pane.direction = freshPane?.direction
        }
      })

      this.rootPane = paneTree
    },

    traverseTree(pane, method = () => {}) {
      if (!pane?.items?.length) {
        method(pane)
        return
      }

      pane?.items.forEach((childPane) => {
        this.traverseTree(childPane, method)
      })
    },

    resetBuilder() {
      this.nextPaneId = 1
      this.rootPane.id = 0
      this.rootPane.items = []
      this.rootPane.command = ''
      this.rootPane.direction = ''
      this.colors.txt = '#000000'
      this.colors.bg = '#26A269'
    },

    // saveConfigurationToStore() {
    //   localStorage.setItem(
    //     storeLocalStorageKey,
    //     JSON.stringify({
    //       old_layouts: this.previousLayouts,
    //       current_layout: this.currentLayout
    //     })
    //   )
    // },

    initializeStateFromStorage() {
      let configurationFromStore = localStorage.getItem(storeLocalStorageKey)

      if (configurationFromStore) {
        configurationFromStore = JSON.parse(configurationFromStore)

        this.previousLayouts = configurationFromStore?.old_layouts ?? []
        this.currentLayout = configurationFromStore?.current_layout
      }

      //this.saveConfigurationToStore()
    },

    deleteStoredConfiguration() {
      localStorage.removeItem(storeLocalStorageKey)
    }
  }
})
