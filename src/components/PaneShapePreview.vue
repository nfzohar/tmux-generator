<template>
  <div
    v-if="!shape"
    class="flex-1 min-w-0 min-h-0 rounded-sm border-2 border-gray-300 bg-white dark:border-slate-700 dark:bg-black"
  />

  <div
    v-else
    class="flex flex-1 min-w-0 min-h-0 gap-1"
    :class="shape.direction == 'vertical' ? 'flex-col' : 'flex-row'"
  >
    <pane-shape-preview v-for="(item, index) in shape.items" :key="index" :shape="item" />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { PaneShape } from '../presets'

// Thumbnail of a PaneShape, drawn recursively like PreviewPane. Needs a flex parent
export default defineComponent({
  name: 'PaneShapePreview',

  props: {
    shape: {
      type: Object as PropType<PaneShape>,
      default: null
    }
  }
})
</script>
