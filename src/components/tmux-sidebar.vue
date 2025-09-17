<template>
  <div
    class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto"
  >
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white capitalize">
          Tmux Layout Builder
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Visually create tmux layouts and export as scripts
        </p>
      </div>

      <hr class="border-gray-200 dark:border-gray-700" />

      <div class="space-y-4">
        <div>
          <label
            for="session-name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Session Name</label
          >
          <input
            v-model="session"
            id="session-name"
            type="text"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="My Session"
          />
        </div>

        <div class="flex items-center space-x-2">
          <input
            id="mouse-enabled"
            v-model="mouse"
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
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Layout Type</label
          >
          <div class="flex gap-2 mt-2">
            <button
              @click="$emit('change-layout', 'horizontal')"
              :class="[
                'px-3 py-1 text-sm rounded-md transition-colors',
                currentLayout === 'horizontal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              Horizontal
            </button>
            <button
              @click="$emit('change-layout', 'vertical')"
              :class="[
                'px-3 py-1 text-sm rounded-md transition-colors',
                currentLayout === 'vertical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              Vertical
            </button>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Panes</label>
            <button
              @click="$emit('add-pane')"
              class="flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
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
              <svg
                class="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div class="flex gap-2">
              <button
                @click="$emit('split-pane', selectedPane, 'horizontal')"
                class="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                Split H
              </button>

              <button
                @click="$emit('split-pane', selectedPane, 'vertical')"
                class="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7l4-4m0 0l4 4m-4-4v18"
                  />
                </svg>
                Split V
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="(pane, index) in panes"
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
              @click="$emit('select-pane', pane.id)"
              draggable="true"
              @dragstart="handleDragStart($event, pane.id)"
              @dragover="handleDragOver($event, pane.id)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, pane.id)"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg
                      class="w-3 h-3 text-gray-400 cursor-grab active:cursor-grabbing"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
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
                    v-if="panes.length > 1"
                    @click.stop="$emit('remove-pane', pane.id)"
                    class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div>
                  <label class="block text-xs text-gray-500 dark:text-gray-400">Name</label>
                  <input
                    :value="pane.name"
                    @input="$emit('update-pane', pane.id, { name: $event.target.value })"
                    @click.stop
                    type="text"
                    class="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="pane-name"
                  />
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="text-xs text-gray-500 dark:text-gray-400">Command</label>
                    <button
                      v-if="selectedPane === pane.id"
                      @click.stop="showTemplates = !showTemplates"
                      class="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Templates
                    </button>
                  </div>

                  <textarea
                    :value="pane.command"
                    @input="$emit('update-pane', pane.id, { command: $event.target.value })"
                    @click.stop
                    :class="[
                      'mt-1 block w-full px-2 py-2 text-sm font-mono border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                      !validateCommand(pane.command).isValid
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    ]"
                    rows="3"
                    placeholder="cd ~/project && npm start"
                  ></textarea>

                  <div
                    v-if="!validateCommand(pane.command).isValid"
                    class="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    {{ validateCommand(pane.command).message }}
                  </div>

                  <div v-if="selectedPane === pane.id && showTemplates" class="mt-3">
                    <div
                      class="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
                    >
                      <div class="flex items-center gap-2 mb-3">
                        <svg
                          class="w-4 h-4 text-gray-500 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >Command Templates</span
                        >
                      </div>

                      <div class="mb-3">
                        <select
                          v-model="templateCategory"
                          class="block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="all">All Categories</option>
                          <option value="development">Development</option>
                          <option value="system">System</option>
                          <option value="database">Database</option>
                          <option value="web">Web Servers</option>
                        </select>
                      </div>

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
  name: 'TmuxSidebar',
  props: {
    sessionName: {
      type: String,
      default: 'my-session'
    },
    mouseEnabled: {
      type: Boolean,
      default: false
    },
    currentLayout: {
      type: String,
      default: 'horizontal'
    },
    panes: {
      type: Array,
      default: () => []
    },
    selectedPane: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      session: this.sessionName,
      mouse: this.mouseEnabled,
      templateCategory: 'all',
      showTemplates: false,
      draggedPane: null,
      dragOverPane: null,
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
      ]
    }
  },
  computed: {
    filteredTemplates() {
      if (this.templateCategory === 'all') {
        return this.commandTemplates
      }
      return this.commandTemplates.filter((t) => t.category === this.templateCategory)
    }
  },
  methods: {
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
      this.$emit('reorder-panes', this.draggedPane, targetPaneId)
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
        this.$emit('update-pane', this.selectedPane, { command })
        this.showTemplates = false
      }
    }
  }
}
</script>
