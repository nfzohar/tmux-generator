<template>
  <div
    v-if="showExportDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="showExportDialog = false"
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
          @click="showExportDialog = false"
          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
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

        <div
          class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >Generated Script</span
            >
            <button
              @click="copyToClipboard(generatedScript)"
              class="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <DocumentDuplicateIcon class="w-3 h-3" />
              Copy
            </button>
          </div>
          <pre
            class="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto"
            >{{ generatedScript }}</pre
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TheGenerator',

  props: {
    configuration: {
      type: Object,
      required: false,
      default: () => {}
    }
  },

  data() {
    return {
      windows: [
        {
          id: '1',
          name: 'main',
          panes: [{ id: '1', command: '', name: 'pane-1' }],
          layout: 'horizontal'
        }
      ],
      activeWindow: '1',
      sessionName: 'my-session',
      mouseEnabled: false,
      selectedPane: null,
      templateCategory: 'all',
      showTemplates: false,
      draggedPane: null,
      dragOverPane: null,
      showExportDialog: false,
      selectedExportFormat: 'bash',
      isDark: false,
      commandTemplates: [
        {
          name: 'Node.js Development Server',
          command: 'cd ~/project && npm run dev',
          category: 'development'
        },
        {
          name: 'Python Flask Server',
          command: 'cd ~/project && python app.py',
          category: 'development'
        },
        {
          name: 'React Development',
          command: 'cd ~/project && npm start',
          category: 'development'
        },
        {
          name: 'Vue.js Development',
          command: 'cd ~/project && npm run serve',
          category: 'development'
        },
        { name: 'System Monitor', command: 'htop', category: 'system' },
        { name: 'File Manager', command: 'ranger', category: 'system' },
        { name: 'Git Status Watch', command: 'watch -n 2 git status', category: 'development' },
        { name: 'MySQL Client', command: 'mysql -u root -p', category: 'database' },
        { name: 'PostgreSQL Client', command: 'psql -U postgres', category: 'database' },
        { name: 'Redis CLI', command: 'redis-cli', category: 'database' },
        {
          name: 'Nginx Access Logs',
          command: 'tail -f /var/log/nginx/access.log',
          category: 'web'
        },
        {
          name: 'Apache Error Logs',
          command: 'tail -f /var/log/apache2/error.log',
          category: 'web'
        }
      ],
      exportFormats: [
        { id: 'bash', name: 'Bash Script' },
        { id: 'commands', name: 'Manual Commands' },
        { id: 'json', name: 'JSON Config' }
      ]
    }
  },

  computed: {
    title() {
      return document?.title
    },
    currentWindow() {
      return this.windows.find((w) => w.id === this.activeWindow)
    },
    rootPanes() {
      return this.currentWindow?.panes?.filter((p) => !p.parentId) || []
    },
    childPanes() {
      return this.currentWindow?.panes?.filter((p) => p.parentId) || []
    },
    filteredTemplates() {
      if (this.templateCategory === 'all') {
        return this.commandTemplates
      }
      return this.commandTemplates.filter((t) => t.category === this.templateCategory)
    },
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

  mounted() {
    this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    this.updateTheme()
  },

  methods: {
    splitPane(paneId, direction) {
      if (!this.currentWindow) return

      const newPane = {
        id: Date.now().toString(),
        command: '',
        name: `pane-${this.currentWindow.panes.length + 1}`,
        parentId: paneId,
        splitDirection: direction
      }

      this.windows = this.windows.map((w) =>
        w.id === this.activeWindow ? { ...w, panes: [...w.panes, newPane] } : w
      )
    },
    addPane() {
      if (!this.currentWindow) return

      const newPane = {
        id: Date.now().toString(),
        command: '',
        name: `pane-${this.currentWindow.panes.length + 1}`
      }

      this.windows = this.windows.map((w) =>
        w.id === this.activeWindow ? { ...w, panes: [...w.panes, newPane] } : w
      )
    },
    removePane(paneId) {
      if (!this.currentWindow || this.currentWindow.panes.length <= 1) return

      this.windows = this.windows.map((w) =>
        w.id === this.activeWindow ? { ...w, panes: w.panes.filter((p) => p.id !== paneId) } : w
      )

      if (this.selectedPane === paneId) {
        this.selectedPane = null
      }
    },
    updatePane(paneId, updates) {
      this.windows = this.windows.map((w) =>
        w.id === this.activeWindow
          ? {
              ...w,
              panes: w.panes.map((p) => (p.id === paneId ? { ...p, ...updates } : p))
            }
          : w
      )
    },
    changeLayout(layout) {
      this.windows = this.windows.map((w) => (w.id === this.activeWindow ? { ...w, layout } : w))
    },
    setSelectedPane(paneId) {
      this.selectedPane = paneId
    },
    handleDragStart(e, paneId) {
      this.draggedPane = paneId
      e.dataTransfer.effectAllowed = 'move'
    },
    handleDragOver(e, paneId) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      this.dragOverPane = paneId
    },
    handleDragLeave() {
      this.dragOverPane = null
    },
    handleDrop(e, targetPaneId) {
      e.preventDefault()

      if (!this.draggedPane || !this.currentWindow || this.draggedPane === targetPaneId) {
        this.draggedPane = null
        this.dragOverPane = null
        return
      }

      const newPanes = [...this.currentWindow.panes]
      const draggedIndex = newPanes.findIndex((p) => p.id === this.draggedPane)
      const targetIndex = newPanes.findIndex((p) => p.id === targetPaneId)

      const [removed] = newPanes.splice(draggedIndex, 1)
      newPanes.splice(targetIndex, 0, removed)

      this.windows = this.windows.map((w) =>
        w.id === this.activeWindow ? { ...w, panes: newPanes } : w
      )

      this.draggedPane = null
      this.dragOverPane = null
    },
    validateCommand(command) {
      if (!command.trim()) {
        return { isValid: true }
      }

      if (command.includes('&&') && command.split('&&').some((part) => !part.trim())) {
        return { isValid: false, message: 'Empty command after &&' }
      }

      if (command.includes('sudo') && !command.includes('-S')) {
        return { isValid: false, message: "Consider using 'sudo -S' for non-interactive sudo" }
      }

      return { isValid: true }
    },
    applyTemplate(command) {
      if (this.selectedPane) {
        this.updatePane(this.selectedPane, { command })
        this.showTemplates = false
      }
    },
    generateBashScript() {
      let script = '#!/bin/bash\n\n'
      script += `# tmux session: ${this.sessionName}\n\n`

      if (this.mouseEnabled) {
        script += 'tmux set -g mouse on\n'
      }

      script += `tmux new-session -d -s "${this.sessionName}"\n\n`

      if (this.currentWindow && this.currentWindow.panes.length > 0) {
        const firstPane = this.currentWindow.panes[0]
        if (firstPane.command) {
          script += `tmux send-keys -t "${this.sessionName}:0.0" "${firstPane.command}" Enter\n`
        }

        for (let i = 1; i < this.currentWindow.panes.length; i++) {
          const pane = this.currentWindow.panes[i]
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

      if (this.currentWindow && this.currentWindow.panes.length > 0) {
        const firstPane = this.currentWindow.panes[0]
        if (firstPane.command) {
          commands += `tmux send-keys -t "${this.sessionName}:0.0" "${firstPane.command}" Enter\n`
        }

        for (let i = 1; i < this.currentWindow.panes.length; i++) {
          const pane = this.currentWindow.panes[i]
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
          windows: this.windows
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
    },
    toggleTheme() {
      this.isDark = !this.isDark
      this.updateTheme()
    },
    updateTheme() {
      if (this.isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
}
</script>
