import { label } from './labels'

export type Direction = '' | 'horizontal' | 'vertical'

export interface Pane {
  id: number
  direction: Direction
  command: string
  items: Pane[]
}

export interface TmuxWindow {
  id: number
  name: string
  rootPane: Pane
}

export interface ScriptOptions {
  sessionName: string
  colors: { txt: string; bg: string }
  showComments: boolean
  mouseInputEnabled: boolean
  checkTmuxInstall: boolean
}

const blocks = {
  is_tmux_installed_check: {
    comment: 'Install tmux if it is missing, and stop if that is not possible',
    code: [
      'if ! command -v tmux >/dev/null 2>&1; then',
      '  if command -v apt-get >/dev/null 2>&1; then',
      '    sudo apt-get update && sudo apt-get install -y tmux',
      '  elif command -v dnf >/dev/null 2>&1; then',
      '    sudo dnf install -y tmux',
      '  elif command -v pacman >/dev/null 2>&1; then',
      '    sudo pacman -S --noconfirm tmux',
      '  elif command -v brew >/dev/null 2>&1; then',
      '    brew install tmux',
      '  fi',
      '',
      '  command -v tmux >/dev/null 2>&1 || {',
      "    echo 'tmux is not installed and could not be installed automatically, install it and run this script again' >&2",
      '    exit 1',
      '  }',
      'fi'
    ].join('\n')
  },
  create_session: {
    comment:
      'Create the session and its layout, unless it already exists (the settings below apply either way)',
    code: 'if ! tmux has-session -t "=$SESSION_NAME" 2>/dev/null; then'
  },
  attach_session: {
    comment: 'Attach to the session (switch to it when already inside tmux)',
    code: [
      'if [ -n "$TMUX" ]; then',
      '  tmux switch-client -t "=$SESSION_NAME"',
      'else',
      '  tmux attach-session -t "=$SESSION_NAME"',
      'fi'
    ].join('\n')
  },
  new_session: {
    comment: 'Create the session sized to the current terminal, so splits have room',
    code: `rootPane=$(tmux new-session -d -s "$SESSION_NAME" -n windowName -x "$(tput cols 2>/dev/null || echo 200)" -y "$(tput lines 2>/dev/null || echo 50)" -P -F '#{pane_id}')`
  },
  new_window: {
    comment: 'Add a window in the background, it gets the session size',
    code: `rootPane=$(tmux new-window -d -t "$SESSION_NAME:" -n windowName -P -F '#{pane_id}')`
  },
  enable_mouse_controls: {
    comment: 'Enable mouse support',
    code: 'tmux set-option -t "$SESSION_NAME" mouse on'
  },
  status_bar_colors: {
    comment: 'Set status bar colors',
    code: `tmux set-option -t "$SESSION_NAME" status-style 'fg=fgColor,bg=bgColor'`
  }
}

type BlockName = keyof typeof blocks

const splitFlags: Record<string, string> = { horizontal: '-h', vertical: '-v' }

/**
 * Translates the windows and their pane trees into a tmux shell script.
 *
 * The first window comes with the session, the others are added in the background so
 * attaching lands on the first one. Commands are sent once every pane exists. All of that
 * is skipped when the session already exists, the settings are applied on every run.
 *
 * Every group node occupies one tmux pane. Its first child keeps that pane and each
 * following child is split off the previous one, taking (remaining / (remaining + 1))
 * of its space, so N children end up equally sized. Splits of a child only divide that
 * child's own area, so recursing afterwards reproduces any nesting.
 *
 * Shell variables are named after the leaf that ends up in the pane ($PANE3 is "Pane 3"),
 * since a group's pane is inherited by its first leaf.
 */
export function generateScript(windows: TmuxWindow[], options: ScriptOptions): string {
  const getBlock = (name: BlockName) =>
    options.showComments ? `# ${blocks[name].comment}\n${blocks[name].code}` : blocks[name].code

  let paneSplits: string[] = []
  const paneCommands: string[] = []

  const traversePaneTree = (pane: Pane) => {
    if (!pane.items?.length) {
      const command = buildPaneCommand(pane)
      if (command) {
        paneCommands.push(command)
      }
      return
    }

    let targetVar = paneVar(firstLeaf(pane))

    pane.items.slice(1).forEach((child, i) => {
      const remaining = pane.items.length - 1 - i
      const size = Math.round((remaining / (remaining + 1)) * 100)
      const newVar = paneVar(firstLeaf(child))

      paneSplits.push(
        `${newVar}=$(tmux split-window ${splitFlags[pane.direction] ?? '-h'} -t "$${targetVar}" -l ${size}% -P -F '#{pane_id}')`
      )
      targetVar = newVar
    })

    pane.items.forEach(traversePaneTree)
  }

  const lines = ['#!/bin/sh']

  if (options.checkTmuxInstall) {
    lines.push(getBlock('is_tmux_installed_check'))
  }

  lines.push(`SESSION_NAME="${options.sessionName}"`)

  const layout: string[] = []

  windows.forEach((window, index) => {
    const name =
      window.name.replace(/\s+/g, ' ').trim() || label('window-default-name', { number: index + 1 })

    layout.push(
      getBlock(index ? 'new_window' : 'new_session')
        .replace('rootPane', paneVar(firstLeaf(window.rootPane)))
        .replace('windowName', () => shellQuote(name))
    )

    paneSplits = []
    traversePaneTree(window.rootPane)

    if (paneSplits.length) {
      const title =
        windows.length > 1 ? `Pane splits of window ${index + 1} (${name})` : 'Pane splits'
      layout.push(section(title, paneSplits, options.showComments))
    }
  })

  if (paneCommands.length) {
    layout.push(section('Pane commands', paneCommands, options.showComments))
  }

  layout.push(`tmux select-pane -t "$${paneVar(firstLeaf(windows[0].rootPane))}"`)

  lines.push(`${getBlock('create_session')}\n${indent(layout.join('\n\n'))}\nfi`)

  lines.push(
    getBlock('status_bar_colors')
      .replace('fgColor', options.colors.txt)
      .replace('bgColor', options.colors.bg)
  )

  if (options.mouseInputEnabled) {
    lines.push(getBlock('enable_mouse_controls'))
  }

  lines.push(getBlock('attach_session'))

  return lines.join('\n\n') + '\n'
}

function buildPaneCommand(pane: Pane): string | null {
  const commandLines = (pane.command ?? '').split('\n').filter((line) => line.trim())

  if (!commandLines.length) {
    return null
  }

  // One "<text> Enter" pair per line, so multi-line commands run line by line
  const keys = commandLines.map((line) => `${shellQuote(tmuxEscape(line))} Enter`).join(' ')

  return `tmux send-keys -t "$${paneVar(pane)}" ${keys}`
}

function indent(text: string): string {
  return text.replace(/^(?=.)/gm, '  ')
}

function section(title: string, lines: string[], showComments: boolean): string {
  return showComments ? [`# ${title}`, ...lines].join('\n') : lines.join('\n')
}

function firstLeaf(pane: Pane): Pane {
  return pane.items?.length ? firstLeaf(pane.items[0]) : pane
}

function paneVar(pane: Pane): string {
  return `PANE${pane.id}`
}

// Wrap in single quotes, so the shell passes the text through untouched
function shellQuote(text: string): string {
  return `'${text.replace(/'/g, `'\\''`)}'`
}

// tmux treats an argument ending in ";" as a command separator, "\;" keeps it literal
function tmuxEscape(text: string): string {
  return text.endsWith(';') ? `${text.slice(0, -1)}\\;` : text
}
