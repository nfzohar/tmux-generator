<template>
  <base-dialog :show="show" :panel-class="'max-w-md'" @close="$emit('cancel')">
    <div class="flex flex-col gap-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white" v-text="title" />

      <p class="text-sm text-gray-600 dark:text-gray-300" v-text="message" />

      <div class="flex justify-end gap-2 mt-2">
        <button
          v-if="cancelLabel"
          class="flex items-center gap-2 py-2 px-3 bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white transition-colors rounded-md font-semibold cursor-pointer"
          @click="$emit('cancel')"
        >
          <small v-text="cancelLabel" />
        </button>

        <button
          ref="confirm"
          class="flex items-center gap-2 py-2 px-3 text-white transition-colors rounded-md font-semibold cursor-pointer"
          :class="danger ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'"
          @click="$emit('confirm')"
        >
          <i v-if="confirmIcon" class="fa" :class="confirmIcon" />
          <small v-text="confirmLabel" />
        </button>
      </div>
    </div>
  </base-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseDialog from './BaseDialog.vue'
import { label } from '../labels'

// A message with a confirm button, and a cancel button when cancelLabel is set
export default defineComponent({
  name: 'ConfirmDialog',

  components: { BaseDialog },

  props: {
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    confirmLabel: {
      type: String,
      default: () => label('dialog-ok')
    },
    confirmIcon: {
      type: String,
      default: ''
    },
    cancelLabel: {
      type: String,
      default: ''
    },
    // Red confirm button, for actions that delete something
    danger: {
      type: Boolean,
      default: false
    }
  },

  // Escape and a backdrop click cancel
  emits: ['confirm', 'cancel'],

  watch: {
    // Focus the confirm button like a native confirm(), so Enter confirms
    show(show: boolean) {
      if (show) {
        this.$nextTick(() => (this.$refs.confirm as HTMLButtonElement | undefined)?.focus())
      }
    }
  }
})
</script>
