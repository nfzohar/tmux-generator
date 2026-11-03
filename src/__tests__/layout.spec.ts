import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { layout } from '../stores/layout'
import type { Pane } from '../generator'
import { gridShape, presets, type PaneShape } from '../presets'

// The tree without ids and commands
const shape = (pane: Pane): PaneShape =>
  pane.items.length
    ? { direction: pane.direction as 'horizontal' | 'vertical', items: pane.items.map(shape) }
    : null

const sideBySide = (...items: PaneShape[]): PaneShape => ({ direction: 'horizontal', items })
const stacked = (...items: PaneShape[]): PaneShape => ({ direction: 'vertical', items })

describe('layout store splits', () => {
  let store: ReturnType<typeof layout>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = layout()
  })

  const root = () => store.activeWindow.rootPane

  it('splits into a single row of columns', () => {
    store.splitPaneInto(0, gridShape(5, 1))

    expect(shape(root())).toEqual(sideBySide(null, null, null, null, null))
  })

  it('splits into a single column of rows', () => {
    store.splitPaneInto(0, gridShape(1, 3))

    expect(shape(root())).toEqual(stacked(null, null, null))
  })

  it('splits into columns that are each stacked into rows', () => {
    store.splitPaneInto(0, gridShape(3, 2))

    const column = stacked(null, null)
    expect(shape(root())).toEqual(sideBySide(column, column, column))
  })

  it('keeps the command in the first pane and gives every pane a new id', () => {
    store.setCommand(0, 'vim .')
    store.splitPaneInto(0, gridShape(2, 2))

    const leaves = (pane: Pane): Pane[] => (pane.items.length ? pane.items.flatMap(leaves) : [pane])
    const commands = leaves(root()).map((pane) => pane.command)
    expect(commands).toEqual(['vim .', '', '', ''])

    const ids = leaves(root()).map((pane) => pane.id)
    expect(new Set([0, ...ids]).size).toBe(ids.length + 1)
  })

  it('is undone in one step', () => {
    store.splitPaneInto(0, gridShape(3, 2))
    store.undo()

    expect(shape(root())).toBeNull()
    expect(store.history).toEqual([])
  })

  it('ignores a 1 by 1 grid and panes that are already split', () => {
    store.splitPaneInto(0, gridShape(1, 1))
    expect(shape(root())).toBeNull()

    store.splitPaneInto(0, gridShape(2, 1))
    store.splitPaneInto(0, gridShape(3, 3))
    expect(shape(root())).toEqual(sideBySide(null, null))
    expect(store.history).toHaveLength(1)
  })

  it.each(presets.map((preset) => [preset.label, preset.shape] as const))(
    'splits into the %s preset',
    (_, preset) => {
      store.splitPaneInto(0, preset)

      expect(shape(root())).toEqual(preset)
      expect(store.history).toHaveLength(1)
    }
  )

  it('builds a preset inside an already split layout', () => {
    store.splitPane(0, 'vertical')
    const [top, bottom] = root().items
    store.splitPaneInto(bottom.id, presets[0].shape)

    expect(shape(root())).toEqual(stacked(null, presets[0].shape))
    expect(root().items[0]).toBe(top)
  })
})
