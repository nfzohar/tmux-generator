import { defineStore } from 'pinia'
import type { Direction, Pane } from '../generator'

const newPane = (id: number): Pane => ({
  id,
  items: [],
  command: '',
  direction: ''
})

const defaultColors = () => ({
  txt: '#000000',
  bg: '#26A269'
})

function findPane(pane: Pane, id: number): Pane | null {
  if (pane.id === id) {
    return pane
  }

  for (const child of pane.items) {
    const found = findPane(child, id)
    if (found) {
      return found
    }
  }

  return null
}

export const layout = defineStore('layout', {
  state: () => ({
    nextPaneId: 1,
    colors: defaultColors(),
    rootPane: newPane(0),
    // Serialized { rootPane, nextPaneId } snapshots, newest last
    history: [] as string[]
  }),

  actions: {
    snapshot(): string {
      return JSON.stringify({ rootPane: this.rootPane, nextPaneId: this.nextPaneId })
    },

    pushHistory(snapshot?: string) {
      this.history.push(snapshot ?? this.snapshot())
    },

    undo(): boolean {
      const snapshot = this.history.pop()

      if (!snapshot) {
        return false
      }

      const { rootPane, nextPaneId } = JSON.parse(snapshot)
      this.rootPane = rootPane
      this.nextPaneId = nextPaneId

      return true
    },

    splitPane(id: number, direction: Direction, paneCount = 2) {
      const pane = findPane(this.rootPane, id)

      if (!pane || pane.items.length) {
        return
      }

      this.pushHistory()

      const items = Array.from({ length: paneCount }, () => newPane(this.nextPaneId++))
      // The original pane lives on as the first child, so keep its command there
      items[0].command = pane.command

      pane.command = ''
      pane.direction = direction
      pane.items = items
    },

    setCommand(id: number, command: string) {
      const pane = findPane(this.rootPane, id)

      if (pane) {
        pane.command = command
      }
    },

    resetBuilder() {
      this.nextPaneId = 1
      this.rootPane = newPane(0)
      this.colors = defaultColors()
      this.history = []
    }
  }
})
