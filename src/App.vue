<template>
  <main-dashboard />
</template>

<script>
import MainDashboard from "./components/Dashboard.vue";

export default {
  name: "App",

  components: { MainDashboard },

  created() {
    document.title = 'Tmux Layout Builder'
  }
};
</script>

<style scoped>
/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4a5568;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #2d3748;
}
</style>