<template>
  <div v-if="isGroup" class="gap-2" :class="groupClass">
    <a-pane v-for="(item, i) in pane.items" :key="i" :pane="item" />
  </div>
  <a-pane v-else :pane="pane" />
</template>

<script>
export default {
  name: 'PreviewPaneGroup',

  props: {
    pane: {
      type: Object,
      default: () => {
        return { id: 0, children: [], direction: null }
      }
    }
  },

  computed: {
    isGroup() {
      return this.pane?.items?.length ?? false
    },
    groupDirection() {
      return this.pane?.direction ?? 'horizontal'
    },
    groupClass() {
      return { horizontal: 'flex flex-row', vertical: 'flex flex-col' }[this.groupDirection]
    }
  }
}
</script>
