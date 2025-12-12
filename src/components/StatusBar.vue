<template>
  <div class="flex flex-row gap-2 items-center justify-between p-3 w-full dark:bg-slate-800">
    <div class="flex items-center gap-2">
      <button
        v-for="(window, w) in windows"
        class="flex items-center gap-2 py-1 px-2 bg-gray-700 hover:bg-blue-800 transition-colors rounded-md cursor-pointer"
        :key="w"
        v-text="window"
      />
      <button
        class="flex items-center gap-2 p-2 bg-green-700 hover:bg-green-800 transition-colors rounded-md cursor-pointer"
        @click="addNewWindow()"
      >
        <i class="fa fa-plus" />
      </button>
    </div>
  </div>
</template>

<script>
// https://medium.com/hackernoon/customizing-tmux-b3d2a5050207
// https://www.baeldung.com/linux/tmux-status-bar-customization

export default {
  name: 'StatusBar',

  props: {
    pane: {
      type: Object,
      default: () => {
        return { id: 0, direction: '', items: [] }
      }
    }
  },

  data() {
    return {
      sequence: 1,
      windows: ['Window 0']
    }
  },

  methods: {
    addNewWindow() {
      this.windows.push(`Window ${this.sequence}`)
      this.sequence++
    }
  }
}
</script>
