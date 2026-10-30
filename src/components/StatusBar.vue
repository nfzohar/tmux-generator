<template>
  <div
    class="flex flex-row gap-2 items-center justify-end px-3 py-2 w-full text-sm dark:bg-slate-800"
  >
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-2 mx-2">
        <div class="flex items-center gap-1" :title="'Select status bar foreground color'">
          <label :for="'foreground_color_select'" v-text="'Text'" />
          <input
            id="foreground_color_select"
            v-model="$layout.colors.txt"
            class="w-5 h-5 rounded-xs border-2 border-gray-700"
            type="color"
          />
        </div>
        <div class="flex items-center gap-1" :title="'Select status bar background color'">
          <label :for="'background_color_select'" v-text="'Background'" />
          <input
            id="background_color_select"
            v-model="$layout.colors.bg"
            class="w-5 h-5 rounded-xs border-2 border-gray-700"
            type="color"
          />
        </div>
      </div>

      <span
        class="py-1 px-2 rounded-md border border-gray-800"
        :style="{ backgroundColor: $layout.colors.bg, color: $layout.colors.txt }"
        :title="'Status bar custom color preview'"
        v-text="timestamp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import format from 'date-fns/format'

export default defineComponent({
  name: 'StatusBar',

  data() {
    return {
      timestamp: '',
      timer: undefined as ReturnType<typeof setInterval> | undefined
    }
  },

  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
  },

  beforeUnmount() {
    clearInterval(this.timer)
  },

  methods: {
    updateTime() {
      this.timestamp = format(new Date(), 'HH:mm dd-MMM-yy')
    }
  }
})
</script>
