import { describe, expect, it } from 'vitest'
import { generateScript, type Direction, type Pane, type ScriptOptions } from '../generator'

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
  showComments: true,
  mouseInputEnabled: false,
  checkTmuxInstall: false
}

const generate = (pane: Pane, overrides: Partial<ScriptOptions> = {}) =>
  generateScript(pane, { ...options, ...overrides })

const linesWith = (script: string, text: string) =>
  script.split('\n').filter((line) => line.includes(text))

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

  it('creates every pane exactly once, before anything uses it, for any tree', () => {
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

      const tree = build(0)
      const leaves = (pane: Pane): Pane[] =>
        pane.items.length ? pane.items.flatMap(leaves) : [pane]
      const script = generate(tree)

      const defined = new Set<string>()
      for (const line of script.split('\n')) {
        for (const [, used] of line.matchAll(/"\$(PANE\d+)"/g)) {
          expect(defined, `${used} used before it exists`).toContain(used)
        }
        const assigned = line.match(/^(PANE\d+)=/)?.[1]
        if (assigned) {
          expect(defined, `${assigned} created twice`).not.toContain(assigned)
          defined.add(assigned)
        }
      }

      expect([...defined].sort()).toEqual(
        leaves(tree)
          .map((pane) => `PANE${pane.id}`)
          .sort()
      )
      expect(linesWith(script, 'split-window')).toHaveLength(leaves(tree).length - 1)
      expect(linesWith(script, 'send-keys')).toHaveLength(leaves(tree).length)
    }
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
    expect(script.endsWith('\nattach\n')).toBe(true)
  })

  it('reuses an existing session instead of creating it again', () => {
    expect(generate(tree)).toContain(
      'tmux has-session -t "=$SESSION_NAME" 2>/dev/null && { attach; exit 0; }'
    )
  })

  it('sets the status bar colors on the session only', () => {
    expect(generate(tree, { colors: { txt: '#ffffff', bg: '#3355ff' } })).toContain(
      `tmux set-option -t "$SESSION_NAME" status-style 'fg=#ffffff,bg=#3355ff'`
    )
  })

  it('adds the mouse and install check blocks only when enabled', () => {
    expect(generate(tree)).not.toContain('mouse on')
    expect(generate(tree)).not.toContain('command -v tmux')

    const script = generate(tree, { mouseInputEnabled: true, checkTmuxInstall: true })
    expect(script).toContain('tmux set-option -t "$SESSION_NAME" mouse on')
    expect(script).toContain('command -v tmux >/dev/null 2>&1 ||')
  })

  it('leaves out every comment when comments are off', () => {
    const script = generate(tree, {
      showComments: false,
      mouseInputEnabled: true,
      checkTmuxInstall: true
    })

    expect(script.split('\n').filter((line) => line.startsWith('#'))).toEqual(['#!/bin/sh'])
    expect(
      generate(tree)
        .split('\n')
        .filter((line) => line.startsWith('# ')).length
    ).toBeGreaterThan(0)
  })
})
