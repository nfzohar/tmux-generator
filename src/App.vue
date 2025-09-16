<template>
  <tmux-layout-builder />
</template>

<script>
import TmuxLayoutBuilder from "./components/TmuxLayoutBuilder.vue";

export default {
  name: "App",

  components: { TmuxLayoutBuilder },

  created() {
    const title = '-'

    document.title = title
  }
};
</script>
