<template>
  <div class="flex-1 p-6">
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3 align-baseline">
          <i class="fa fa-terminal text-blue-600 dark:text-blue-400 border-2 p-1 rounded-md" />

          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white"
            v-text="`Layout Preview: ${windowName}`"
          />

          <span
            v-if="selectedPane"
            class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full"
            v-text="`Selected: ${selectedPaneName}`"
          />
        </div>

        <button
          class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-bold"
          @click="$emit('show-export')"
        >
          <i class="fa fa-file-export" />
          <span v-text="'Export Script'" />
        </button>
      </div>

      <!-- Layout Preview -->
      <div
        class="flex-1 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div class="h-full bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
          <div :class="['h-full gap-2 flex', layout === 'horizontal' ? 'flex-row' : 'flex-col']">
            <div v-for="(pane, index) in rootPanes" :key="pane.id" class="flex-1 flex gap-2">
              <div
                :class="[
                  'bg-white dark:bg-gray-800 border-2 rounded-md p-4 min-h-[120px] flex flex-col cursor-pointer transition-all duration-200',
                  childPanes.filter((p) => p.parentId === pane.id).length > 0 ? 'flex-1' : 'w-full',
                  selectedPane === pane.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : dragOverPane === pane.id
                      ? 'border-blue-400 bg-blue-100 dark:bg-blue-900/30 scale-105'
                      : draggedPane === pane.id
                        ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                ]"
                draggable="true"
                @click="$emit('select-pane', pane.id)"
                @dragstart="handleDragStart($event, pane.id)"
                @dragover="handleDragOver($event, pane.id)"
                @drop="handleDrop($event, pane.id)"
                @dragleave="handleDragLeave"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <i
                      class="fa fa-up-down-left-right text-gray-400 cursor-grab active:cursor-grabbing"
                    />
                    <div
                      :class="[
                        'w-3 h-3 rounded-full',
                        selectedPane === pane.id ? 'bg-blue-500' : 'bg-gray-400'
                      ]"
                    />
                    <span
                      class="text-sm font-medium text-gray-900 dark:text-white"
                      v-text="pane.name"
                    />
                  </div>

                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full"
                      v-text="index + 1"
                    />
                    <div v-if="selectedPane === pane.id" class="flex gap-1">
                      <button
                        @click.stop="$emit('split-pane', pane.id, 'horizontal')"
                        class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 16l-4-4m0 0l4-4m-4 4h18"
                          />
                        </svg>
                      </button>

                      <button
                        @click.stop="$emit('split-pane', pane.id, 'vertical')"
                        class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 7l4-4m0 0l4 4m-4-4v18"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  class="flex-1 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-3"
                >
                  <code
                    v-if="pane.command"
                    class="text-xs font-mono text-gray-600 dark:text-gray-400"
                    v-text="`$ ${pane.command}`"
                  />
                  <span
                    v-else
                    class="text-xs text-gray-400 dark:text-gray-500 italic"
                    v-text="'No command set'"
                  />
                </div>
              </div>

              <!-- Render split panes -->
              <div
                v-if="childPanes.filter((p) => p.parentId === pane.id).length > 0"
                :class="[
                  'flex-1 flex gap-2',
                  childPanes.find((p) => p.parentId === pane.id)?.splitDirection === 'horizontal'
                    ? 'flex-row'
                    : 'flex-col'
                ]"
              >
                <div
                  v-for="(splitPane, splitIndex) in childPanes.filter(
                    (p) => p.parentId === pane.id
                  )"
                  :key="splitPane.id"
                  :class="[
                    'flex-1 bg-white dark:bg-gray-800 border-2 rounded-md p-4 min-h-[120px] flex flex-col cursor-pointer transition-all duration-200',
                    selectedPane === splitPane.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : dragOverPane === splitPane.id
                        ? 'border-blue-400 bg-blue-100 dark:bg-blue-900/30 scale-105'
                        : draggedPane === splitPane.id
                          ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  ]"
                  @click="$emit('select-pane', splitPane.id)"
                  draggable="true"
                  @dragstart="handleDragStart($event, splitPane.id)"
                  @dragover="handleDragOver($event, splitPane.id)"
                  @dragleave="handleDragLeave"
                  @drop="handleDrop($event, splitPane.id)"
                >
                  <div class="flex items-center justify-between mb-3">
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
                      <div
                        class="w-3 h-3 rounded-full"
                        :class="selectedPane === splitPane.id ? 'bg-blue-500' : 'bg-gray-400'"
                      />
                      <span
                        class="text-sm font-medium text-gray-900 dark:text-white"
                        v-text="splitPane.name"
                      />
                    </div>
                    <span
                      class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full"
                      v-text="`${index + 1}.${splitIndex + 1}`"
                    />
                  </div>

                  <div
                    class="flex-1 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <code
                      v-if="splitPane.command"
                      class="text-xs font-mono text-gray-600 dark:text-gray-400"
                      v-text="`$ ${splitPane.command}`"
                    />
                    <span
                      v-else
                      class="text-xs text-gray-400 dark:text-gray-500 italic"
                      v-text="'No command set'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          <b v-text="'Instructions:'" />
          <span
            v-text="
              'Click on a pane to select it, drag panes to reorder them, use split buttons to create new panes. Use command templates for quick setup or write custom commands. Export generates executable bash scripts.'
            "
          />
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThePreview',

  props: {
    windowName: {
      type: String,
      default: 'main'
    },
    layout: {
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
    },
    selectedPaneName: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      draggedPane: null,
      dragOverPane: null
    }
  },

  computed: {
    rootPanes() {
      return this.panes.filter((p) => !p.parentId) || []
    },
    childPanes() {
      return this.panes.filter((p) => p.parentId) || []
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
    }
  }
}
</script>
