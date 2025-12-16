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
      required: false,
      default: () => {
        return { id: 0, items: [], command: '', direction: '' }
      }
    }
  },

  data() {
    return {
      isSmallPane: false,
      isFocused: false,
      timeout: null,
      currentPane: {
        id: 0,
        items: [],
        command: '',
        direction: ''
      }
    }
  },

  computed: {
    isPaneGroup() {
      return this.currentPane?.items?.length ?? false
    },
    paneGroupDirection() {
      return this.currentPane?.direction ?? 'horizontal'
    },
    paneGroupChildren() {
      return this.currentPane?.items ?? []
    }
  },

  watch: {
    currentPane: {
      immediate: true,
      deep: true,
      handler: function () {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          this.$layout.updatePane(this.currentPane)
        }, 500)
      }
    }
  },

  mounted() {
    this.checkPaneDimensions()
    this.currentPane = this.pane
  },

  methods: {
    splitPane(direction = 'horizontal') {
      this.currentPane.items = []

      this.currentPane.items.push({
        id: this.currentPane?.id,
        direction: '',
        items: []
      })

      this.$layout.setNextPaneId()

      this.currentPane.items.push({
        id: this.$layout.nextPaneId,
        direction: '',
        items: []
      })

      this.currentPane.direction = direction
      this.currentPane.id = null
    },

    checkPaneDimensions() {
      const el = this.$refs['pane-body']

      if (el) {
        const width = el.offsetWidth
        this.isSmallPane = width < 400
      }
    }
  }
}
</script>
