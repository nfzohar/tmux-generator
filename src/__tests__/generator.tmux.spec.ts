// Runs generated scripts against a real, isolated tmux server and checks that the panes
// end up where the builder draws them, with each command running in its own pane.
// Skipped when tmux is not installed.
import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateScript, type Direction, type Pane } from '../generator'

const tmuxPath = spawnSync('sh', ['-c', 'command -v tmux'], { encoding: 'utf8' }).stdout.trim()

const leaf = (id: number, command = ''): Pane => ({ id, direction: '', command, items: [] })
const split = (id: number, direction: Direction, items: Pane[]): Pane => ({
  id,
  direction,
  command: '',
  items
})
const leaves = (pane: Pane): Pane[] => (pane.items.length ? pane.items.flatMap(leaves) : [pane])

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

// Where each leaf should be, as fractions of the window, mirroring the builder's flex layout
function expectedRects(pane: Pane, rect: Rect = { x: 0, y: 0, w: 1, h: 1 }): Map<number, Rect> {
  const rects = new Map<number, Rect>()
  if (!pane.items.length) {
    return rects.set(pane.id, rect)
  }

  const n = pane.items.length
  pane.items.forEach((child, i) => {
    const childRect =
      pane.direction === 'vertical'
        ? { x: rect.x, y: rect.y + (rect.h * i) / n, w: rect.w, h: rect.h / n }
        : { x: rect.x + (rect.w * i) / n, y: rect.y, w: rect.w / n, h: rect.h }
    expectedRects(child, childRect).forEach((r, id) => rects.set(id, r))
  })
  return rects
}

describe.skipIf(!tmuxPath)('generated script in a real tmux server', () => {
  let dir: string
  let tmux: string
  let env: NodeJS.ProcessEnv

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'tmux-generator-'))

    // A "tmux" on PATH that talks to a private server, so the user's sessions are untouched
    tmux = join(dir, 'tmux')
    writeFileSync(
      tmux,
      `#!/bin/sh\nexec ${tmuxPath} -L "tmux-generator-test-${process.pid}" "$@"\n`
    )
    chmodSync(tmux, 0o755)

    env = {
      ...process.env,
      PATH: `${dir}:${process.env.PATH}`,
      TMUX: '',
      SHELL: '/bin/sh',
      COLUMNS: '200',
      LINES: '50'
    }
  })

  afterEach(() => {
    spawnSync(tmux, ['kill-server'], { env })
    rmSync(dir, { recursive: true, force: true })
  })

  const tmuxOutput = (...args: string[]) =>
    execFileSync(tmux, args, { env, encoding: 'utf8' }).trim()

  // Runs the script without the final attach (there is no terminal here) and returns the
  // tmux pane id of every leaf
  function runScript(tree: Pane): Map<number, string> {
    const script = generateScript(tree, {
      sessionName: 'test',
      colors: { txt: '#000000', bg: '#26A269' },
      showComments: true,
      mouseInputEnabled: true,
      checkTmuxInstall: false
    })
    expect(script.endsWith('\nattach\n')).toBe(true)

    const printPaneIds = leaves(tree)
      .map((pane) => `echo "${pane.id} $PANE${pane.id}"`)
      .join('\n')
    const path = join(dir, 'script.sh')
    writeFileSync(path, script.replace(/\nattach\n$/, `\n${printPaneIds}\n`))

    const output = execFileSync('sh', [path], { env, encoding: 'utf8', stdio: 'pipe' }).trim()
    return new Map(
      output.split('\n').map((line) => {
        const [leafId, paneId] = line.split(' ')
        return [Number(leafId), paneId]
      })
    )
  }

  // Every leaf runs its command and then records the pane it ran in
  function withMarkers(tree: Pane): Pane {
    const copy: Pane = structuredClone(tree)
    for (const pane of leaves(copy)) {
      const marker = `echo "$TMUX_PANE" > ${join(dir, `ran-${pane.id}`)}`
      pane.command = pane.command ? `${pane.command}\n${marker}` : marker
    }
    return copy
  }

  async function waitForMarkers(tree: Pane) {
    const markers = leaves(tree).map((pane) => join(dir, `ran-${pane.id}`))
    for (let i = 0; i < 100 && !markers.every((m) => existsSync(m)); i++) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }

  const layouts: [string, Pane][] = [
    ['a single pane', leaf(0)],
    ['two panes side by side', split(0, 'horizontal', [leaf(1), leaf(2)])],
    ['two panes stacked', split(0, 'vertical', [leaf(1), leaf(2)])],
    ['three panes side by side', split(0, 'horizontal', [leaf(1), leaf(2), leaf(3)])],
    ['four panes stacked', split(0, 'vertical', [leaf(1), leaf(2), leaf(3), leaf(4)])],
    [
      'a split in the first pane',
      split(0, 'horizontal', [split(1, 'vertical', [leaf(3), leaf(4)]), leaf(2)])
    ],
    [
      'a split in the last pane',
      split(0, 'horizontal', [leaf(1), split(2, 'vertical', [leaf(3), leaf(4)])])
    ],
    [
      'a split in the same direction',
      split(0, 'horizontal', [leaf(1), split(2, 'horizontal', [leaf(3), leaf(4)])])
    ],
    [
      'deeply mixed splits',
      split(0, 'vertical', [
        split(1, 'horizontal', [leaf(4), split(5, 'vertical', [leaf(7), leaf(8)]), leaf(6)]),
        leaf(2),
        split(3, 'horizontal', [
          split(9, 'vertical', [leaf(11), split(12, 'horizontal', [leaf(13), leaf(14)])]),
          leaf(10)
        ])
      ])
    ]
  ]

  it.each(layouts)('lays out %s like the builder', async (_, tree) => {
    const paneIds = runScript(withMarkers(tree))
    await waitForMarkers(tree)

    const [width, height] = tmuxOutput(
      'display-message',
      '-p',
      '-t',
      'test',
      '#{window_width} #{window_height}'
    )
      .split(' ')
      .map(Number)
    const actual = new Map(
      tmuxOutput(
        'list-panes',
        '-t',
        'test',
        '-F',
        '#{pane_id} #{pane_left} #{pane_top} #{pane_width} #{pane_height}'
      )
        .split('\n')
        .map((line) => {
          const [id, x, y, w, h] = line.split(' ')
          return [id, { x: +x, y: +y, w: +w, h: +h }]
        })
    )

    expect(actual.size).toBe(leaves(tree).length)

    for (const [leafId, rect] of expectedRects(tree)) {
      const paneId = paneIds.get(leafId)!
      const pane = actual.get(paneId)
      // Pane borders take a cell, so allow being off by a couple of cells
      const expected = {
        x: rect.x * width,
        y: rect.y * height,
        w: rect.w * width,
        h: rect.h * height
      }

      expect(pane, `pane for leaf ${leafId}`).toBeDefined()
      for (const key of ['x', 'y', 'w', 'h'] as const) {
        expect(Math.abs(pane![key] - expected[key]), `leaf ${leafId} ${key}`).toBeLessThanOrEqual(2)
      }
      expect(readFileSync(join(dir, `ran-${leafId}`), 'utf8').trim(), `leaf ${leafId} ran in`).toBe(
        paneId
      )
    }
  })

  it('types commands exactly as written', async () => {
    const out = join(dir, 'out')
    const tree = split(0, 'horizontal', [
      leaf(1, `printf '%s|' "it's \\$HOME" "a\\"b" > ${out}; echo done;`),
      leaf(2, `echo first > ${out}-2\n\necho second >> ${out}-2`)
    ])

    runScript(withMarkers(tree))
    await waitForMarkers(tree)

    expect(readFileSync(out, 'utf8')).toBe(`it's $HOME|a"b|`)
    expect(readFileSync(`${out}-2`, 'utf8')).toBe('first\nsecond\n')
  })

  it('applies the status bar colors and mouse setting to the session', () => {
    runScript(leaf(0))

    expect(tmuxOutput('show-options', '-t', 'test', '-v', 'status-style')).toBe(
      'fg=#000000,bg=#26A269'
    )
    expect(tmuxOutput('show-options', '-t', 'test', '-v', 'mouse')).toBe('on')
  })

  it('reuses the session when run again instead of creating panes twice', () => {
    const tree = split(0, 'horizontal', [leaf(1), leaf(2)])
    runScript(tree)
    runScript(tree)

    expect(tmuxOutput('list-sessions', '-F', '#{session_name}')).toBe('test')
    expect(tmuxOutput('list-panes', '-t', 'test', '-F', '#{pane_id}').split('\n')).toHaveLength(2)
  })
})
