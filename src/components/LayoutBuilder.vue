<template>
  <div class="m-5 rounded-md bg-gray-800 h-full p-2">
    <a-pane />
  </div>
</template>

<script>
import APane from './Pane.vue'

export default {
  name: 'LayoutBuilder',

  components: { APane },

  data() {
    return {
      paneCommand: ''
    }
  }
}
</script>
