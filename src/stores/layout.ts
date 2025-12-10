import { defineStore } from 'pinia'

const storeLocalStorageKey = 'stored_layout'

export const layout = defineStore('layout', {
  state: () => ({
    steps: [],
    sequenceId: 0,
    stepCounter: 0,
    paneCommands: []
  }),

  getters: {
    nextPaneId(): Number {
      return this.sequenceId
    },
    scriptSteps(): Array {
      return this.steps ?? []
    },
    scriptCommands(): Array {
      return this.paneCommands ?? []
    }
  },

  actions: {
    setNextPaneId() {
      this.sequenceId += 1
    },

    addStep(value) {
      this.steps[this.stepCounter] = value
      this.stepCounter += 1
    },

    updatePaneCommand(paneId: [Number, String], command = '') {
      if (paneId) {
        this.paneCommands[paneId] = command ?? ''
      }
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
