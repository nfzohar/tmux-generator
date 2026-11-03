<template>
  <base-dialog :show="show" :panel-class="'max-w-lg'" @close="$emit('cancel')">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h3
          class="text-lg font-semibold text-gray-900 dark:text-white"
          v-text="$label('preset-dialog-title')"
        />
        <p
          class="text-sm text-gray-600 dark:text-gray-300"
          v-text="$label('preset-dialog-subtitle')"
        />
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          v-for="preset in presets"
          :key="preset.label"
          type="button"
          class="flex flex-col gap-2 p-2 rounded-md text-left ring-1 ring-inset ring-gray-300 hover:ring-2 hover:ring-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 dark:ring-gray-700 dark:hover:ring-green-700 transition-shadow cursor-pointer"
          @click="$emit('select', preset.shape)"
        >
          <div class="flex aspect-video p-1 rounded-md bg-gray-100 dark:bg-gray-800">
            <pane-shape-preview :shape="preset.shape" />
          </div>
          <small class="font-medium" v-text="$label(preset.label)" />
        </button>
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          class="flex items-center gap-2 py-2 px-3 bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white transition-colors rounded-md font-semibold cursor-pointer"
          @click="$emit('cancel')"
        >
          <small v-text="$label('dialog-cancel')" />
        </button>
      </div>
    </div>
  </base-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseDialog from './BaseDialog.vue'
import PaneShapePreview from './PaneShapePreview.vue'
import { presets, type PaneShape } from '../presets'

// Picks one of the preset layouts to split a pane into
export default defineComponent({
  name: 'PresetDialog',

  components: { BaseDialog, PaneShapePreview },

  props: {
    show: {
      type: Boolean,
      required: true
    }
  },

  // Escape and a backdrop click cancel
  emits: {
    select: (shape: PaneShape) => shape !== null,
    cancel: () => true
  },

  data() {
    return { presets }
  }
})
</script>
