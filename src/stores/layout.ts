import { defineStore } from 'pinia'
import type { Direction, Pane, TmuxWindow } from '../generator'
import { label } from '../labels'
import type { PaneShape } from '../presets'

const newPane = (id: number): Pane => ({
  id,
  items: [],
  command: '',
  direction: ''
})

const defaultWindowName = (number: number) => label('window-default-name', { number })

const newWindow = (id: number, name: string, rootPaneId: number): TmuxWindow => ({
  id,
  name,
  rootPane: newPane(rootPaneId)
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
    // Pane ids are unique across all windows, so "Pane 3" is $PANE3 in the script
    nextPaneId: 1,
    nextWindowId: 1,
    colors: defaultColors(),
    windows: [newWindow(0, defaultWindowName(1), 0)],
    activeWindowId: 0,
    // Serialized snapshots of the layout (see snapshot()), newest last
    history: [] as string[]
  }),

  getters: {
    activeWindow(state): TmuxWindow {
      return state.windows.find((window) => window.id === state.activeWindowId) ?? state.windows[0]
    }
  },

  actions: {
    snapshot(): string {
      return JSON.stringify({
        windows: this.windows,
        activeWindowId: this.activeWindowId,
        nextPaneId: this.nextPaneId,
        nextWindowId: this.nextWindowId
      })
    },

    pushHistory(snapshot?: string) {
      this.history.push(snapshot ?? this.snapshot())
    },

    undo(): boolean {
      const snapshot = this.history.pop()

      if (!snapshot) {
        return false
      }

      const { windows, activeWindowId, nextPaneId, nextWindowId } = JSON.parse(snapshot)
      this.windows = windows
      this.activeWindowId = activeWindowId
      this.nextPaneId = nextPaneId
      this.nextWindowId = nextWindowId

      return true
    },

    findPane(id: number): Pane | null {
      for (const window of this.windows) {
        const pane = findPane(window.rootPane, id)
        if (pane) {
          return pane
        }
      }

      return null
    },

    splitPane(id: number, direction: Direction, paneCount = 2) {
      const pane = this.findPane(id)

      if (!pane || pane.items.length || paneCount < 2) {
        return
      }

      this.pushHistory()
      this.divide(pane, direction, paneCount)
    },

    // Splits a pane into a preset or grid layout, in one undo step
    splitPaneInto(id: number, shape: PaneShape) {
      const pane = this.findPane(id)

      if (!pane || pane.items.length || !shape) {
        return
      }

      this.pushHistory()
      this.build(pane, shape)
    },

    build(pane: Pane, shape: PaneShape) {
      if (shape) {
        this.divide(pane, shape.direction, shape.items.length)
        pane.items.forEach((child, index) => this.build(child, shape.items[index]))
      }
    },

    // Turns a leaf into a group of paneCount new leaves, without an undo step
    divide(pane: Pane, direction: Direction, paneCount: number) {
      const items = Array.from({ length: paneCount }, () => newPane(this.nextPaneId++))
      // The original pane lives on as the first child, so keep its command there
      items[0].command = pane.command

      pane.command = ''
      pane.direction = direction
      pane.items = items
    },

    setCommand(id: number, command: string) {
      const pane = this.findPane(id)

      if (pane) {
        pane.command = command
      }
    },

    addWindow() {
      this.pushHistory()

      // Next unused "Window N", closed windows can leave a number taken further down
      const names = new Set(this.windows.map((window) => window.name))
      let number = this.windows.length + 1
      while (names.has(defaultWindowName(number))) {
        number++
      }

      const window = newWindow(this.nextWindowId++, defaultWindowName(number), this.nextPaneId++)

      this.windows.push(window)
      this.activeWindowId = window.id
    },

    removeWindow(id: number) {
      const index = this.windows.findIndex((window) => window.id === id)

      // A session always has at least one window
      if (index === -1 || this.windows.length === 1) {
        return
      }

      this.pushHistory()
      this.windows.splice(index, 1)

      if (this.activeWindowId === id) {
        this.activeWindowId = this.windows[Math.min(index, this.windows.length - 1)].id
      }
    },

    selectWindow(id: number) {
      this.activeWindowId = id
    },

    renameWindow(id: number, name: string) {
      const window = this.windows.find((window) => window.id === id)

      if (window) {
        window.name = name
      }
    },

    resetBuilder() {
      this.nextPaneId = 1
      this.nextWindowId = 1
      this.windows = [newWindow(0, defaultWindowName(1), 0)]
      this.activeWindowId = 0
      this.colors = defaultColors()
      this.history = []
    }
  }
})
