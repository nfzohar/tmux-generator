import type { App } from 'vue'

// Every text shown in the UI, by slug. {name} placeholders are filled in by label()
export const labels = {
  'app-title': 'Tmux Builder',
  'app-subtitle': 'Build & export your new TMUX layout',
  'document-title': 'Tmux Layout Builder',

  'dialog-ok': 'OK',
  'dialog-cancel': 'Cancel',

  undo: 'Undo',
  'undo-title': 'Undo last change',
  'undo-nothing-title': 'Nothing to undo',
  'undo-nothing-message': 'There are no more changes to undo.',

  reset: 'Reset',
  'reset-title': 'Do full reset',
  'reset-confirm-title': 'Reset the layout?',
  'reset-confirm-message':
    "This deletes every window, pane and command and resets the status bar colors. It can't be undone.",

  export: 'Export',
  'export-title': 'Export layout as program',
  'export-heading': 'Export TMUX Configuration',
  'export-session-name': 'Session Name',
  'export-install-check': "Add 'Is TMUX installed' check",
  'export-install-check-title':
    'Check if tmux is installed on your system and install it if missing.',
  'export-mouse': 'Enable mouse controls',
  'export-mouse-title': 'Enable managing the layout with mouse input.',
  'export-comments': 'Show comments',
  'export-comments-title': 'Toggle comments for script commands.',
  'export-download': 'Download',
  'export-script': 'Generated Script',
  'export-copy': 'Copy',
  'export-copied': 'Copied',

  pane: 'Pane',
  'pane-title': 'Pane {id}',
  'pane-command-placeholder': 'Enter command...',
  'pane-split-horizontally': 'Split horizontally',
  'pane-split-horizontally-title': 'Split this pane horizontally',
  'pane-split-vertically': 'Split vertically',
  'pane-split-vertically-title': 'Split this pane vertically',
  'pane-split-in-horizontally': 'Split in {count} horizontally',
  'pane-split-in-vertically': 'Split in {count} vertically',

  'window-default-name': 'Window {number}',
  'window-add': 'Add new window',
  'window-tab-title': 'Click to open, double-click to rename',
  'window-close': 'Close {name}',
  'window-name-input': 'Window {number} name',

  'status-text-color': 'Text',
  'status-text-color-title': 'Select status bar foreground color',
  'status-background-color': 'Background',
  'status-background-color-title': 'Select status bar background color',
  'status-preview-title': 'Status bar custom color preview',

  'theme-switch-to-light': 'Switch to light theme',
  'theme-switch-to-dark': 'Switch to dark theme'
}

export type LabelSlug = keyof typeof labels

/** The text for slug, with {name} placeholders filled in from params */
export function label(slug: LabelSlug, params: Record<string, string | number> = {}): string {
  return labels[slug].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder
  )
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $label: typeof label
  }
}

// Makes label() available in templates as $label()
export default {
  install: (app: App) => {
    app.config.globalProperties.$label = label
  }
}
