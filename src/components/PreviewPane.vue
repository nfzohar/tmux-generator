<template>
  <div
    class="h-full bg-white dark:bg-gray-800 border-2 rounded-md p-4 min-h-[120px] flex flex-col cursor-pointer transition-all duration-200"
    :class="splitPaneStyle(pane?.id)"
  >
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div
          class="w-4 h-4 rounded-full"
          :class="isSelectedPane(pane?.id) ? 'bg-blue-500' : 'bg-gray-400'"
        />
        <span
          class="text-sm font-medium text-gray-900 dark:text-white capitalize"
          v-text="pane?.name ?? `Pane ${pane?.id}`"
        />
        <span
          v-if="isSelectedPane(pane?.id)"
          class="p-1 text-xs bg-gray-100 font-bold dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg flex gap-1"
          v-text="'Selected'"
        />
      </div>

      <div class="flex items-center gap-2">
        <template v-if="isSelectedPane(pane?.id)">
          <button
            class="flex items-center gap-2 py-1 px-2 bg-gray-700 dark:hover:bg-gray-600 transition-colors rounded-md text-gray-400 font-semibold"
            @click="$emit('split-pane', pane?.id, 'horizontal')"
          >
            <i class="fa fa-arrows-left-right" />
            <small v-text="'Split horizontally'" />
          </button>

          <button
            class="flex items-center gap-2 py-1 px-2 bg-gray-700 dark:hover:bg-gray-600 transition-colors rounded-md text-gray-400 font-semibold"
            @click="$emit('split-pane', pane?.id, 'vertical')"
          >
            <i class="fa fa-arrows-up-down" />
            <small v-text="'Split vertically'" />
          </button>
        </template>
      </div>
    </div>

    <textarea
      v-model="currentPane.command"
      class="flex-1 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-3 focus:outline-none"
    />
  </div>
</template>

<script>
export default {
  name: 'PreviewPane',

  props: {
    pane: {
      type: Object,
      default: () => {}
    },
    selectedPane: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      currentPane: this.pane
    }
  },

  computed: {
    commandIsSet() {
      return this.pane?.command ?? false
    }
  },

  methods: {
    splitPaneStyle(paneId) {
      if (this.selectedPane === paneId) {
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      }
      if (this.dragOverPane === paneId) {
        return 'border-blue-400 bg-blue-100 dark:bg-blue-900/30 scale-105'
      }
      if (this.draggedPane === paneId) {
        return 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50'
      }
      return 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
    },

    isSelectedPane(paneId) {
      return true
    }
  }
}
</script>
