<template>
  <div class="flex-1 p-6">
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <i
            class="text-blue-600 dark:text-blue-400 border-2 p-1 rounded-md"
            :class="'fa fa-terminal'"
          />
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white"
            v-text="`Layout Preview: ${windowName}`"
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
        class="flex-1 p-6 bg-white dark:bg-gray-900 border-5 border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <a-pane-group v-if="paneIsAGroup(mainPane)" :pane-group="mainPane" />
        <a-pane v-else :pane="mainPane" />
      </div>
    </div>
  </div>
</template>

<script>
import APane from './PreviewPane.vue'
import APaneGroup from './PreviewPaneGroup.vue'

export default {
  name: 'ThePreview',

  components: { APane, APaneGroup },

  props: {
    configuration: {
      type: Object,
      default: () => {}
    },

    // old props
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
    mainPane() {
      return this.configuration.layout
    }
  },

  methods: {
    paneIsAGroup(pane) {
      return typeof pane === 'object' && Array.isArray(pane)
    },

    isSelectedPane(paneId) {
      return this.selectedPane === paneId
    }
  }
}
</script>
