<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
    <the-sidebar @update:configuration="config = $event" />
    <the-preview :configuration="config" />
    <the-generator :configuration="config" />
  </div>
</template>

<script>
import TheSidebar from './components/Sidebar.vue'
import ThePreview from './components/Preview.vue'
import TheGenerator from './components/Generator.vue'

export default {
  name: 'App',

  components: { TheSidebar, ThePreview, TheGenerator },

  data() {
    return { config: {} }
  },

  created() {
    document.title = 'Tmux Layout Builder'
  }
}
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
