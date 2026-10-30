<template>
  <Teleport to="body">
    <div
      v-show="visible"
      ref="menu"
      class="fixed z-[9999] text-black dark:text-white"
      :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
      @click.stop
    >
      <ul class="menu flex flex-col rounded-md shadow-xl overflow-hidden border border-gray-700">
        <li
          v-for="item in items"
          :key="item.label"
          class="cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-4 text-sm"
          v-text="item.label"
          @click="select(item)"
        />
      </ul>
    </div>
  </Teleport>
</template>

<script>
// Only one context menu may be open at a time, across all panes
let openMenu = null

export default {
  name: 'ContextMenu',

  emits: ['select'],

  props: {
    // [{ label: String, ...anything passed back on select }]
    items: {
      type: Array,
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
    open(e) {
      e.preventDefault()

      if (openMenu && openMenu !== this) {
        openMenu.hide()
      }
      openMenu = this
      this.visible = true

      this.$nextTick(() => {
        const menu = this.$refs.menu

        if (!menu) {
          return
        }

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

    select(item) {
      this.$emit('select', item)
      this.hide()
    }
  }
}
</script>
