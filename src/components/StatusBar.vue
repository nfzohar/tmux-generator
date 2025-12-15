<template>
  <div
    class="flex flex-row gap-2 items-center justify-between px-3 py-2 w-full text-sm dark:bg-slate-800"
  >
    <div class="flex items-center gap-2">
      <button
        class="flex items-center gap-2 p-2 bg-gray-700 hover:bg-blue-800 transition-colors rounded-md cursor-pointer"
        :title="'Add new window'"
        @click="addNewWindow()"
      >
        <i class="fa fa-plus" />
      </button>

      <button
        v-for="(window, w) in windows"
        class="flex items-center gap-2 py-1 px-2 bg-green-700 hover:bg-green-800 transition-colors rounded-md cursor-pointer font-semibold"
        :key="w"
        v-text="window"
      />
    </div>

    <div class="flex items-center gap-2">
      <div class="flex items-center gap-2 mx-2">
        <div class="flex items-center gap-1" :title="'Select status bar text/foreground color'">
          <label :for="'foreground_color_select'" v-text="'Text'" />
          <input
            v-model="textColor"
            class="w-5 h-5 rounded-xs"
            :name="'foreground_color_select'"
            type="color"
          />
        </div>
        <div class="flex items-center gap-1" :title="'Select status bar background color'">
          <label :for="'background_color_select'" v-text="'Background'" />
          <input
            v-model="bgColor"
            class="w-5 h-5 rounded-xs"
            :name="'background_color_select'"
            type="color"
          />
        </div>
      </div>

      <span v-text="timestamp" />
    </div>
  </div>
</template>

<script>
import format from 'date-fns/format'

export default {
  name: 'StatusBar',

  props: {
    pane: {
      type: Object,
      required: false,
      default: () => {}
    }
  },

  data() {
    return {
      sequence: 1,
      windows: ['Window'],
      timestamp: '',
      textColor: '',
      bgColor: '',
      timer: null
    }
  },

  watch: {
    textColor() {
      this.$layout.colors['txt'] = this.textColor
    },
    backgroundColor() {
      this.$layout.colors['bg'] = this.bgColor
    }
  },

  mounted() {
    this.textColor = this.$layout.colors['txt']
    this.bgColor = this.$layout.colors['bg']

    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
  },

  beforeUnmount() {
    clearInterval(this.timer)
  },

  methods: {
    addNewWindow() {
      this.windows.push(`Window`)
      this.sequence++
    },

    updateTime() {
      this.timestamp = format(new Date(), 'HH:mm dd-MMM-yy')
    }
  }
}
</script>
