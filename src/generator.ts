export type Direction = '' | 'horizontal' | 'vertical'

export interface Pane {
  id: number
  direction: Direction
  command: string
  items: Pane[]
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
    comment: 'Install tmux if missing (ubuntu)',
    code: 'command -v tmux >/dev/null 2>&1 || { sudo apt update && sudo apt install -y tmux; }'
  },
  attach_session: {
    comment: 'Attach to the session (switch to it when already inside tmux)',
    code: [
      'attach() {',
      '  if [ -n "$TMUX" ]; then',
      '    tmux switch-client -t "=$SESSION_NAME"',
      '  else',
      '    tmux attach-session -t "=$SESSION_NAME"',
      '  fi',
      '}'
    ].join('\n')
  },
  reuse_session: {
    comment: 'Reuse the session if it already exists',
    code: 'tmux has-session -t "=$SESSION_NAME" 2>/dev/null && { attach; exit 0; }'
  },
  new_session: {
    comment: 'Create the session sized to the current terminal, so splits have room',
    code: `rootPane=$(tmux new-session -d -s "$SESSION_NAME" -x "$(tput cols 2>/dev/null || echo 200)" -y "$(tput lines 2>/dev/null || echo 50)" -P -F '#{pane_id}')`
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
 * Translates the pane tree into a tmux shell script.
 *
 * Every group node occupies one tmux pane. Its first child keeps that pane and each
 * following child is split off the previous one, taking (remaining / (remaining + 1))
 * of its space, so N children end up equally sized. Splits of a child only divide that
 * child's own area, so recursing afterwards reproduces any nesting.
 *
 * Shell variables are named after the leaf that ends up in the pane ($PANE3 is "Pane 3"),
 * since a group's pane is inherited by its first leaf.
 */
export function generateScript(root: Pane, options: ScriptOptions): string {
  const getBlock = (name: BlockName) =>
    options.showComments ? `# ${blocks[name].comment}\n${blocks[name].code}` : blocks[name].code

  const paneSplits: string[] = []
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

  traversePaneTree(root)

  const lines = ['#!/bin/sh']

  if (options.checkTmuxInstall) {
    lines.push(getBlock('is_tmux_installed_check'))
  }

  lines.push(
    `SESSION_NAME="${options.sessionName}"`,
    getBlock('attach_session'),
    getBlock('reuse_session')
  )

  lines.push(getBlock('new_session').replace('rootPane', paneVar(firstLeaf(root))))

  if (paneSplits.length) {
    lines.push(section('Pane splits', paneSplits, options.showComments))
  }

  if (paneCommands.length) {
    lines.push(section('Pane commands', paneCommands, options.showComments))
  }

  lines.push(
    getBlock('status_bar_colors')
      .replace('fgColor', options.colors.txt)
      .replace('bgColor', options.colors.bg)
  )

  if (options.mouseInputEnabled) {
    lines.push(getBlock('enable_mouse_controls'))
  }

  lines.push(`tmux select-pane -t "$${paneVar(firstLeaf(root))}"`, 'attach')

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
