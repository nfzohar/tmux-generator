<template>
  <button
    class="flex items-center justify-center self-stretch w-7 min-h-7 pointer-coarse:w-9 pointer-coarse:min-h-9 bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white transition-colors rounded-md cursor-pointer"
    :title="$label(`theme-switch-to-${next}`)"
    :aria-label="$label(`theme-switch-to-${next}`)"
    @click="toggle()"
  >
    <i class="fa fa-fw" :class="theme === 'dark' ? 'fa-moon' : 'fa-sun'" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

type Theme = 'light' | 'dark'

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

export default defineComponent({
  name: 'ThemeToggle',

  data() {
    return {
      browserTheme: (darkQuery.matches ? 'dark' : 'light') as Theme,
      // Set once toggled, until then the theme follows the browser
      chosenTheme: null as Theme | null
    }
  },

  computed: {
    theme(): Theme {
      return this.chosenTheme ?? this.browserTheme
    },
    next(): Theme {
      return this.theme === 'dark' ? 'light' : 'dark'
    }
  },

  mounted() {
    darkQuery.addEventListener('change', this.onBrowserThemeChange)
  },

  beforeUnmount() {
    darkQuery.removeEventListener('change', this.onBrowserThemeChange)
  },

  methods: {
    toggle() {
      this.chosenTheme = this.next
      // style.css makes the dark variant follow data-theme once it is set
      document.documentElement.dataset.theme = this.chosenTheme
    },

    onBrowserThemeChange(event: MediaQueryListEvent) {
      this.browserTheme = event.matches ? 'dark' : 'light'
    }
  }
})
</script>
