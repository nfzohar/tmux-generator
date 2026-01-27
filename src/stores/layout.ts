import { defineStore } from 'pinia'

export const layout = defineStore('layout', {
  state: () => ({
    nextPaneId: 1,
    colors: {
      txt: '#000000',
      bg: '#26A269'
    },
    rootPane: {
      id: 0,
      items: [],
      command: '',
      direction: ''
    }
  }),

  actions: {
    setNextPaneId() {
      this.nextPaneId += 1
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
