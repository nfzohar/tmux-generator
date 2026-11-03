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
        <span
          class="text-sm font-medium whitespace-nowrap"
          :title="$label('pane-title', { id: pane.id })"
        >
          <span class="hidden @[10rem]:inline" v-text="`${$label('pane')} `" />{{ pane.id }}
        </span>
      </div>

      <div class="flex items-center gap-1 p-2 shrink-0">
        <button
          class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md pointer-coarse:p-2"
          :title="$label('pane-split-horizontally-title')"
          tabindex="-1"
          @click="splitIntoPanes('horizontal')"
        >
          <i class="fa fa-arrows-left-right" />
          <small class="hidden @sm:inline" v-text="$label('pane-split-horizontally')" />
        </button>

        <button
          class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md pointer-coarse:p-2"
          :title="$label('pane-split-vertically-title')"
          tabindex="-1"
          @click="splitIntoPanes('vertical')"
        >
          <i class="fa fa-arrows-up-down" />
          <small class="hidden @sm:inline" v-text="$label('pane-split-vertically')" />
        </button>

        <button
          class="hidden pointer-coarse:flex items-center p-2 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md"
          :title="$label('pane-more-title')"
          :aria-label="$label('pane-more-title')"
          tabindex="-1"
          @click.stop="openContextMenu"
        >
          <i class="fa fa-ellipsis-vertical" />
        </button>
      </div>
    </div>

    <textarea
      :value="pane.command"
      class="block w-full h-full px-4 py-2 focus:outline-none rounded-b-lg border-t border-gray-200 dark:border-none resize-none bg-transparent"
      :placeholder="$label('pane-command-placeholder')"
      @input="setCommand"
      @focus="startEditing"
      @blur="isFocused = false"
      @change="$layout.pushHistory(snapshotBeforeEdit)"
    />

    <context-menu ref="menu" :items="actions" @select="actions[$event].select()" />

    <preset-dialog
      :show="openDialog === 'presets'"
      @select="splitInto"
      @cancel="openDialog = null"
    />

    <split-dialog :show="openDialog === 'grid'" @confirm="splitInto" @cancel="openDialog = null" />
  </div>

  <div
    v-else
    class="flex flex-1 min-w-0 min-h-0 gap-2"
    :class="pane.direction == 'vertical' ? 'flex-col' : 'flex-row'"
  >
    <preview-pane
      v-for="child in pane.items"
      :key="child.id"
      :pane="child"
      @reset="$emit('reset')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import ContextMenu from './ContextMenu.vue'
import SplitDialog from './SplitDialog.vue'
import PresetDialog from './PresetDialog.vue'
import type { Direction, Pane } from '../generator'
import type { PaneShape } from '../presets'

export default defineComponent({
  name: 'PreviewPane',

  components: { ContextMenu, SplitDialog, PresetDialog },

  props: {
    pane: {
      type: Object as PropType<Pane>,
      required: true
    }
  },

  // Asks for the full reset, which App confirms first. Passed up through the pane groups
  emits: ['reset'],

  data() {
    return {
      isFocused: false,
      snapshotBeforeEdit: '',
      openDialog: null as 'presets' | 'grid' | null
    }
  },

  computed: {
    actions(): { label: string; select: () => void }[] {
      return [
        { label: this.$label('pane-presets'), select: () => (this.openDialog = 'presets') },
        { label: this.$label('pane-split-grid'), select: () => (this.openDialog = 'grid') },
        { label: this.$label('reset'), select: () => this.$emit('reset') }
      ]
    },

    isPaneGroup(): boolean {
      return this.pane.items?.length > 0
    },
    focusColor(): string {
      return this.$layout.activeColors.bg
    }
  },

  methods: {
    splitIntoPanes(direction: Direction) {
      this.$layout.splitPane(this.pane.id, direction)
    },

    splitInto(shape: PaneShape) {
      this.openDialog = null
      this.$layout.splitPaneInto(this.pane.id, shape)
    },

    setCommand(event: Event) {
      this.$layout.setCommand(this.pane.id, (event.target as HTMLTextAreaElement).value)
    },

    startEditing() {
      this.isFocused = true
      // Typing is one undo step: the snapshot is committed on change (blur after an edit)
      this.snapshotBeforeEdit = this.$layout.snapshot()
    },

    openContextMenu(e: MouseEvent) {
      ;(this.$refs.menu as InstanceType<typeof ContextMenu>).open(e)
    }
  }
})
</script>
