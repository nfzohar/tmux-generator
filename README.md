# tmux-generator

Build a tmux layout visually and export it as a shell script.

Split panes horizontally or vertically (right-click a pane for 3-way splits), type the
command each pane should run, add more windows from the bottom left (double-click a
window to rename it, × to close it), pick the status bar colors, then export. Running the
exported script creates the session with every window in that exact layout, starts every
command in its pane and attaches to the first window.

If the session already exists, the script leaves its windows and panes alone (so running
it twice doesn't duplicate anything), but still applies the status bar colors and mouse
setting before attaching.

The script needs tmux 3.1 or newer (it sizes splits with `split-window -l N%`).

## How the layout becomes a script

The layout is a tree: a pane either runs a command, or is split in a direction into
child panes. [`src/generator.ts`](src/generator.ts) walks that tree:

- A split pane's first child keeps the tmux pane, each following child is split off the
  previous one and takes `remaining / (remaining + 1)` of its space, so N children end up
  equal (`67%` then `50%` for three).
- Children are only split after all their siblings exist, so nested splits divide just
  their own area.
- `$PANE3` in the script is "Pane 3" in the builder, pane numbers are unique across windows.
- Every window after the first is added with `new-window -d`, so attaching lands on the
  first one, and commands are sent once every window exists.

## Development

Needs Node 22.12+ (`nvm use` picks it up from `.nvmrc`) and Yarn 1, which Corepack
selects automatically from `packageManager`.

```
yarn install
yarn dev          # dev server with hot reload
yarn build        # type-check and production build
yarn test         # generator tests
yarn lint         # lint and fix files
```

`yarn test` runs two suites in `src/__tests__/`: unit tests of the generated script, and
a run of generated scripts against a real, private tmux server that checks every pane's
position, size and command. The tmux suite is skipped when tmux is not installed.
