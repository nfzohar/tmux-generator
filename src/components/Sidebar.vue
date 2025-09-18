<template>
  <div
    class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto"
  >
    <div class="flex flex-col gap-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white capitalize" v-text="title" />
        <p
          class="text-sm text-gray-600 dark:text-gray-400"
          v-text="'Visually create TMUX layouts and export as scripts'"
        />
      </div>

      <hr class="border-gray-200 dark:border-gray-700" />

      <input-wrapper :label="'Session Name'" :name="'session-name'">
        <input
          v-model="session"
          id="session-name"
          type="text"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="My Session"
        />
      </input-wrapper>

      <input-wrapper
        :label="'Enable mouse controls'"
        :label-position="'bottom'"
        :name="'mouse-enabled'"
        type="checkbox"
      >
        <input
          id="mouse-enabled"
          v-model="mouse"
          type="checkbox"
          class="rounded border-gray-300 dark:border-gray-600"
        />
      </input-wrapper>

      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          v-text="'Layout Type'"
        />
        <div class="grid grid-cols-2 gap-2 mt-2">
          <button
            v-for="orientation in ['horizontal', 'vertical']"
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors capitalize',
              currentLayout === 'horizontal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
            :key="orientation"
            v-text="orientation"
            @click="$emit('change-layout', 'horizontal')"
          />
        </div>
      </div>

      <hr class="border-gray-200 dark:border-gray-700 my-2" />

      <div>
        <div class="flex items-center align-middle justify-between mb-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300" v-text="'Panes'" />
          <button
            @click="$emit('add-pane')"
            class="flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <i class="fa fa-plus" />
            <label v-text="'Panes'" />
          </button>
        </div>

        <div
          v-if="selectedPane"
          class="p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md"
        >
          <span
            class="text-sm font-medium text-blue-700 dark:text-blue-300"
            v-text="'Selected Pane Actions'"
          />
          <div class="flex gap-2">
            <button
              @click="$emit('split-pane', selectedPane, 'horizontal')"
              class="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <i class="fa fa-arrows-left-right" />
              <span class="capitalize" v-text="'Split Horizontal'" />
            </button>

            <button
              @click="$emit('split-pane', selectedPane, 'vertical')"
              class="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <i class="fa fa-arrows-up-down" />
              <span class="capitalize" v-text="'Split Vetical'" />
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-3 h-full overflow-y-scroll">
          <div
            v-for="(pane, index) in panes"
            :key="pane.id"
            class="flex flex-col gap-2 p-4 cursor-pointer transition-all duration-200 border rounded-md"
            :class="paneClass(pane.id)"
            draggable="true"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, pane.id)"
            @dragover="handleDragOver($event, pane.id)"
            @dragstart="handleDragStart($event, pane.id)"
            @click="$emit('select-pane', pane.id)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i
                  class="fa fa-arrows-up-down-left-right text-gray-400 cursor-grab active:cursor-grabbing"
                />
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    selectedPane === pane.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  ]"
                  v-text="pane.parentId ? `Split ${index + 1}` : `Pane ${index + 1}`"
                />
              </div>

              <button
                v-if="panes.length > 1"
                class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                @click.stop="$emit('remove-pane', pane.id)"
              >
                <i class="fa fa-times" />
              </button>
            </div>

            <input-wrapper :label="'Name'" :name="'pane-name'">
              <input
                :value="pane.name"
                type="text"
                class="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="pane-name"
                @input="$emit('update-pane', pane.id, { name: $event.target.value })"
              />
            </input-wrapper>

            <input-wrapper :label="'Command'" :name="'pane-command'">
              <textarea
                :value="pane.command"
                class="mt-1 block w-full px-2 py-2 text-sm font-mono border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                placeholder="cd ~/project && npm start"
                rows="3"
                @input="$emit('update-pane', pane.id, { command: $event.target.value })"
              />
            </input-wrapper>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputWrapper from './InputWrapper.vue'

export default {
  name: 'TheSidebar',

  components: { InputWrapper },

  props: {
    sessionName: {
      type: String,
      default: ''
    },
    selectedPane: {
      type: String,
      default: null
    },
    mouseEnabled: {
      type: Boolean,
      default: false
    },
    panes: {
      type: Array,
      default: () => []
    },
    currentLayout: {
      type: String,
      default: 'horizontal'
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
    title() {
      return document.title
    }
  },

  created() {
    // Set delete function key
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Delete') {
        if (this.panes.length > 1) {
          this.$emit('remove-pane', this.selectedPane)
        }
      }
    })
  },

  methods: {
    paneClass(paneId) {
      if (this.selectedPane === paneId) {
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
      }
      if (this.dragOverPane === paneId) {
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 scale-105'
      }
      if (this.draggedPane === paneId) {
        return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50'
      }
      return 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
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
      this.$emit('reorder-panes', this.draggedPane, targetPaneId)
      this.draggedPane = null
      this.dragOverPane = null
    }
  }
}
</script>
