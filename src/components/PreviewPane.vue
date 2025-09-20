<template>
  <div
    class="h-full bg-white dark:bg-gray-800 border-2 rounded-md p-4 min-h-[120px] flex flex-col cursor-pointer transition-all duration-200"
    :class="splitPaneStyle(pane.id)"
  >
    <!-- @click="$emit('select-pane', pane.id)" -->
    <!-- @dragstart="handleDragStart($event, pane.id)" -->
    <!-- @dragover="handleDragOver($event, pane.id)" -->
    <!-- @drop="handleDrop($event, pane.id)" -->
    <!-- @dragleave="handleDragLeave" -->
    <!-- draggable="true" -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div
          class="w-4 h-4 rounded-full"
          :class="isSelectedPane(pane.id) ? 'bg-blue-500' : 'bg-gray-400'"
        />
        <span
          class="text-sm font-medium text-gray-900 dark:text-white capitalize"
          v-text="pane?.name ?? 'New pane'"
        />
        <span
          v-if="isSelectedPane(pane.id)"
          class="p-1 text-xs bg-gray-100 font-bold dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg flex gap-1"
          v-text="'Selected'"
        />
      </div>

      <div class="flex items-center gap-2">
        <span
          class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full"
          v-text="index + 1"
        />
        <div v-if="isSelectedPane(pane.id)" class="flex gap-1">
          <button
            @click.stop="$emit('split-pane', pane.id, 'horizontal')"
            class="px-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md"
          >
            <i class="fa fa-arrow-left text-gray-400" />
          </button>

          <button
            @click.stop="$emit('split-pane', pane.id, 'vertical')"
            class="px-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md"
          >
            <i class="fa fa-arrow-up text-gray-400" />
          </button>

          <button
            @click.stop="$emit('split-pane', pane.id, 'vertical')"
            class="px-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md"
          >
            <i class="fa fa-copy text-gray-400" />
          </button>
        </div>
      </div>
    </div>

    <textarea
      v-model="currentPane.command"
      class="flex-1 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-3 focus:outline-none"
    />

    <div
      v-if="false"
      class="flex-1 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-3"
    >
      <component
        v-if="false"
        :is="commandIsSet ? 'code' : 'span'"
        class="text-sm"
        :class="
          commandIsSet
            ? 'font-mono text-gray-600 dark:text-gray-400'
            : 'text-gray-400 dark:text-gray-500 italic'
        "
      >
        {{ commandIsSet ? pane.command : 'No command set' }}</component
      >
    </div>
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
