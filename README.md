# tmux-generator

Build a tmux layout visually and export it as a shell script that recreates it.

Split panes, type the command each pane should run, add windows, pick the status bar
colors, then download the script. Running it opens a tmux session with every window and
pane in place and every command already running.

## Using the builder

- **Split a pane** with the buttons in its header, horizontally (side by side) or
  vertically (stacked). Right-click a pane (or tap its `⋮` button on a touchscreen) for
  more:
  - **Select a preset**: common layouts like a main pane with a side stack.
  - **Custom pane split**: any number of columns and rows. Each pane needs at least a
    line and a column of your terminal, so a grid too big for it stops the script with
    tmux's "no space for new pane".
  - **Reset**: the same full reset as the button in the header.
- **Type a command** into a pane. Several lines run one after another.
- **Windows** are in the bottom left: `+` to the right of the tabs adds one, click a tab
  to open it, double-click to rename it, `×` to close it.
- **Status bar colors** are the Text and Bar pickers in the bottom right. The
  preview next to them shows the result. Tick **Per window** to give each window its own
  colors: the pickers then set the open window, and tmux switches the whole status bar to
  a window's colors while it's active. Windows you haven't colored keep the session
  colors. Unticking keeps the window colors for later, but exports one color for all.
- **Undo** steps back through splits, command edits and window changes. **Reset** starts
  over.
- **Export** shows the script, ready to copy or download.

The builder starts in your browser's light or dark theme. The sun/moon button next to the
clock in the bottom right switches between them.

### Export options

| Option | What it does |
| --- | --- |
| Session name | Name of the tmux session. Spaces and characters tmux doesn't allow become `_`. Left empty, a random `session_…` name is used. |
| Is TMUX installed check | Installs tmux when it's missing, with the package manager of the **Distro** picked below it (Ubuntu / Debian by default). **Any** tries each package manager in turn: `apt-get`, `dnf`, `yum`, `pacman`, `zypper`, `apk`, `xbps-install`, `emerge`, `pkg`, `brew`, `port`. Installs run with `sudo`, or `doas` when there's no `sudo`, unless the script already runs as root (Homebrew never runs as root). If installing isn't possible, the script stops with a message instead of running without tmux. |
| Enable mouse controls | Turns on `mouse` for the session. |
| Show comments | Explains each part of the script in comments. |

## Running the exported script

```sh
sh myproject.sh
```

The script:

1. Creates the session with every window and its panes, sized to your terminal.
2. Starts each pane's command.
3. Applies the status bar colors (and mouse support, if enabled).
4. Attaches to the first window, or switches to it when you're already inside tmux.

When the session already exists, step 1 and 2 are skipped, so running the script again
doesn't duplicate anything. The settings are applied either way, so changed colors still
take effect. To rebuild the layout from scratch, end the session first with
`tmux kill-session -t <name>`.

Requires tmux 3.1 or newer.

### Example

Two windows: `editor`, split into two panes, and `server`.

```sh
#!/bin/sh

SESSION_NAME="myproject"

# Create the session and its layout, unless it already exists (the settings below apply either way)
if ! tmux has-session -t "=$SESSION_NAME" 2>/dev/null; then
  # Create the session sized to the current terminal, so splits have room
  PANE1=$(tmux new-session -d -s "$SESSION_NAME" -n 'editor' -x "$(tput cols 2>/dev/null || echo 200)" -y "$(tput lines 2>/dev/null || echo 50)" -P -F '#{pane_id}')

  # Pane splits of window 1 (editor)
  PANE2=$(tmux split-window -h -t "$PANE1" -l 50% -P -F '#{pane_id}')

  # Add a window in the background, it gets the session size
  PANE3=$(tmux new-window -d -t "$SESSION_NAME:" -n 'server' -P -F '#{pane_id}')

  # Pane commands
  tmux send-keys -t "$PANE1" 'vim .' Enter
  tmux send-keys -t "$PANE2" 'git status' Enter
  tmux send-keys -t "$PANE3" 'npm run dev' Enter

  tmux select-pane -t "$PANE1"
fi

# Set status bar colors
tmux set-option -t "$SESSION_NAME" status-style 'fg=#000000,bg=#26a269'

# Enable mouse support
tmux set-option -t "$SESSION_NAME" mouse on

# Attach to the session (switch to it when already inside tmux)
if [ -n "$TMUX" ]; then
  tmux switch-client -t "=$SESSION_NAME"
else
  tmux attach-session -t "=$SESSION_NAME"
fi
```

## How the layout becomes a script

Each window holds a tree: a pane either runs a command, or is split in one direction
into child panes. [`src/generator.ts`](src/generator.ts) walks that tree:

- A split pane's first child keeps its tmux pane. Each following child is split off the
  previous one and takes `remaining / (remaining + 1)` of its space, so N children end up
  equal (`67%` then `50%` for three).
- Children are only split after all their siblings exist, so a nested split divides just
  its own area.
- `$PANE3` in the script is "Pane 3" in the builder. Pane numbers are unique across
  windows.
- Windows after the first are added with `new-window -d`, so attaching lands on the
  first one. Commands are sent once every window exists.
- Commands and window names are single-quoted, so the shell passes them through unchanged.

## Development

Needs Node 22.12+ (`nvm use` picks it up from `.nvmrc`) and Yarn 1, which Corepack
selects automatically from `packageManager`.

```sh
yarn install
yarn dev          # dev server with hot reload
yarn build        # type-check and production build
yarn test         # generator and store tests
yarn lint         # lint and fix files
yarn format       # format src/ with Prettier
```

Built with Vue 3, Pinia, Tailwind CSS 4 and Vite.

| Path | Contents |
| --- | --- |
| `src/generator.ts` | Turns windows and pane trees into the shell script |
| `src/stores/layout.ts` | Windows, pane trees, colors and undo history |
| `src/labels.ts` | Every text shown in the UI, by slug, used as `$label('slug')` in templates |
| `src/components/PreviewPane.vue` | A pane in the builder, drawn recursively for splits |
| `src/presets.ts` | The preset layouts, and the grid layout for a column and row count |
| `src/components/PresetDialog.vue` | Preset picker for splitting a pane |
| `src/components/SplitDialog.vue` | Column and row counts for splitting a pane into a grid |
| `src/components/StatusBar.vue` | Window tabs and status bar colors |
| `src/components/ExportDialog.vue` | Export options, script preview, copy and download |
| `src/__tests__/` | Generator and layout store tests |

### Tests

`yarn test` runs three suites:

- **Unit tests** check the generated script line by line: split sizes and order, window
  creation, quoting, export options, and on 200 random layouts that every pane is created
  once and before it's used.
- **Layout store tests** check that splitting a pane, into a row, a column, a grid or
  each preset, builds the right pane tree in one undo step, and that the color pickers set
  the session or the open window.
- **tmux tests** run generated scripts on a private tmux server and check every window's
  name, every pane's position and size, that each command ran in its own pane, and that
  re-running a script reuses the session while applying new colors, per window too. They
  are skipped when tmux isn't installed.

`vercel.json` serves the production build as a single-page app on Vercel.
