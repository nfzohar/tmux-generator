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
    "This deletes every window, pane and command and resets all status bar colors. It can't be undone.",

  export: 'Export',
  'export-title': 'Export layout as program',
  'export-heading': 'Export TMUX Configuration',
  'export-session-name': 'Session Name',
  'export-install-check': "Add 'Is TMUX installed' check",
  'export-install-check-title':
    'Check if tmux is installed on your system and install it if missing.',
  'export-mouse': 'Enable mouse controls',
  'export-mouse-title': 'Enable managing the layout with mouse input.',
  'export-installer': 'Distro',
  'export-installer-title': 'Package manager the install check uses to install tmux',
  'export-comments': 'Show comments',
  'export-comments-title': 'Toggle comments for script commands.',
  'export-download': 'Download',
  'export-script': 'Generated Script',
  'export-copy': 'Copy',
  'export-copied': 'Copied',

  'installer-apt-get': 'Ubuntu / Debian (apt)',
  'installer-dnf': 'Fedora / RHEL 8+ (dnf)',
  'installer-yum': 'CentOS 7 / older RHEL (yum)',
  'installer-pacman': 'Arch / Manjaro (pacman)',
  'installer-zypper': 'openSUSE (zypper)',
  'installer-apk': 'Alpine (apk)',
  'installer-xbps-install': 'Void (xbps)',
  'installer-emerge': 'Gentoo (emerge)',
  'installer-pkg': 'FreeBSD / Termux (pkg)',
  'installer-brew': 'macOS, Homebrew (brew)',
  'installer-port': 'macOS, MacPorts (port)',
  'installer-auto': 'Any (detect package manager)',

  pane: 'Pane',
  'pane-title': 'Pane {id}',
  'pane-command-placeholder': 'Enter command...',
  'pane-split-horizontally': 'Split horizontally',
  'pane-split-horizontally-title': 'Split this pane horizontally',
  'pane-split-vertically': 'Split vertically',
  'pane-split-vertically-title': 'Split this pane vertically',
  'pane-presets': 'Select a preset',
  'pane-split-grid': 'Custom pane split',
  'pane-more-title': 'More split options',

  'preset-dialog-title': 'Layout presets',
  'preset-dialog-subtitle':
    'Pick a layout to split this pane into. Its command moves to the top left pane.',
  'preset-main-side': 'Main + side stack',
  'preset-main-bottom': 'Main + bottom row',
  'preset-main-side-three': 'Main + three stacked',
  'preset-three-columns': 'Three columns',
  'preset-three-rows': 'Three rows',
  'preset-tiled': 'Tiled 2 × 2',

  'split-dialog-title': 'Custom pane split',
  'split-dialog-subtitle':
    'Split this pane into custom number of columns and rows. Its command moves to the top left pane.',
  'split-dialog-columns': 'Columns',
  'split-dialog-rows': 'Rows',
  'split-dialog-count': '{count} panes',
  'split-dialog-confirm': 'Split',

  'window-default-name': 'Window {number}',
  'window-add': 'Add new window',
  'window-tab-title': 'Click to open, double-click to rename',
  'window-close': 'Close {name}',
  'window-name-input': 'Window {number} name',

  'status-per-window': 'Per window',
  'status-per-window-title':
    'Give each window its own status bar colors, the pickers then set the open window',
  'status-text-color': 'Text',
  'status-text-color-title': 'Select status bar foreground color',
  'status-background-color': 'Bar',
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
