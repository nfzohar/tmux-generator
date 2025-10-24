import { defineStore } from 'pinia'

const storeLocalStorageKey = 'stored_layout'

export const layout = defineStore('layout', {
  state: () => ({
    previousLayouts: [],
    currentLayout: {
      name: 'New Session',
      nextPaneId: 1,
      enabledMouseInput: false,
      includeTmuxInstalledCheck: false,
      commands: [],
      panes: {}
    }
  }),

  getters: {
    layout(): Object {
      return this.currentLayout
    },
    panes(): Object {
      return this.currentLayout?.panes ?? []
    },
    commandList(): Object {
      return this.currentLayout?.commands ?? []
    }
  },

  actions: {
    updateCurrentLayoutProp(key, value) {
      this.currentLayout[key] = value
      this.saveConfigurationToStore()
    },

    resetCurrentLayout() {
      this.currentLayout = {
        name: 'New Session',
        nextPaneId: 1,
        enabledMouseInput: false,
        includeTmuxInstalledCheck: false,
        commands: [],
        panes: { id: 0, children: [], direction: null }
      }
      this.saveConfigurationToStore()
    },

    loadOldIntoCurrentLayout(oldLayoutId) {
      let temp = this.previousLayouts.filter((layout) => layout?.id != oldLayoutId).pop()
      this.previousLayouts = temp
      this.saveConfigurationToStore()
    },

    deleteOldLayout(oldLayoutId) {
      this.currentLayout = this.previousLayouts.filter((layout) => layout?.id == oldLayoutId).pop()
      this.saveConfigurationToStore()
    },

    saveCurrentLayoutToOldLayouts() {
      let layoutTemp = this.currentLayout

      layoutTemp['id'] = Math.floor(Math.random() * 99)

      this.previousLayouts = [layoutTemp, ...this.previousLayouts]
      this.saveConfigurationToStore()
    },

    splitPane(paneId, direction) {
      console.log(node.id, node.direction)

      // Loop through all children recursively
      // for (const child of this.panes.children) {
      //   traverse(child)
      // }
    },

    updatePaneCommand(paneId, command) {
      this.currentLayout.commands[paneId] = command
      this.saveConfigurationToStore()
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
