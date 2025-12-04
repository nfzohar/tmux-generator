<template>
  <a-pane-group v-if="isGroup" />
  <div
    v-else
    class="h-full w-full bg-white dark:bg-black0 border-2 border-gray-300 dark:border-slate-8000 rounded-md min-h-[120px] flex flex-col transition-all duration-200"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 px-2">
        <div class="w-3 h-3 rounded-full" :class="focused ? 'bg-blue-500' : 'bg-blue-800'" />
        <span
          class="text-sm font-medium dark:text-white0 capitalize"
          v-text="`Pane ${pane?.id ?? ''}`"
        />
      </div>

      <div class="flex items-center gap-1 p-2">
        <button
          class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md"
          :title="'Split this pane horizontaly'"
          tabindex="-1"
          @click="splitIntoGroup('horizontal')"
        >
          <i class="fa fa-arrows-left-right" />
          <small v-text="'Split horizontally'" />
        </button>

        <button
          class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md"
          :title="'Split this pane verticaly'"
          tabindex="-1"
          @click="splitIntoGroup('vertical')"
        >
          <i class="fa fa-arrows-up-down" />
          <small v-text="'Split vertically'" />
        </button>
      </div>
    </div>

    <textarea
      v-model="paneCommand"
      style="resize: none"
      class="block w-full h-full px-4 py-2 focus:outline-none rounded-b-lg  border-t dark:border-none0"
      :placeholder="'Enter command...'"
      @focusin="focused = true"
      @focusout="focused = false"
    />
  </div>
</template>

<script>
export default {
  name: 'APane',

  props: {
    pane: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      focused: false,
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
  },

  methods: {
    splitIntoGroup(direction = 'vertical') {
      this.$layout.splitPane(this.pane?.id, direction)
    }
  }
}
</script>
