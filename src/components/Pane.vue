<template>
  <a-pane-group v-if="isGroup" />
  <div
    v-else
    class="h-full bg-gray-900 border-2 border-gray-800 rounded-md min-h-[120px] flex flex-col transition-all duration-200"
  >
    <div class="flex items-center justify-between bg-gray-700 rounded-t-lg">
      <div class="flex items-center gap-2 px-2">
        <div class="w-4 h-4 rounded-full bg-blue-500" />
        <span class="text-sm font-medium text-white capitalize h-4" v-text="`Pane ${pane?.id}`" />
      </div>

      <div class="flex items-center gap-1 p-1">
        <button
          class="flex items-center bg-gray-700 p-1 hover:bg-gray-600 transition-colors rounded-md text-white font-semibold cursor-pointer"
          @click="splitIntoGroup('horizontal')"
        >
          <i class="fa fa-arrows-left-right" />
          <small class="ml-1" v-text="'Split horizontally'" />
        </button>

        <button
          class="flex items-center bg-gray-700 p-1 hover:bg-gray-600 transition-colors rounded-md text-white font-semibold cursor-pointer"
          @click="splitIntoGroup('vertical')"
        >
          <i class="fa fa-arrows-up-down" />
          <small class="ml-1" v-text="'Split vertically'" />
        </button>
      </div>
    </div>

    <textarea v-model="paneCommand" class="flex-1 p-3 focus:outline-none rounded-t-lg" />
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
    return { paneCommand: '' }
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
  },

  methods: {
    splitIntoGroup(direction = 'vertical') {
      this.$layout.splitPane(this.pane?.id, direction)
    }
  }
}
</script>
