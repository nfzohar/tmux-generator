import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { layout } from '../stores/layout'

describe('layout store status bar colors', () => {
  let store: ReturnType<typeof layout>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = layout()
  })

  it('sets the session colors while per-window colors are off', () => {
    store.setColor('bg', '#ff0000')

    expect(store.colors.bg).toBe('#ff0000')
    expect(store.windowColors).toEqual({})
    expect(store.activeColors.bg).toBe('#ff0000')
  })

  it('sets only the open window while per-window colors are on', () => {
    store.addWindow()
    store.perWindowColors = true
    store.setColor('bg', '#3355ff')

    expect(store.windowColors).toEqual({ 1: { txt: '#000000', bg: '#3355ff' } })
    expect(store.colors.bg).toBe('#26A269')

    store.selectWindow(0)
    expect(store.activeColors.bg).toBe('#26A269')
  })

  it('keeps window colors while turned off, and uses them again when turned back on', () => {
    store.perWindowColors = true
    store.setColor('txt', '#ffffff')
    store.perWindowColors = false

    expect(store.activeColors.txt).toBe('#000000')

    store.perWindowColors = true
    expect(store.activeColors.txt).toBe('#ffffff')
  })

  it('starts a window that gets a reused id with the session colors', () => {
    store.addWindow()
    store.perWindowColors = true
    store.setColor('bg', '#3355ff')
    store.undo()
    store.addWindow()

    expect(store.activeWindowId).toBe(1)
    expect(store.activeColors.bg).toBe('#26A269')
  })

  it('clears window colors on reset', () => {
    store.perWindowColors = true
    store.setColor('bg', '#3355ff')
    store.resetBuilder()

    expect(store.perWindowColors).toBe(false)
    expect(store.windowColors).toEqual({})
  })
})
