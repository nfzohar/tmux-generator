<template>
  <div v-if="isPaneGroup(paneGroup)" :class="panesGroupDirection">
    <template v-for="(pane, p) in groupPanes" :key="p">
      <preview-pane-group v-if="isPaneGroup(pane)" />
      <a-pane v-else :pane="paneGroup" />
    </template>
  </div>
</template>

<script>
import APane from './PreviewPane.vue'

export default {
  name: 'PreviewPaneGroup',

  components: { APane },

  props: {
    paneGroup: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    panesGroupDirection() {
      if (pane?.direction == 'vertical') {
        return 'flex flex-col'
      }
      return 'flex flex-row'
    },
    groupPanes() {
      return []
    }
  },

  methods: {
    isPaneGroup(pane) {
      return Array.isArray(pane)
    }
  }
}
</script>
