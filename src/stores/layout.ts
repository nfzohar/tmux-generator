import { defineStore } from 'pinia'

const storeLocalStorageKey = 'stored_layout'

export const layout = defineStore('layout', {
  state: () => ({
    steps: [],
    sequenceId: 0,
    stepCounter: 0,
    paneCommands: [],

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

  getters: {
    scriptSteps(): Array {
      return this.steps ?? []
    },
    scriptCommands(): Array {
      return this.paneCommands ?? []
    }
  },

  actions: {
    setNextPaneId() {
      this.nextPaneId += 1
    },

    updatePane(updatedPane) {
      const paneId = updatedPane?.id

      this.traverseTree(this.rootPane, (pane) => {
        if (pane?.id == paneId) {
          pane.items = updatedPane?.items
          pane.command = updatedPane?.command
          pane.direction = updatedPane?.direction
        }
      })
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

    addStep(value) {
      this.steps[this.stepCounter] = value
      this.stepCounter++
    },

    resetLayout() {
      this.steps = []
      this.sequenceId = 0
      this.stepCounter = 0
      this.paneCommands = []
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
