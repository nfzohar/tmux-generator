<template>
  <a-pane-group v-if="isGroup" />
  <div
    v-else
    class="h-full bg-gray-800 border-2 border-gray-700 rounded-md p-4 min-h-[120px] flex flex-col cursor-pointer transition-all duration-200"
  >
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-blue-500" />
        <span class="text-sm font-medium text-white capitalize h-4" v-text="`Pane ${pane?.id}`" />
      </div>

      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2 py-1 px-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md text-white font-semibold"
          @click="$emit('split-pane', pane?.id, 'horizontal')"
        >
          <i class="fa fa-arrows-left-right" />
          <small v-text="'Split horizontally'" />
        </button>

        <button
          class="flex items-center gap-2 py-1 px-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md text-white font-semibold"
          @click="$emit('split-pane', pane?.id, 'vertical')"
        >
          <i class="fa fa-arrows-up-down" />
          <small v-text="'Split vertically'" />
        </button>
      </div>
    </div>

    <textarea
      v-model="paneCommand"
      class="flex-1 bg-gray-900 rounded border border-gray-700 p-3 focus:outline-none"
    />
  </div>
</template>

<script>
export default {
  name: 'APane',

  props: {
    pane: {
      type: Object,
      default: () => {
        return { id: 0, children: [], direction: null }
      }
    }
  },

  data() {
    return {
      paneCommand: ''
    }
  },

  computed: {
    isGroup() {
      return this.pane?.items?.length ?? false
    },
    currentLayoutCommands() {
      return this.$layout?.commandList
    }
  },

  watch: {
    paneCommand() {
      this.$layout.updatePaneCommand(this.pane?.id, this.paneCommand)
    },
    currentLayoutCommands: {
      deep: true,
      handler: function () {
        this.paneCommand = this.currentLayoutCommands[this.pane?.id]
      }
    }
  },

  mounted() {
    this.paneCommand = this.currentLayoutCommands[this.pane?.id]
  }
}
</script>
