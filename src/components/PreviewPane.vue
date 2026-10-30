<template>
  <div
    v-if="!isPaneGroup"
    class="@container flex-1 min-w-0 bg-white dark:bg-black border-2 border-gray-300 dark:border-slate-800 rounded-md min-h-[120px] flex flex-col transition-all duration-200"
    @contextmenu.prevent="openContextMenu"
  >
    <div class="flex items-center justify-between min-w-0">
      <div class="flex items-center gap-2 px-2 min-w-0">
        <div
          class="w-3 h-3 shrink-0 rounded-full bg-gray-500"
          :style="isFocused ? { backgroundColor: focusColor } : {}"
        />
        <span class="text-sm font-medium whitespace-nowrap" :title="`Pane ${pane.id}`">
          <span class="hidden @[10rem]:inline" v-text="'Pane '" />{{ pane.id }}
        </span>
      </div>

      <div class="flex items-center gap-1 p-2 shrink-0">
        <button
          class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md"
          :title="'Split this pane horizontally'"
          tabindex="-1"
          @click="splitIntoPanes('horizontal')"
        >
          <i class="fa fa-arrows-left-right" />
          <small class="hidden @sm:inline" v-text="'Split horizontally'" />
        </button>

        <button
          class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md"
          :title="'Split this pane vertically'"
          tabindex="-1"
          @click="splitIntoPanes('vertical')"
        >
          <i class="fa fa-arrows-up-down" />
          <small class="hidden @sm:inline" v-text="'Split vertically'" />
        </button>
      </div>
    </div>

    <textarea
      :value="pane.command"
      class="block w-full h-full px-4 py-2 focus:outline-none rounded-b-lg border-t dark:border-none resize-none bg-transparent"
      :placeholder="'Enter command...'"
      @input="$layout.setCommand(pane.id, $event.target.value)"
      @focus="startEditing"
      @blur="isFocused = false"
      @change="$layout.pushHistory(snapshotBeforeEdit)"
    />

    <context-menu
      ref="menu"
      :items="actions"
      @select="(action) => splitIntoPanes(...action.split)"
    />
  </div>

  <div
    v-else
    class="flex flex-1 min-w-0 min-h-0 gap-2"
    :class="pane.direction == 'vertical' ? 'flex-col' : 'flex-row'"
  >
    <preview-pane v-for="child in pane.items" :key="child.id" :pane="child" />
  </div>
</template>

<script>
import ContextMenu from './ContextMenu.vue'

export default {
  name: 'PreviewPane',

  components: { ContextMenu },

  props: {
    pane: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      isFocused: false,
      snapshotBeforeEdit: null,
      actions: [
        { label: 'Split in 2 horizontally', split: ['horizontal', 2] },
        { label: 'Split in 2 vertically', split: ['vertical', 2] },
        { label: 'Split in 3 horizontally', split: ['horizontal', 3] },
        { label: 'Split in 3 vertically', split: ['vertical', 3] }
      ]
    }
  },

  computed: {
    isPaneGroup() {
      return this.pane.items?.length > 0
    },
    focusColor() {
      return this.$layout.colors.bg
    }
  },

  methods: {
    splitIntoPanes(direction, paneCount = 2) {
      this.$layout.splitPane(this.pane.id, direction, paneCount)
    },

    startEditing() {
      this.isFocused = true
      // Typing is one undo step: the snapshot is committed on change (blur after an edit)
      this.snapshotBeforeEdit = this.$layout.snapshot()
    },

    openContextMenu(e) {
      this.$refs.menu.open(e)
    }
  }
}
</script>
