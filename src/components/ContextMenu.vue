<template>
  <Teleport to="body">
    <div
      v-show="visible"
      ref="menu"
      class="absolute z-[9999] text-black dark:text-white"
      :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
      @click.stop
    >
      <ul class="menu flex flex-col rounded-md shadow-xl overflow-hidden border border-gray-700">
        <template v-for="item in items" :key="item">
          <li
            class="cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800/50 p-4 text-sm"
            v-text="item"
            @click="emit(item)"
          />
        </template>
      </ul>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'ContextMenu',

  props: {
    items: {
      type: [Array, Object],
      required: false,
      default: () => []
    }
  },

  data() {
    return {
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
    },

    emit(value) {
      this.$emit(this.emitify(value))
      this.hide()
    },

    emitify(value) {
      return value
        .replace(/[()]/g, '')
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`)
        .join('')
    }
  }
}
</script>
