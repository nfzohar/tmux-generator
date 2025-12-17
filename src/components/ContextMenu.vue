<template>
  <Teleport to="body">
    <div
      v-show="visible"
      ref="menu"
      class="absolute z-[9999] text-black dark:text-white"
      :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
      @click.stop
    >
      <ul class="menu flex flex-col rounded-md shadow-xl overflow-hidden">
        <li class="context-menu-item" @click="emit('split', 'horizontal')">Split Horizontally</li>

        <li class="context-menu-item" @click="emit('split', 'vertical')">Split Vertically</li>

        <li class="context-menu-item" @click="emit('close')">Close Pane</li>
      </ul>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'PaneContextMenu',

  emits: ['split', 'close'],

  data() {
    return {
      pane: null,
      visible: false,
      pos: { x: 0, y: 0 }
    }
  },

  mounted() {
    document.addEventListener('click', this.hide)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.hide)
  },

  methods: {
    open(e, pane) {
      e.preventDefault()

      this.pane = pane
      this.visible = true

      this.$nextTick(() => {
        const menu = this.$refs.menu
        if (!menu) return

        const { offsetWidth, offsetHeight } = menu

        let x = e.clientX
        let y = e.clientY

        if (x + offsetWidth > window.innerWidth) {
          x = window.innerWidth - offsetWidth
        }

        if (y + offsetHeight > window.innerHeight) {
          y = window.innerHeight - offsetHeight
        }

        this.pos = { x, y }
      })
    },

    hide() {
      this.visible = false
      this.pane = null
    },

    emit(type, payload) {
      this.$emit(type, { pane: this.pane, payload })
      this.hide()
    }
  }
}
</script>

<style scoped>
.context-menu-item {
  @apply cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800/50 p-4 text-sm;
}
</style>
