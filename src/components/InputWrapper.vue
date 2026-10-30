<template>
  <div class="flex gap-1" :class="{ 'flex-col': type != 'checkbox' }">
    <slot v-if="labelPosition == 'bottom'" />
    <label
      class="block text-sm font-medium text-slate-700 dark:text-slate-300 capitalize"
      :for="name"
      v-text="label"
    />
    <slot v-if="labelPosition == 'top'" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InputWrapper',

  props: {
    label: {
      type: String,
      default: 'id'
    },
    name: {
      type: String,
      default: 'id'
    },
    type: {
      type: String,
      default: 'text'
    },
    labelPosition: {
      type: String,
      default: 'top'
    }
  }
})
</script>
