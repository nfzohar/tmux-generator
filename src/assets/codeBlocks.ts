export default {
  name_session: {
    comment: 'Start new tmux session',
    code: 'tmux new-session -d -s "$SESSION_NAME"'
  },
  attach_session: {
    comment: 'Attach tmux session',
    code: 'tmux attach-session -t "$SESSION_NAME"'
  },
  is_tmux_installed_check: {
    comment: 'Install tmux if missing (ubuntu)',
    code: 'command -v tmux >/dev/null 2>&1 || { sudo apt update && sudo apt install -y tmux; }'
  },
  set_root: {
    comment: 'Enable mouse support',
    code: 'tmux set -g mouse on'
  },
  enable_mouse_controls: {
    comment: 'Enable mouse support',
    code: 'tmux set -g mouse on'
  }
}
