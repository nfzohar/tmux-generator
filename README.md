# tmux-generator

Build a tmux layout visually and export it as a shell script.

Split panes horizontally or vertically (right-click a pane for 3-way splits), type the
command each pane should run, pick the status bar colors, then export. Running the
exported script creates the session with that exact layout, starts every command in its
pane and attaches to it (or reuses the session if it already exists).

The script needs tmux 3.1 or newer (it sizes splits with `split-window -l N%`).

## How the layout becomes a script

The layout is a tree: a pane either runs a command, or is split in a direction into
child panes. [`src/generator.ts`](src/generator.ts) walks that tree:

- A split pane's first child keeps the tmux pane, each following child is split off the
  previous one and takes `remaining / (remaining + 1)` of its space, so N children end up
  equal (`67%` then `50%` for three).
- Children are only split after all their siblings exist, so nested splits divide just
  their own area.
- `$PANE3` in the script is "Pane 3" in the builder.

## Development

```
yarn install
yarn dev        # dev server with hot reload
yarn build      # production build
yarn lint       # lint and fix files
```
