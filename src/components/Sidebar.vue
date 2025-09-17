<template>
  <div class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5">
    <div class="flex flex-col gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white capitalize" v-text="title" />
        <p
          class="text-xs text-gray-600 dark:text-gray-400"
          v-text="'Visually create tmux layouts and export as scripts'"
        />
      </div>

      <hr class="border-gray-200 dark:border-gray-700" />

      <div class="space-y-4">
        <div>
          <label
            for="session-name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            v-text="'Session Name'"
          />
          <input
            v-model="sessionName"
            id="session-name"
            type="text"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="My Session"
          />
        </div>

        <div class="flex items-center space-x-2">
          <input
            id="mouse-enabled"
            v-model="mouseEnabled"
            type="checkbox"
            class="rounded border-gray-300 dark:border-gray-600"
          />
          <label
            for="mouse-enabled"
            class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Enable mouse controls
          </label>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            v-text="'Layout Type'"
          />
          <div class="flex gap-2 mt-2">
            <button
              v-for="direction in ['horizontal', 'vertical']"
              :key="direction"
              class="px-3 py-1 text-sm rounded-md transition-colors capitalize"
              :class="
                currentWindow?.layout === direction
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              "
              v-text="direction"
              @click="changeLayout(direction)"
            />
          </div>
        </div>

        <hr class="border-gray-200 dark:border-gray-700" />

        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Panes</label>
            <button
              @click="addPane"
              class="flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon class="w-4 h-4" />
              Add
            </button>
          </div>

          <div
            v-if="selectedPane"
            class="p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300"
                >Selected Pane Actions</span
              >
              <CogIcon class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="flex gap-2">
              <button
                @click="splitPane(selectedPane, 'horizontal')"
                class="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <i class="fa fa-arrows-left-right" />
                Split H
              </button>

              <button
                @click="splitPane(selectedPane, 'vertical')"
                class="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <i class="fa fa-arrows-up-down" />
                Split V
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="(pane, index) in currentWindow?.panes || []"
              :key="pane.id"
              :class="[
                'p-4 cursor-pointer transition-all duration-200 border rounded-md',
                selectedPane === pane.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                  : dragOverPane === pane.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 scale-105'
                    : draggedPane === pane.id
                      ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              ]"
              @click="setSelectedPane(pane.id)"
              draggable="true"
              @dragstart="handleDragStart($event, pane.id)"
              @dragover="handleDragOver($event, pane.id)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, pane.id)"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <GripVerticalIcon
                      class="w-3 h-3 text-gray-400 cursor-grab active:cursor-grabbing"
                    />
                    <span
                      :class="[
                        'px-2 py-1 text-xs rounded-full',
                        selectedPane === pane.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      ]"
                    >
                      {{ pane.parentId ? `Split ${index + 1}` : `Pane ${index + 1}` }}
                    </span>
                  </div>
                  <button
                    v-if="(currentWindow?.panes?.length || 0) > 1"
                    @click.stop="removePane(pane.id)"
                    class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <XMarkIcon class="w-3 h-3" />
                  </button>
                </div>

                <div>
                  <label class="block text-xs text-gray-500 dark:text-gray-400">Name</label>
                  <input
                    :value="pane.name"
                    @input="updatePane(pane.id, { name: $event.target.value })"
                    @click.stop
                    type="text"
                    class="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="pane-name"
                  />
                </div>

                <div>
                  <label class="text-xs text-gray-500 dark:text-gray-400" v-text="'Command'" />
                  <textarea
                    :value="pane.command"
                    @input="updatePane(pane.id, { command: $event.target.value })"
                    @click.stop
                    :class="[
                      'mt-1 block w-full px-2 py-2 text-sm font-mono border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                      !validateCommand(pane.command).isValid
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    ]"
                    rows="3"
                    placeholder="cd ~/project && npm start"
                  />

                  <div
                    v-if="!validateCommand(pane.command).isValid"
                    class="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400"
                  >
                    <ExclamationTriangleIcon class="w-3 h-3" />
                    {{ validateCommand(pane.command).message }}
                  </div>

                  <div v-if="selectedPane === pane.id && showTemplates" class="mt-3">
                    <div
                      class="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
                    >
                      <div class="space-y-2 max-h-40 overflow-y-auto">
                        <button
                          v-for="template in filteredTemplates"
                          :key="template.name"
                          @click="applyTemplate(template.command)"
                          class="w-full text-left p-2 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div class="font-medium text-gray-900 dark:text-white">
                            {{ template.name }}
                          </div>
                          <div class="text-gray-500 dark:text-gray-400 font-mono">
                            {{ template.command }}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TheSidebar',

  data() {
    return {
      commandPlaceholder: 'ls -la && code .',

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
      selectedExportFormat: 'bash'
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
    },

    configuration() {
      return {
        name: this.sessionName,
        orientation: '',
        enableMouseInput: true,
        panes: []
      }
    }
  },

  watch: {},

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
    }
  }
}
</script>
