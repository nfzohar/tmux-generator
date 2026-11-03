import type { LabelSlug } from './labels'

// A layout to split a pane into: null is a single pane, a group splits in one direction
export type PaneShape = null | { direction: 'horizontal' | 'vertical'; items: PaneShape[] }

const pane: PaneShape = null
const sideBySide = (...items: PaneShape[]): PaneShape => ({ direction: 'horizontal', items })
const stacked = (...items: PaneShape[]): PaneShape => ({ direction: 'vertical', items })

// Columns side by side, each stacked into rows when there is more than one
export function gridShape(columns: number, rows: number): PaneShape {
  const column = rows > 1 ? stacked(...Array<PaneShape>(rows).fill(pane)) : pane

  return columns > 1 ? sideBySide(...Array<PaneShape>(columns).fill(column)) : column
}

// Offered in a pane's context menu, in this order
export const presets: { label: LabelSlug; shape: PaneShape }[] = [
  { label: 'preset-main-side', shape: sideBySide(pane, stacked(pane, pane)) },
  { label: 'preset-main-bottom', shape: stacked(pane, sideBySide(pane, pane)) },
  { label: 'preset-main-side-three', shape: sideBySide(pane, stacked(pane, pane, pane)) },
  { label: 'preset-three-columns', shape: gridShape(3, 1) },
  { label: 'preset-three-rows', shape: gridShape(1, 3) },
  { label: 'preset-tiled', shape: gridShape(2, 2) }
]
