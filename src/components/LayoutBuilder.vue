<template>
  <div class="flex justify-evenly gap-1 rounded-lg h-full p-5">
    <a-pane />
    <a-pane />

    <div class="w-full flex flex-col gap-1">
      <a-pane />
      <a-pane />
      <a-pane />
    </div>
    
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
