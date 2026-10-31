<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-6 w-full mx-4"
        :class="panelClass"
        role="dialog"
        aria-modal="true"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// Modal shell shared by every dialog: closes on a backdrop click or Escape
export default defineComponent({
  name: 'BaseDialog',

  props: {
    show: {
      type: Boolean,
      required: true
    },
    // Size of the panel, e.g. 'max-w-md'
    panelClass: {
      type: String,
      default: ''
    }
  },

  emits: ['close'],

  watch: {
    show: {
      immediate: true,
      handler(show: boolean) {
        if (show) {
          window.addEventListener('keydown', this.closeOnEscape)
        } else {
          window.removeEventListener('keydown', this.closeOnEscape)
        }
      }
    }
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.closeOnEscape)
  },

  methods: {
    closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        this.$emit('close')
      }
    }
  }
})
</script>
