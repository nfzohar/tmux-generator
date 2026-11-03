import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import {
  generateScript,
  tmuxInstallers,
  type Direction,
  type Pane,
  type ScriptOptions,
  type TmuxWindow
} from '../generator'

const leaf = (id: number, command = ''): Pane => ({ id, direction: '', command, items: [] })
const split = (id: number, direction: Direction, items: Pane[]): Pane => ({
  id,
  direction,
  command: '',
  items
})

const options: ScriptOptions = {
  sessionName: 'test',
  colors: { txt: '#000000', bg: '#26A269' },
  windowColors: {},
  showComments: true,
  mouseInputEnabled: false,
  checkTmuxInstall: false,
  tmuxInstaller: 'apt-get'
}

const window = (id: number, name: string, rootPane: Pane): TmuxWindow => ({ id, name, rootPane })

const generateWindows = (windows: TmuxWindow[], overrides: Partial<ScriptOptions> = {}) =>
  generateScript(windows, { ...options, ...overrides })

const generate = (pane: Pane, overrides: Partial<ScriptOptions> = {}) =>
  generateWindows([window(0, 'main', pane)], overrides)

const leaves = (pane: Pane): Pane[] => (pane.items.length ? pane.items.flatMap(leaves) : [pane])

// Trimmed lines, the session's layout is indented inside an if-block
const scriptLines = (script: string) => script.split('\n').map((line) => line.trim())

const linesWith = (script: string, text: string) =>
  scriptLines(script).filter((line) => line.includes(text))

// The if/elif branches of the install check, one per package manager
const managerChecks = (script: string) =>
  scriptLines(script).filter((line) => /^(if|elif) command -v /.test(line))

const splitLine = (newVar: string, flag: string, target: string, size: number) =>
  `${newVar}=$(tmux split-window ${flag} -t "$${target}" -l ${size}% -P -F '#{pane_id}')`

describe('pane splits', () => {
  it('creates the session in the first pane and does not split a single pane', () => {
    const script = generate(leaf(0))

    expect(linesWith(script, 'new-session')[0]).toMatch(/^PANE0=\$\(tmux new-session -d /)
    expect(linesWith(script, 'split-window')).toEqual([])
  })

  it('splits horizontally and vertically with the matching tmux flag', () => {
    expect(linesWith(generate(split(0, 'horizontal', [leaf(1), leaf(2)])), 'split-window')).toEqual(
      [splitLine('PANE2', '-h', 'PANE1', 50)]
    )
    expect(linesWith(generate(split(0, 'vertical', [leaf(1), leaf(2)])), 'split-window')).toEqual([
      splitLine('PANE2', '-v', 'PANE1', 50)
    ])
  })

  it('names the first pane after the first leaf, since a split pane lives on as its first child', () => {
    const script = generate(split(0, 'horizontal', [leaf(1), leaf(2)]))

    expect(linesWith(script, 'new-session')[0]).toMatch(/^PANE1=/)
  })

  it('splits N children off one another so they end up equal', () => {
    expect(
      linesWith(generate(split(0, 'vertical', [leaf(1), leaf(2), leaf(3)])), 'split-window')
    ).toEqual([splitLine('PANE2', '-v', 'PANE1', 67), splitLine('PANE3', '-v', 'PANE2', 50)])

    expect(
      linesWith(
        generate(split(0, 'horizontal', [leaf(1), leaf(2), leaf(3), leaf(4)])),
        'split-window'
      )
    ).toEqual([
      splitLine('PANE2', '-h', 'PANE1', 75),
      splitLine('PANE3', '-h', 'PANE2', 67),
      splitLine('PANE4', '-h', 'PANE3', 50)
    ])
  })

  it('creates all siblings before splitting any of them further', () => {
    // | 3 |   |
    // |---| 2 |
    // | 4 |   |
    const tree = split(0, 'horizontal', [split(1, 'vertical', [leaf(3), leaf(4)]), leaf(2)])

    expect(linesWith(generate(tree), 'split-window')).toEqual([
      splitLine('PANE2', '-h', 'PANE3', 50),
      splitLine('PANE4', '-v', 'PANE3', 50)
    ])
  })

  it('splits a nested pane from the pane it inherited, not from its parent', () => {
    // |   | 3 |
    // | 1 |---|
    // |   | 4 |
    const tree = split(0, 'horizontal', [leaf(1), split(2, 'vertical', [leaf(3), leaf(4)])])

    expect(linesWith(generate(tree), 'split-window')).toEqual([
      splitLine('PANE3', '-h', 'PANE1', 50),
      splitLine('PANE4', '-v', 'PANE3', 50)
    ])
  })

  it('creates every pane exactly once, before anything uses it, for any windows', () => {
    let seed = 1
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647

    for (let run = 0; run < 200; run++) {
      let nextId = 0
      const build = (depth: number): Pane => {
        const id = nextId++
        if (depth > 3 || random() < 0.4) {
          return leaf(id, `cmd ${id}`)
        }
        const count = 2 + Math.floor(random() * 3)
        const direction = random() < 0.5 ? 'horizontal' : 'vertical'
        return split(
          id,
          direction,
          Array.from({ length: count }, () => build(depth + 1))
        )
      }

      const windows = Array.from({ length: 1 + Math.floor(random() * 3) }, (_, i) =>
        window(i, `w${i}`, build(0))
      )
      const allLeaves = windows.flatMap((w) => leaves(w.rootPane))
      const script = generateWindows(windows)

      const defined = new Set<string>()
      for (const line of scriptLines(script)) {
        for (const [, used] of line.matchAll(/"\$(PANE\d+)"/g)) {
          expect(defined, `${used} used before it exists`).toContain(used)
        }
        const assigned = line.match(/^(PANE\d+)=/)?.[1]
        if (assigned) {
          expect(defined, `${assigned} created twice`).not.toContain(assigned)
          defined.add(assigned)
        }
      }

      expect([...defined].sort()).toEqual(allLeaves.map((pane) => `PANE${pane.id}`).sort())
      expect(linesWith(script, 'new-window')).toHaveLength(windows.length - 1)
      expect(linesWith(script, 'split-window')).toHaveLength(allLeaves.length - windows.length)
      expect(linesWith(script, 'send-keys')).toHaveLength(allLeaves.length)
    }
  })
})

describe('windows', () => {
  const editor = window(0, 'editor', split(0, 'horizontal', [leaf(1, 'vim'), leaf(2)]))
  const server = window(1, 'server', split(3, 'vertical', [leaf(4, 'npm run dev'), leaf(5)]))
  const logs = window(2, 'logs', leaf(6, 'tail -f app.log'))

  it('names the first window when creating the session', () => {
    expect(linesWith(generate(leaf(0)), 'new-session')[0]).toContain(
      `tmux new-session -d -s "$SESSION_NAME" -n 'main' `
    )
  })

  it('adds every other window in the background, in order', () => {
    expect(linesWith(generateWindows([editor, server, logs]), 'new-window')).toEqual([
      `PANE4=$(tmux new-window -d -t "$SESSION_NAME:" -n 'server' -P -F '#{pane_id}')`,
      `PANE6=$(tmux new-window -d -t "$SESSION_NAME:" -n 'logs' -P -F '#{pane_id}')`
    ])
  })

  it('splits each window right after creating it, within its own panes', () => {
    const script = generateWindows([editor, server])
    const lines = scriptLines(script)
    const index = (text: string) => lines.findIndex((line) => line.includes(text))

    expect(linesWith(script, 'split-window')).toEqual([
      splitLine('PANE2', '-h', 'PANE1', 50),
      splitLine('PANE5', '-v', 'PANE4', 50)
    ])
    expect(index('new-session')).toBeLessThan(index('PANE2='))
    expect(index('PANE2=')).toBeLessThan(index('new-window'))
    expect(index('new-window')).toBeLessThan(index('PANE5='))
  })

  it('sends commands once every window exists', () => {
    const lines = scriptLines(generateWindows([editor, server, logs]))
    const lastCreated = lines.findLastIndex((line) => /^PANE\d+=/.test(line))
    const firstCommand = lines.findIndex((line) => line.includes('send-keys'))

    expect(firstCommand).toBeGreaterThan(lastCreated)
    expect(lines.filter((line) => line.includes('send-keys'))).toEqual([
      `tmux send-keys -t "$PANE1" 'vim' Enter`,
      `tmux send-keys -t "$PANE4" 'npm run dev' Enter`,
      `tmux send-keys -t "$PANE6" 'tail -f app.log' Enter`
    ])
  })

  it('attaches to the first pane of the first window', () => {
    expect(linesWith(generateWindows([editor, server]), 'select-pane')).toEqual([
      'tmux select-pane -t "$PANE1"'
    ])
  })

  it('quotes window names, including characters special to the shell or String.replace', () => {
    const script = generateWindows([window(0, `it's $HOME $' $&`, leaf(0))])

    expect(linesWith(script, 'new-session')[0]).toContain(`-n 'it'\\''s $HOME $'\\'' $&' `)
  })

  it('keeps window names on one line, so the indented layout cannot change them', () => {
    expect(
      linesWith(generateWindows([window(0, 'two\n  lines', leaf(0))]), 'new-session')[0]
    ).toContain(`-n 'two lines' `)
  })

  it('falls back to "Window N" for an empty name', () => {
    expect(
      linesWith(generateWindows([editor, window(1, '  ', leaf(3))]), 'new-window')[0]
    ).toContain(`-n 'Window 2'`)
  })

  it("labels each window's splits when there is more than one window", () => {
    const script = generateWindows([editor, server])

    expect(script).toContain('# Pane splits of window 1 (editor)')
    expect(script).toContain('# Pane splits of window 2 (server)')
    expect(generate(editor.rootPane)).toContain('# Pane splits\n')
  })
})

describe('pane commands', () => {
  const commandLines = (command: string) =>
    linesWith(generate(split(0, 'horizontal', [leaf(1, command), leaf(2)])), 'send-keys')

  it('sends each command to its own pane and skips panes without one', () => {
    const tree = split(0, 'horizontal', [leaf(1, 'htop'), leaf(2), leaf(3, 'npm run dev')])

    expect(linesWith(generate(tree), 'send-keys')).toEqual([
      `tmux send-keys -t "$PANE1" 'htop' Enter`,
      `tmux send-keys -t "$PANE3" 'npm run dev' Enter`
    ])
  })

  it('quotes commands so the shell passes them through unchanged', () => {
    expect(commandLines(`echo "it's $HOME"`)).toEqual([
      `tmux send-keys -t "$PANE1" 'echo "it'\\''s $HOME"' Enter`
    ])
  })

  it('runs multi-line commands line by line and drops blank lines', () => {
    expect(commandLines('cd app\n\n  \nnpm run dev')).toEqual([
      `tmux send-keys -t "$PANE1" 'cd app' Enter 'npm run dev' Enter`
    ])
  })

  it('escapes a trailing semicolon, which tmux would read as a command separator', () => {
    expect(commandLines('echo done;')).toEqual([`tmux send-keys -t "$PANE1" 'echo done\\;' Enter`])
  })
})

describe('script options', () => {
  const tree = split(0, 'horizontal', [leaf(1, 'htop'), leaf(2)])

  it('starts with a shebang, sets the session name and ends by attaching', () => {
    const script = generate(tree, { sessionName: 'my_session' })

    expect(script.startsWith('#!/bin/sh\n')).toBe(true)
    expect(script).toContain('SESSION_NAME="my_session"')
    expect(script.endsWith('  tmux attach-session -t "=$SESSION_NAME"\nfi\n')).toBe(true)
    expect(script).toContain('if [ -n "$TMUX" ]; then\n  tmux switch-client -t "=$SESSION_NAME"')
  })

  it('creates the session and its layout only when it does not exist yet', () => {
    const script = generate(tree, { mouseInputEnabled: true })
    const lines = script.split('\n')
    const ifLine = lines.indexOf('if ! tmux has-session -t "=$SESSION_NAME" 2>/dev/null; then')
    const fiLine = lines.indexOf('fi')
    const inside = lines.slice(ifLine + 1, fiLine)
    const after = lines.slice(fiLine + 1)

    expect(ifLine).toBeGreaterThan(0)
    expect(inside.filter((line) => line).every((line) => line.startsWith('  '))).toBe(true)
    for (const text of ['new-session', 'split-window', 'send-keys', 'select-pane']) {
      expect(
        inside.some((line) => line.includes(text)),
        text
      ).toBe(true)
      expect(
        after.some((line) => line.includes(text)),
        text
      ).toBe(false)
    }
  })

  it('applies the settings on every run, also to an existing session', () => {
    const lines = generate(tree, { mouseInputEnabled: true }).split('\n')
    const fiLine = lines.indexOf('fi')

    expect(lines.findIndex((line) => line.includes('status-style'))).toBeGreaterThan(fiLine)
    expect(lines.findIndex((line) => line.includes('mouse on'))).toBeGreaterThan(fiLine)
  })

  it('sets the status bar colors on the session only', () => {
    expect(generate(tree, { colors: { txt: '#ffffff', bg: '#3355ff' } })).toContain(
      `tmux set-option -t "$SESSION_NAME" status-style 'fg=#ffffff,bg=#3355ff'`
    )
  })

  it('lets the active window pick the status bar colors when windows have their own', () => {
    const windows = [
      window(0, 'one', leaf(0)),
      window(4, 'two', leaf(1)),
      window(7, 'three', leaf(2))
    ]
    const script = generateWindows(windows, {
      windowColors: { 4: { txt: '#ffffff', bg: '#3355ff' }, 99: { txt: '#000000', bg: '#ff0000' } }
    })

    expect(linesWith(script, 'status-style')).toEqual([
      `tmux set-option -t "$SESSION_NAME" status-style '#{?@status-style,#{@status-style},fg=#000000 bg=#26A269}'`,
      `[ -n "\${1}" ] && tmux set-option -wu -t "\${1}" @status-style`,
      `[ -n "\${2}" ] && tmux set-option -w -t "\${2}" @status-style 'fg=#ffffff,bg=#3355ff'`,
      `[ -n "\${3}" ] && tmux set-option -wu -t "\${3}" @status-style`
    ])
    expect(script).toContain(`set -- $(tmux list-windows -t "=$SESSION_NAME" -F '#{window_id}')`)
  })

  it('keeps one status bar color when no window has its own', () => {
    const script = generate(tree, { windowColors: { 99: { txt: '#000000', bg: '#ff0000' } } })

    expect(linesWith(script, 'status-style')).toEqual([
      `tmux set-option -t "$SESSION_NAME" status-style 'fg=#000000,bg=#26A269'`
    ])
    expect(script).not.toContain('list-windows')
  })

  it('braces the position of the tenth window and later', () => {
    const windows = Array.from({ length: 10 }, (_, id) => window(id, `w${id}`, leaf(id)))
    const script = generateWindows(windows, {
      windowColors: { 9: { txt: '#000000', bg: '#ff0000' } }
    })

    expect(script).toContain(`[ -n "\${10}" ] && tmux set-option -w -t "\${10}" @status-style`)
    expect(spawnSync('sh', ['-n'], { input: script }).status).toBe(0)
  })

  it('adds the mouse and install check blocks only when enabled', () => {
    expect(generate(tree)).not.toContain('mouse on')
    expect(generate(tree)).not.toContain('command -v tmux')

    const script = generate(tree, { mouseInputEnabled: true, checkTmuxInstall: true })
    expect(script).toContain('tmux set-option -t "$SESSION_NAME" mouse on')
    expect(script).toContain('command -v tmux >/dev/null 2>&1 ||')
  })

  it('installs tmux only with the chosen package manager', () => {
    const script = generate(tree, { checkTmuxInstall: true, tmuxInstaller: 'dnf' })

    expect(managerChecks(script)).toEqual(['if command -v dnf >/dev/null 2>&1; then'])
    expect(script).toContain('as_root dnf install -y tmux')
    expect(script).not.toContain('apt-get')
  })

  it('tries every package manager in order when detecting one', () => {
    const script = generate(tree, { checkTmuxInstall: true, tmuxInstaller: 'auto' })

    expect(managerChecks(script)).toEqual(
      Object.keys(tmuxInstallers).map(
        (manager, index) => `${index ? 'elif' : 'if'} command -v ${manager} >/dev/null 2>&1; then`
      )
    )
  })

  it.each([...Object.keys(tmuxInstallers), 'auto'] as const)(
    'writes valid shell for the %s install check',
    (installer) => {
      const script = generate(tree, {
        checkTmuxInstall: true,
        tmuxInstaller: installer as ScriptOptions['tmuxInstaller']
      })
      const result = spawnSync('sh', ['-n'], { input: script, encoding: 'utf8' })

      expect(result.status, result.stderr).toBe(0)
    }
  )

  it('leaves out every comment when comments are off', () => {
    const script = generate(tree, {
      showComments: false,
      mouseInputEnabled: true,
      checkTmuxInstall: true
    })

    expect(scriptLines(script).filter((line) => line.startsWith('#'))).toEqual(['#!/bin/sh'])
    expect(
      scriptLines(generate(tree)).filter((line) => line.startsWith('# ')).length
    ).toBeGreaterThan(0)
  })
})
