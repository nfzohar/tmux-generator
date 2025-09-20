<template>
  <div
    class="w-85 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-hidden"
  >
    <div class="flex flex-col justify-between h-full gap-5">
      <div class="flex flex-col gap-5">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white capitalize" v-text="title" />
          <p
            class="text-xs text-gray-600 dark:text-gray-400"
            v-text="'Visually create TMUX layouts and export as scripts'"
          />
        </div>

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

        <hr class="border-gray-200 dark:border-gray-700" />
      </div>

      <div v-if="selectedPane" class="flex flex-col h-full w-full">
        <div
          class="p-2 mb-5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg flex gap-1"
        >
          <b class="mr-1" v-text="'Selected:'" />
          <span v-text="selectedPaneName" />
        </div>

        <span
          class="text-sm font-medium text-blue-700 dark:text-blue-300"
          v-text="'Selected Pane Actions'"
        />

        <div
          class="grid gap-2 mt-2 grid-cols-1"
          :class="`grid-rows-${visibleSelectedPaneActionsCount}`"
        >
          <template v-for="(action, a) in selectedPaneActions" :key="a">
            <button
              v-if="action.show"
              class="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer capitalize bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white"
              @click="action.run"
            >
              <i :class="action.icon" />
              <span class="capitalize" v-text="action.label" />
            </button>
          </template>
        </div>
      </div>

      <div
        class="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400"
      >
        <b class="block mb-1" v-text="'Instructions:'" />
        <span
          v-text="
            'Click on a pane to select it, drag panes to reorder them, use split buttons to create new panes. Use command templates for quick setup or write custom commands. Export generates executable bash scripts.'
          "
        />
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
      dragOverPane: null
    }
  },

  computed: {
    title() {
      return document.title
    },
    canDeletePanes() {
      return this.panes.length > 1 ?? false
    },
    selectedPaneActions() {
      return [
        {
          show: true,
          label: 'Split Horizontal',
          icon: 'fa-solid fa-table-columns',
          run: () => this.$emit('split-pane', this.selectedPane, 'horizontal')
        },
        {
          show: true,
          label: 'Split Vertical',
          icon: 'fa-solid fa-table-columns -rotate-90',
          run: () => this.$emit('split-pane', this.selectedPane, 'vertical')
        },
        {
          show: this.canDeletePanes,
          label: 'Remove selected pane',
          icon: 'fa fa-trash',
          run: () => this.$emit('remove-pane', this.selectedPane)
        }
      ]
    },
    visibleSelectedPaneActionsCount() {
      return this.selectedPaneActions.filter((action) => action.show).length
    }
  },

  created() {
    // Set delete function key
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Delete') {
        if (this.canDeletePanes) {
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
