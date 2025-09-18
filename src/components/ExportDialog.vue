<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="$emit('close')"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      @click.stop
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Export tmux Configuration
        </h3>
        <button
          @click="$emit('close')"
          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div class="flex gap-2">
          <button
            v-for="format in exportFormats"
            :key="format.id"
            @click="selectedExportFormat = format.id"
            :class="[
              'px-3 py-2 text-sm rounded-md transition-colors',
              selectedExportFormat === format.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ format.name }}
          </button>
        </div>

        <div class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Script</span>
            <button
              @click="copyToClipboard(generatedScript)"
              class="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
          <pre class="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto">{{ generatedScript }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExportDialog',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    sessionName: {
      type: String,
      default: 'my-session'
    },
    mouseEnabled: {
      type: Boolean,
      default: false
    },
    panes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedExportFormat: 'bash',
      exportFormats: [
        { id: 'bash', name: 'Bash Script' },
        { id: 'commands', name: 'Manual Commands' },
        { id: 'json', name: 'JSON Config' }
      ]
    }
  },
  computed: {
    generatedScript() {
      if (this.selectedExportFormat === 'bash') {
        return this.generateBashScript()
      } else if (this.selectedExportFormat === 'commands') {
        return this.generateManualCommands()
      } else {
        return this.generateJsonConfig()
      }
    }
  },
  methods: {
    generateBashScript() {
      let script = '#!/bin/bash\n\n'
      script += `# tmux session: ${this.sessionName}\n\n`

      if (this.mouseEnabled) {
        script += 'tmux set -g mouse on\n'
      }

      script += `tmux new-session -d -s "${this.sessionName}"\n\n`

      if (this.panes.length > 0) {
        const firstPane = this.panes[0]
        if (firstPane.command) {
          script += `tmux send-keys -t "${this.sessionName}:0.0" "${firstPane.command}" Enter\n`
        }

        for (let i = 1; i < this.panes.length; i++) {
          const pane = this.panes[i]
          const splitDirection = pane.splitDirection === 'vertical' ? '-v' : '-h'
          script += `tmux split-window ${splitDirection} -t "${this.sessionName}:0"\n`
          if (pane.command) {
            script += `tmux send-keys -t "${this.sessionName}:0.${i}" "${pane.command}" Enter\n`
          }
        }
      }

      script += `\ntmux attach-session -t "${this.sessionName}"\n`
      return script
    },
    generateManualCommands() {
      let commands = `# Manual tmux commands for session: ${this.sessionName}\n\n`

      if (this.mouseEnabled) {
        commands += 'tmux set -g mouse on\n'
      }

      commands += `tmux new-session -d -s "${this.sessionName}"\n`

      if (this.panes.length > 0) {
        const firstPane = this.panes[0]
        if (firstPane.command) {
          commands += `tmux send-keys -t "${this.sessionName}:0.0" "${firstPane.command}" Enter\n`
        }

        for (let i = 1; i < this.panes.length; i++) {
          const pane = this.panes[i]
          const splitDirection = pane.splitDirection === 'vertical' ? '-v' : '-h'
          commands += `tmux split-window ${splitDirection} -t "${this.sessionName}:0"\n`
          if (pane.command) {
            commands += `tmux send-keys -t "${this.sessionName}:0.${i}" "${pane.command}" Enter\n`
          }
        }
      }

      commands += `tmux attach-session -t "${this.sessionName}"\n`
      return commands
    },
    generateJsonConfig() {
      return JSON.stringify(
        {
          sessionName: this.sessionName,
          mouseEnabled: this.mouseEnabled,
          panes: this.panes
        },
        null,
        2
      )
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text)
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy text: ', err)
      }
    }
  }
}
</script>
