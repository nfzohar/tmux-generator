<template>
  <base-dialog :show="show" :panel-class="'max-w-sm'" @close="$emit('cancel')">
    <form class="flex flex-col gap-4" @submit.prevent="confirm()">
      <h3
        class="text-lg font-semibold text-gray-900 dark:text-white"
        v-text="$label('split-dialog-title')"
      />

      <div class="flex gap-3">
        <input-wrapper
          class="flex-1"
          :label="$label('split-dialog-columns')"
          :name="'split-columns'"
        >
          <input
            id="split-columns"
            ref="columns"
            v-model.number="columns"
            type="number"
            inputmode="numeric"
            min="1"
            :max="maxCount"
            class="block w-full p-2 rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white dark:bg-slate-700 dark:ring-0 dark:focus:ring-0"
          />
        </input-wrapper>

        <input-wrapper class="flex-1" :label="$label('split-dialog-rows')" :name="'split-rows'">
          <input
            id="split-rows"
            v-model.number="rows"
            type="number"
            inputmode="numeric"
            min="1"
            :max="maxCount"
            class="block w-full p-2 rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white dark:bg-slate-700 dark:ring-0 dark:focus:ring-0"
          />
        </input-wrapper>
      </div>

      <div class="flex aspect-video p-1 rounded-md bg-gray-100 dark:bg-gray-800">
        <pane-shape-preview :shape="shape" />
      </div>

      <p
        class="text-sm text-gray-600 dark:text-gray-300"
        v-text="$label('split-dialog-count', { count: valid ? count : '-' })"
      />

      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="flex items-center gap-2 py-2 px-3 bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-700 dark:bg-gray-700 dark:text-white dark:ring-0 dark:hover:bg-blue-800 dark:hover:text-white transition-colors rounded-md font-semibold cursor-pointer"
          @click="$emit('cancel')"
        >
          <small v-text="$label('dialog-cancel')" />
        </button>

        <button
          type="submit"
          class="flex items-center gap-2 py-2 px-3 text-white bg-green-700 hover:bg-green-800 transition-colors rounded-md font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-700"
          :disabled="!valid"
        >
          <i class="fa fa-table-cells" />
          <small v-text="$label('split-dialog-confirm')" />
        </button>
      </div>
    </form>
  </base-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseDialog from './BaseDialog.vue'
import InputWrapper from './InputWrapper.vue'
import PaneShapePreview from './PaneShapePreview.vue'
import { gridShape, type PaneShape } from '../presets'

// Most columns or rows in one split, more leaves tmux panes too small to use
const maxCount = 8

const isCount = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 1 && (value as number) <= maxCount

// Asks how many columns and rows to split a pane into, confirms with their grid shape
export default defineComponent({
  name: 'SplitDialog',

  components: { BaseDialog, InputWrapper, PaneShapePreview },

  props: {
    show: {
      type: Boolean,
      required: true
    }
  },

  // Escape and a backdrop click cancel
  emits: {
    confirm: (shape: PaneShape) => shape !== null,
    cancel: () => true
  },

  data() {
    return {
      maxCount,
      // Number while valid, the inputs give '' when cleared
      columns: 2 as number | string,
      rows: 1 as number | string
    }
  },

  computed: {
    count(): number {
      return this.previewColumns * this.previewRows
    },
    shape(): PaneShape {
      return gridShape(this.previewColumns, this.previewRows)
    },
    valid(): boolean {
      return isCount(this.columns) && isCount(this.rows) && this.count >= 2
    },

    // The preview keeps the last sensible size while an input is being edited
    previewColumns(): number {
      return isCount(this.columns) ? this.columns : 1
    },
    previewRows(): number {
      return isCount(this.rows) ? this.rows : 1
    }
  },

  watch: {
    show(show: boolean) {
      if (show) {
        this.columns = 2
        this.rows = 1
        this.$nextTick(() => (this.$refs.columns as HTMLInputElement | undefined)?.select())
      }
    }
  },

  methods: {
    confirm() {
      if (this.valid) {
        this.$emit('confirm', this.shape)
      }
    }
  }
})
</script>
