<template>
  <div class="flex-1 p-6">
    <div class="h-full flex flex-col">
      <!-- Layout Preview -->
      <div
        class="flex-1 p-6 bg-white dark:bg-gray-900 border-5 border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <a-pane-group v-if="paneIsAGroup(mainPane)" :pane-group="mainPane" />
        <a-pane v-else :pane="mainPane" />
      </div>
    </div>
  </div>
</template>

<script>
import APane from './PreviewPane.vue'
import APaneGroup from './PreviewPaneGroup.vue'

export default {
  name: 'ThePreview',

  components: { APane, APaneGroup },

  props: {},

  data() {
    return {
      mainPane: { id: 0, children: [], direction: null }
    }
  },

  methods: {
    paneIsAGroup(pane) {
      return typeof pane === 'object' && Array.isArray(pane)
    },

    isSelectedPane(paneId) {
      return this.selectedPane === paneId
    }
  }
}
</script>
