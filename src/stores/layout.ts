import { defineStore } from 'pinia'

const storeLocalStorageKey = 'stored_layout'

export const layout = defineStore('layout', {
  state: () => ({
    previousLayouts: [],
    currentLayout: {
      name: '',
      panes: {},
      commands: []
    }
  }),

  getters: {
    layout(): Object {
      return this.currentLayout
    },
    panes(): Object {
      return this.currentLayout?.panes ?? []
    },
    commands(): Object {
      return this.currentLayout?.commands ?? []
    }
  },

  actions: {
    updateCurrentLayout(layout: Array) {
      this.currentLayout = layout
      this.saveConfigurationToStore()
    },

    updateOldLayoutList(layout: Object) {
      this.previousLayouts = [layout, ...this.previousLayouts]
      this.saveConfigurationToStore()
    },

    resetCurrentLayout() {
      this.currentLayout = {
        panes: {},
        commands: []
      }
    },

    saveConfigurationToStore() {
      localStorage.setItem(
        storeLocalStorageKey,
        JSON.stringify({
          old_layouts: this.previousLayouts,
          current_layout: this.currentLayout
        })
      )
    },

    initializeStateFromStorage() {
      let configurationFromStore = localStorage.getItem(storeLocalStorageKey)

      if (configurationFromStore) {
        configurationFromStore = JSON.parse(configurationFromStore)

        this.previousLayouts = configurationFromStore?.old_layouts ?? []
        this.currentLayout = configurationFromStore?.current_layout
      }

      this.saveConfigurationToStore()
    },

    deleteStoredConfiguration() {
      localStorage.removeItem(storeLocalStorageKey)
    }
  }
})
