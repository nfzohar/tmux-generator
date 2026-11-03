// Runs generated scripts against a real, isolated tmux server and checks that the panes
// end up where the builder draws them, with each command running in its own pane.
// Skipped when tmux is not installed.
import { execFileSync, spawnSync } from 'node:child_process'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateScript, type Direction, type Pane, type TmuxWindow } from '../generator'

const tmuxPath = spawnSync('sh', ['-c', 'command -v tmux'], { encoding: 'utf8' }).stdout.trim()

const leaf = (id: number, command = ''): Pane => ({ id, direction: '', command, items: [] })
const split = (id: number, direction: Direction, items: Pane[]): Pane => ({
  id,
  direction,
  command: '',
  items
})
const leaves = (pane: Pane): Pane[] => (pane.items.length ? pane.items.flatMap(leaves) : [pane])
const allLeaves = (windows: TmuxWindow[]) => windows.flatMap((window) => leaves(window.rootPane))
const single = (rootPane: Pane): TmuxWindow[] => [{ id: 0, name: 'main', rootPane }]

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

    // A "tmux" on PATH that talks to a private server without any user config, so the
    // user's sessions and settings neither affect the tests nor get touched by them
    tmux = join(dir, 'tmux')
    writeFileSync(
      tmux,
      `#!/bin/sh\nexec ${tmuxPath} -S "${join(dir, 'socket')}" -f /dev/null "$@"\n`
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
  function runScript(
    windows: TmuxWindow[],
    colors = { txt: '#000000', bg: '#26A269' }
  ): Map<number, string> {
    const script = generateScript(windows, {
      sessionName: 'test',
      colors,
      showComments: true,
      mouseInputEnabled: true,
      checkTmuxInstall: false
    })
    const attachAt = script.lastIndexOf('\n# Attach to the session')
    expect(attachAt).toBeGreaterThan(0)

    const printPaneIds = allLeaves(windows)
      .map((pane) => `echo "${pane.id} $PANE${pane.id}"`)
      .join('\n')
    const path = join(dir, 'script.sh')
    writeFileSync(path, `${script.slice(0, attachAt)}\n${printPaneIds}\n`)

    const output = execFileSync('sh', [path], { env, encoding: 'utf8', stdio: 'pipe' }).trim()
    return new Map(
      output.split('\n').map((line) => {
        const [leafId, paneId] = line.split(' ')
        return [Number(leafId), paneId]
      })
    )
  }

  // Every leaf runs its command and then records the pane it ran in
  function withMarkers(windows: TmuxWindow[]): TmuxWindow[] {
    const copy: TmuxWindow[] = structuredClone(windows)
    for (const pane of allLeaves(copy)) {
      const marker = `echo "$TMUX_PANE" > ${join(dir, `ran-${pane.id}`)}`
      pane.command = pane.command ? `${pane.command}\n${marker}` : marker
    }
    return copy
  }

  async function waitForMarkers(windows: TmuxWindow[]) {
    const markers = allLeaves(windows).map((pane) => join(dir, `ran-${pane.id}`))
    for (let i = 0; i < 100 && !markers.every((m) => existsSync(m)); i++) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }

  // Runs the windows' script and checks every window's name, panes and commands
  async function expectLayout(windows: TmuxWindow[]) {
    const paneIds = runScript(withMarkers(windows))
    await waitForMarkers(windows)

    const tmuxWindows = tmuxOutput(
      'list-windows',
      '-t',
      'test',
      '-F',
      '#{window_index}\t#{window_name}\t#{window_width}\t#{window_height}\t#{window_active}'
    )
      .split('\n')
      .map((line) => {
        const [index, name, width, height, active] = line.split('\t')
        return { index, name, width: +width, height: +height, active: active === '1' }
      })

    expect(tmuxWindows.map((w) => w.name)).toEqual(windows.map((w) => w.name))
    expect(tmuxWindows.map((w) => w.active)).toEqual(windows.map((_, i) => i === 0))

    windows.forEach((window, i) => {
      const { index, width, height } = tmuxWindows[i]
      const actual = new Map(
        tmuxOutput(
          'list-panes',
          '-t',
          `test:${index}`,
          '-F',
          '#{pane_id} #{pane_left} #{pane_top} #{pane_width} #{pane_height}'
        )
          .split('\n')
          .map((line) => {
            const [id, x, y, w, h] = line.split(' ')
            return [id, { x: +x, y: +y, w: +w, h: +h }]
          })
      )

      expect(actual.size, `panes in window ${window.name}`).toBe(leaves(window.rootPane).length)

      for (const [leafId, rect] of expectedRects(window.rootPane)) {
        const paneId = paneIds.get(leafId)!
        const pane = actual.get(paneId)
        // Pane borders take a cell, so allow being off by a couple of cells
        const expected = {
          x: rect.x * width,
          y: rect.y * height,
          w: rect.w * width,
          h: rect.h * height
        }

        expect(pane, `pane for leaf ${leafId} in window ${window.name}`).toBeDefined()
        for (const key of ['x', 'y', 'w', 'h'] as const) {
          expect(Math.abs(pane![key] - expected[key]), `leaf ${leafId} ${key}`).toBeLessThanOrEqual(
            2
          )
        }
        expect(
          readFileSync(join(dir, `ran-${leafId}`), 'utf8').trim(),
          `leaf ${leafId} ran in`
        ).toBe(paneId)
      }
    })
  }

  const layouts: [string, Pane][] = [
    ['a single pane', leaf(0)],
    ['two panes side by side', split(0, 'horizontal', [leaf(1), leaf(2)])],
    ['two panes stacked', split(0, 'vertical', [leaf(1), leaf(2)])],
    ['three panes side by side', split(0, 'horizontal', [leaf(1), leaf(2), leaf(3)])],
    ['four panes stacked', split(0, 'vertical', [leaf(1), leaf(2), leaf(3), leaf(4)])],
    [
      'five panes side by side',
      split(0, 'horizontal', [leaf(1), leaf(2), leaf(3), leaf(4), leaf(5)])
    ],
    [
      'a grid of 3 columns and 2 rows',
      split(0, 'horizontal', [
        split(1, 'vertical', [leaf(4), leaf(5)]),
        split(2, 'vertical', [leaf(6), leaf(7)]),
        split(3, 'vertical', [leaf(8), leaf(9)])
      ])
    ],
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
    await expectLayout(single(tree))
  })

  it('creates every window, in order, with its own layout and commands', async () => {
    await expectLayout([
      {
        id: 0,
        name: 'editor',
        rootPane: split(0, 'horizontal', [leaf(1), split(2, 'vertical', [leaf(3), leaf(4)])])
      },
      {
        id: 1,
        name: "it's a server",
        rootPane: split(5, 'vertical', [leaf(6), leaf(7), leaf(8)])
      },
      { id: 2, name: 'logs', rootPane: leaf(9) }
    ])
  })

  it('types commands exactly as written', async () => {
    const out = join(dir, 'out')
    const windows = single(
      split(0, 'horizontal', [
        leaf(1, `printf '%s|' "it's \\$HOME" "a\\"b" > ${out}; echo done;`),
        leaf(2, `echo first > ${out}-2\n\necho second >> ${out}-2`)
      ])
    )

    runScript(withMarkers(windows))
    await waitForMarkers(windows)

    expect(readFileSync(out, 'utf8')).toBe(`it's $HOME|a"b|`)
    expect(readFileSync(`${out}-2`, 'utf8')).toBe('first\nsecond\n')
  })

  it('applies the status bar colors and mouse setting to the session', () => {
    runScript(single(leaf(0)))

    expect(tmuxOutput('show-options', '-t', 'test', '-v', 'status-style')).toBe(
      'fg=#000000,bg=#26A269'
    )
    expect(tmuxOutput('show-options', '-t', 'test', '-v', 'mouse')).toBe('on')
  })

  it('reuses the session when run again instead of creating windows or panes twice', () => {
    const windows: TmuxWindow[] = [
      { id: 0, name: 'one', rootPane: split(0, 'horizontal', [leaf(1), leaf(2)]) },
      { id: 1, name: 'two', rootPane: leaf(3) }
    ]
    runScript(windows)
    runScript(windows)

    expect(tmuxOutput('list-sessions', '-F', '#{session_name}')).toBe('test')
    expect(tmuxOutput('list-windows', '-t', 'test', '-F', '#{window_name}')).toBe('one\ntwo')
    expect(
      tmuxOutput('list-panes', '-s', '-t', 'test', '-F', '#{pane_id}').split('\n')
    ).toHaveLength(3)
  })

  it('applies changed status bar colors to a session that already exists', () => {
    runScript(single(leaf(0)), { txt: '#000000', bg: '#26A269' })
    runScript(single(leaf(0)), { txt: '#ffffff', bg: '#3355ff' })

    expect(tmuxOutput('show-options', '-t', 'test', '-v', 'status-style')).toBe(
      'fg=#ffffff,bg=#3355ff'
    )
  })
})

describe.skipIf(!tmuxPath)('tmux install check in the generated script', () => {
  let dir: string
  let log: string

  const script = () =>
    generateScript(single(leaf(0)), {
      sessionName: 'test',
      colors: { txt: '#000000', bg: '#26A269' },
      showComments: true,
      mouseInputEnabled: false,
      checkTmuxInstall: true
    })

  const executable = (path: string, body: string) => {
    writeFileSync(path, `#!/bin/sh\n${body}\n`)
    chmodSync(path, 0o755)
  }

  // A tmux on PATH that talks to a private server
  const fakeTmux = () => `exec ${tmuxPath} -S "${join(dir, 'socket')}" -f /dev/null "$@"`

  // Package manager stub that logs its call, and "installs" tmux when asked for it
  const packageManager = (name: string, exitCode = 0) =>
    executable(
      join(dir, 'bin', name),
      [
        `echo "${name} $*" >> "${log}"`,
        `[ ${exitCode} -eq 0 ] || exit ${exitCode}`,
        `case "$*" in *tmux) /bin/cp "${join(dir, 'tmux')}" "${join(dir, 'installed', 'tmux')}" ;; esac`
      ].join('\n')
    )

  // Runs the script without its final attach, with only the stubs on PATH
  const run = () => {
    const generated = script()
    const path = join(dir, 'script.sh')
    writeFileSync(
      path,
      generated.slice(0, generated.lastIndexOf('\n# Attach to the session')) + '\n'
    )
    return spawnSync('/bin/sh', [path], {
      encoding: 'utf8',
      env: { HOME: dir, PATH: `${join(dir, 'bin')}:${join(dir, 'installed')}`, SHELL: '/bin/sh' }
    })
  }

  const calls = () => (existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n') : [])

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'tmux-generator-'))
    log = join(dir, 'calls.log')
    for (const sub of ['bin', 'installed']) mkdirSync(join(dir, sub))
    executable(join(dir, 'tmux'), fakeTmux())
    executable(join(dir, 'bin', 'sudo'), `echo "sudo $*" >> "${log}"\nexec "$@"`)
  })

  afterEach(() => {
    spawnSync(tmuxPath, ['-S', join(dir, 'socket'), 'kill-server'])
    rmSync(dir, { recursive: true, force: true })
  })

  it.each([
    [
      'apt-get',
      [
        'sudo apt-get update',
        'apt-get update',
        'sudo apt-get install -y tmux',
        'apt-get install -y tmux'
      ]
    ],
    ['dnf', ['sudo dnf install -y tmux', 'dnf install -y tmux']],
    ['pacman', ['sudo pacman -S --noconfirm tmux', 'pacman -S --noconfirm tmux']],
    ['brew', ['brew install tmux']]
  ])('installs a missing tmux with %s, then creates the session', (manager, expectedCalls) => {
    packageManager(manager)

    const result = run()

    expect(result.status, result.stderr).toBe(0)
    expect(calls()).toEqual(expectedCalls)
    expect(
      spawnSync(tmuxPath, ['-S', join(dir, 'socket'), 'list-sessions', '-F', '#{session_name}'], {
        encoding: 'utf8'
      }).stdout.trim()
    ).toBe('test')
  })

  it('installs nothing when tmux is already there', () => {
    packageManager('apt-get')
    executable(join(dir, 'installed', 'tmux'), fakeTmux())

    expect(run().status).toBe(0)
    expect(calls()).toEqual([])
  })

  it.each([
    ['there is no known package manager', () => {}],
    ['the install fails', () => packageManager('apt-get', 100)]
  ])('stops with a clear message when %s', (_, setup) => {
    setup()

    const result = run()

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      'tmux is not installed and could not be installed automatically'
    )
    expect(result.stderr).not.toContain('not found')
  })
})
