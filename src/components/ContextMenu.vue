<template>
  <Teleport to="body">
    <div
      v-show="visible"
      ref="menu"
      class="fixed z-[9999] text-gray-900 dark:text-white"
      :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
      @click.stop
    >
      <ul
        class="menu flex flex-col rounded-md shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <li
          v-for="(item, index) in items"
          :key="item.label"
          class="cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-4 text-sm"
          v-text="item.label"
          @click="select(index)"
        />
      </ul>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

// Only one context menu may be open at a time, across all panes
let openMenu: { hide: () => void } | null = null

export default defineComponent({
  name: 'ContextMenu',

  emits: {
    // Index of the selected item
    select: (index: number) => Number.isInteger(index)
  },

  props: {
    items: {
      type: Array as PropType<{ label: string }[]>,
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
    open(e: MouseEvent) {
      e.preventDefault()

      if (openMenu && openMenu !== this) {
        openMenu.hide()
      }
      openMenu = this
      this.visible = true

      this.$nextTick(() => {
        const menu = this.$refs.menu as HTMLElement | undefined

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

    select(index: number) {
      this.$emit('select', index)
      this.hide()
    }
  }
})
</script>
