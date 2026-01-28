<template>
  <button
    class="flex items-center bg-green-700 gap-2 py-1 px-3 hover:bg-green-800 transition-colors rounded-md font-semibold cursor-pointer"
    :title="'Export layout as program'"
    @click.prevent="toggleVisible"
  >
    <i class="fa fa-file" />
    <small v-text="'Export'" />
  </button>

  <div
    v-if="show"
    class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
    @click.prevent="toggleVisible"
  >
    <div class="bg-white dark:bg-gray-900 rounded-lg p-6 w-full mx-64 h-[80vh]" @click.stop>
      <div class="flex items-start gap-5 w-full h-full">
        <div class="flex flex-col gap-3 w-[20%]">
          <h3
            class="text-lg text-center font-semibold text-gray-900 dark:text-white"
            v-text="'Export TMUX Configuration'"
          />

          <div class="flex flex-col gap-5 bg-gray-800 rounded-md p-3 my-1">
            <input-wrapper :label="'Session Name'" :name="'session-name'">
              <input
                v-model="sessionName"
                id="session-name"
                type="text"
                class="block w-full p-2 rounded-md shadow-sm focus:outline-none focus:ring-0 bg-slate-700"
                :placeholder="generatedSessionName"
              />
            </input-wrapper>

            <input-wrapper
              :label="`Add 'Is TMUX installed' check`"
              :label-position="'bottom'"
              :name="'tmux-installed-check'"
              :title="`Check if tmux is installed on your system and install it if missing.`"
              type="checkbox"
            >
              <input
                id="tmux-installed-check"
                v-model="tmuxInstalledCheck"
                type="checkbox"
                class="rounded border-slate-600"
              />
            </input-wrapper>

            <input-wrapper
              :label="'Enable mouse controls'"
              :label-position="'bottom'"
              :name="'mouse-enabled'"
              :title="`Enable managing the layout with mouse input.`"
              type="checkbox"
            >
              <input
                id="mouse-enabled"
                v-model="mouseInputEnabled"
                type="checkbox"
                class="rounded border-slate-600"
              />
            </input-wrapper>

            <input-wrapper
              :label="'Show comments'"
              :label-position="'bottom'"
              :name="'show-comments'"
              :title="`Toggle comments for script commands.`"
              type="checkbox"
            >
              <input
                id="show-comments"
                v-model="showComments"
                type="checkbox"
                class="rounded border-slate-600"
              />
            </input-wrapper>
          </div>

          <button
            class="bg-green-700 gap-2 p-2 hover:bg-green-800 transition-colors rounded-md font-semibold cursor-pointer text-center"
            @click="downloadScriptAsAFile()"
          >
            <i class="fa fa-download pr-2" />
            <small v-text="'Download'" />
          </button>
        </div>

        <div
          class="bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 overflow-hidden rounded-lg p-4 h-full w-[80%]"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium" v-text="'Generated Script'" />

            <button
              class="flex items-center bg-gray-700 gap-2 p-2 hover:bg-blue-800 transition-colors rounded-md font-semibold cursor-pointer"
              @click="copyScriptToClipboard()"
            >
              <i class="fa fa-copy" />
              <small v-text="'Copy'" />
            </button>
          </div>

          <pre
            class="block text-xs font-mono whitespace-pre-wrap overflow-scroll scrollbar-hide h-full pt-1 mt-4"
            v-text="generatedScript"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputWrapper from './InputWrapper.vue'
import blocks from '../assets/codeBlocks'

export default {
  name: 'ExportDialog',

  components: { InputWrapper },

  props: {
    paneTree: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      show: false,
      sessionName: '',
      showComments: true,
      mouseInputEnabled: false,
      tmuxInstalledCheck: false,

      _paneCounter: 0
    }
  },

  computed: {
    statusBarColors() {
      return this.$layout.colors
    },

    generatedSessionName() {
      return `session_${Math.random().toString().slice(2)}`
    },

    tmuxSessionName() {
      return this.sessionName ? this.sessionName.replaceAll(' ', '_') : this.generatedSessionName
    },

    generatedScript() {
      return this.generateTmuxScript()
    }
  },

  methods: {
    generateTmuxScript() {
      const lines = ['#!/bin/bash']
      this._paneCounter = 0

      lines.push(`SESSION_NAME="${this.tmuxSessionName}"`)

      if (this.tmuxInstalledCheck) {
        lines.push(this.getCodeBlock('is_tmux_installed_check'))
      }

      lines.push(`tmux new-session -d -s "$SESSION_NAME"`)

      const rootPane = this.nextPaneVar()
      lines.push(`${rootPane}=$(tmux list-panes -t "$SESSION_NAME" -F '#{pane_id}')`)

      this.walkTree(this.paneTree, rootPane, lines)

      if (this.mouseInputEnabled) {
        lines.push(this.getCodeBlock('enable_mouse_controls'))
      }

      lines.push(
        this.getCodeBlock('status_bar_colors')
          .replace('fgColor', this.statusBarColors?.txt)
          .replace('bgColor', this.statusBarColors?.bg)
      )

      lines.push(`tmux attach-session -t "$SESSION_NAME"`)

      return lines.join('\n\n')
    },


    walkTree(node, currentPaneVar, lines) {
      node = this.unwrap(node)

      if (!node.items || node.items.length === 0) {
        this.emitPaneCommands(node.command, currentPaneVar, lines)
        return
      }

      const splitFlag =
        node.direction === 'horizontal' ? '-h' : node.direction === 'vertical' ? '-v' : null

      if (!splitFlag) {
        node.items.forEach((child) => this.walkTree(child, currentPaneVar, lines))
        return
      }

      this.walkTree(node.items[0], currentPaneVar, lines)

      let activePane = currentPaneVar

      for (let i = 1; i < node.items.length; i++) {
        const newPane = this.nextPaneVar()

        lines.push(
          `${newPane}=$(tmux split-window ${splitFlag} -t ${activePane} -P -F '#{pane_id}')`
        )

        activePane = newPane
        this.walkTree(node.items[i], activePane, lines)
      }
    },

    emitPaneCommands(command, paneVar, lines) {
      if (!command) return

      const commands = Array.isArray(command) ? command : [command]

      commands.forEach((cmd) => {
        lines.push(
          this.showComments
            ? `# Run command\n tmux send-keys -t ${paneVar} "${cmd}" C-m`
            : `tmux send-keys -t ${paneVar} "${cmd}" C-m`
        )
      })
    },

    unwrap(node) {
      return node?._custom?.value ?? node
    },

    nextPaneVar() {
      this._paneCounter++
      return `PANE_${this._paneCounter}`
    },

    getCodeBlock(block) {
      return this.showComments
        ? `# ${blocks[block].comment}\n${blocks[block].code}`
        : blocks[block].code
    },

    downloadScriptAsAFile() {
      const blob = new Blob([this.generatedScript], {
        type: 'text/x-shellscript'
      })
      const a = document.createElement('a')
      const url = URL.createObjectURL(blob)

      a.download = `${this.tmuxSessionName}.sh`
      a.href = url
      a.click()

      URL.revokeObjectURL(url)
    },

    async copyScriptToClipboard() {
      await navigator.clipboard.writeText(this.generatedScript)
    },

    toggleVisible() {
      this.show = !this.show
    }
  }
}
</script>
