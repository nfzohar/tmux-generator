<template>
  <div
    v-if="!isPaneGroup"
    class="h-full w-full bg-white dark:bg-black border-2 border-gray-300 dark:border-slate-800 rounded-md min-h-[120px] flex flex-col transition-all duration-200"
    ref="pane-body"
    @contextmenu.prevent="openContextMenu"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 px-2">
        <div
          class="w-3 h-3 rounded-full"
          :class="isFocused ? `bg-[${backgroundColorHex}]` : 'bg-gray-500'"
        />
        <span class="text-sm font-medium capitalize" v-text="`Pane ${currentPane?.id ?? ''}`" />
      </div>

      <div class="flex items-center gap-1 p-2">
        <button
          class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md"
          :title="'Split this pane horizontaly'"
          tabindex="-1"
          @click="splitIntoPanes('horizontal')"
        >
          <i class="fa fa-arrows-left-right" />
          <small v-show="!isSmallPane" v-text="'Split horizontally'" />
        </button>

        <button
          class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md"
          :title="'Split this pane verticaly'"
          tabindex="-1"
          @click="splitIntoPanes('vertical')"
        >
          <i class="fa fa-arrows-up-down" />
          <small v-show="!isSmallPane" v-text="'Split vertically'" />
        </button>
      </div>
    </div>

    <textarea
      v-model="currentPane.command"
      class="block w-full h-full px-4 py-2 focus:outline-none rounded-b-lg border-t dark:border-none resize-none"
      :placeholder="'Enter command...'"
      @focusout="isFocused = false"
      @focusin="isFocused = true"
    />

    <context-menu
      :ref="'menu'"
      :items="actions"
      @split-vertically="splitIntoPanes('vertical')"
      @split-horizontaly="splitIntoPanes('horizontal')"
      @split-vertically-3-panes="splitIntoPanes('vertical', 3)"
      @split-horizontaly-3-panes="splitIntoPanes('horizontal', 3)"
    />
  </div>

  <div
    v-else
    class="flex gap-2 w-full h-full"
    :class="paneGroupDirection == 'vertical' ? 'flex-col' : 'flex-row'"
  >
    <preview-pane
      v-for="(child, i) in paneGroupChildren"
      :key="i"
      :pane="child"
      @update-pane="(pane) => propagatePaneUpdate(pane)"
    />
  </div>
</template>

<script>
import ContextMenu from './ContextMenu.vue'

export default {
  name: 'PreviewPane',

  components: { ContextMenu },

  emits: ['updatePane'],

  props: {
    pane: {
      type: Object,
      required: true,
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
      },
      actions: [
        'Split vertically',
        'Split horizontaly',
        'Split vertically (3 panes)',
        'Split horizontaly (3 panes)'
      ]
    }
  },

  computed: {
    paneGroupDirection() {
      return this.currentPane?.direction ?? 'horizontal'
    },
    isPaneGroup() {
      return this.currentPane?.items?.length > 0
    },
    paneGroupChildren() {
      return this.currentPane?.items ?? []
    },
    backgroundColorHex() {
      return this.$layout?.colors?.bg
    }
  },

  watch: {
    currentPane: {
      deep: true,
      handler: function () {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          this.$emit('updatePane', this.currentPane)
        }, 500)
      }
    }
  },

  mounted() {
    this.checkPaneDimensions()
    this.currentPane = this.pane
  },

  methods: {
    splitIntoPanes(direction, paneCount = 2) {
      let items = []

      for (let index = 0; items?.length < paneCount; index++) {
        items.push({
          id: this.$layout.nextPaneId,
          direction: '',
          command: '',
          items: []
        })
        this.$layout.setNextPaneId()
      }

      this.currentPane = {
        id: this.currentPane?.id,
        direction: direction,
        command: this.currentPane?.command || '',
        items: items
      }
    },

    propagatePaneUpdate(updatedPane) {
      this.currentPane.items = this.currentPane.items.map((pane) =>
        pane.id == updatedPane.id ? updatedPane : pane
      )
    },

    checkPaneDimensions() {
      const el = this.$refs['pane-body']

      if (el) {
        const width = el.offsetWidth
        this.isSmallPane = width < 400
      }
    },

    openContextMenu(e) {
      this.$refs.menu.open(e)
    }
  }
}
</script>
