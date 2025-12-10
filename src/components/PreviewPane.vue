<template>
  <div
    v-if="!isPaneGroup"
    class="h-full w-full bg-white dark:bg-black border-2 border-gray-300 dark:border-slate-800 rounded-md min-h-[120px] flex flex-col transition-all duration-200"
    ref="pane-body"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 px-2">
        <div class="w-3 h-3 rounded-full" :class="isFocused ? 'bg-blue-500' : 'bg-blue-800'" />
        <span class="text-sm font-medium capitalize" v-text="`Pane ${paneId ?? ''}`" />
      </div>

      <div class="flex items-center gap-1 p-2">
        <button
          class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md"
          :title="'Split this pane horizontaly'"
          tabindex="-1"
          @click="splitPane('horizontal')"
        >
          <i class="fa fa-arrows-left-right" />
          <small v-show="!isSmallPane" v-text="'Split horizontally'" />
        </button>

        <button
          class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md"
          :title="'Split this pane verticaly'"
          tabindex="-1"
          @click="splitPane('vertical')"
        >
          <i class="fa fa-arrows-up-down" />
          <small v-show="!isSmallPane" v-text="'Split vertically'" />
        </button>
      </div>
    </div>

    <textarea
      v-model="paneCommand"
      style="resize: none"
      class="block w-full h-full px-4 py-2 focus:outline-none rounded-b-lg border-t dark:border-none"
      :placeholder="'Enter command...'"
      @focusin="isFocused = true"
      @focusout="isFocused = false"
    />
  </div>

  <div
    v-else
    class="flex gap-2 w-full h-full"
    :class="`flex-${paneGroupDirection == 'vertical' ? 'col' : 'row'}`"
  >
    <template v-for="(child, i) in paneGroupChildren" :key="i">
      <preview-pane :pane="child" />
    </template>
  </div>
</template>

<script>
export default {
  name: 'PreviewPane',

  props: {
    pane: {
      type: Object,
      default: () => {
        return { id: 0, direction: '', items: [] }
      }
    }
  },

  data() {
    return {
      paneId: 0,
      items: [],
      direction: '',
      paneCommand: '',
      isFocused: false,
      isSmallPane: false
    }
  },

  computed: {
    isPaneGroup() {
      //return this.pane?.items?.length ?? false
      return this.items?.length ?? false
    },
    paneGroupDirection() {
      //return this.pane?.direction ?? 'horizontal'
      return this.direction ?? 'horizontal'
    },
    paneGroupChildren() {
      // return this.pane?.items?.length ? this.pane?.items : []
      return this.items ?? []
    }
  },

  watch: {
    paneCommand() {
      this.$layout.updatePaneCommand(this.pane?.id, this.paneCommand)
    }
    // currentLayoutCommands: {
    //   deep: true,
    //   handler: function () {
    //     this.paneCommand = this.currentLayoutCommands[this.pane?.id]
    //   }
    // }
  },

  mounted() {
    this.checkPaneDimensions()

    this.paneId = this.pane?.id ?? 0
    this.items = this.pane?.items ?? []
    this.direction = this.pane?.direction ?? ''
  },

  methods: {
    splitPane(direction = 'horizontal') {
      this.items = []

      this.items.push({ id: this.paneId, direction: '', items: [] })
      this.$layout.setNextPaneId()

      this.items.push({ id: this.$layout.nextPaneId, direction: '', items: [] })
      this.$layout.addStep({ paneId: this.paneId, action: `split_${direction}` })

      this.direction = direction
      this.paneId = null
    },

    checkPaneDimensions() {
      const el = this.$refs['pane-body']

      if (el) {
        const width = el.offsetWidth
        this.isSmallPane = width < 300
      }
    }
  }
}
</script>
