<template>
  <tippy interactive :arrow="true" :trigger="'click'" :placement="'left'">
    <button
      class="flex items-center gap-1 p-1 transition-colors rounded-md font-semibold cursor-pointer hover:text-blue-500 text-md"
      :title="'More actions'"
      tabindex="-1"
      @click="splitPane('vertical')"
    >
      <i class="fa fa-ellipsis" />
    </button>

    <template #content>
      <div class="bg-gray-700 z-[1000] w-min rounded-md">
        <button
          v-for="(action, a) in actions"
          :key="a"
          class="block w-52 text-sm text-left py-1 px-2 hover:bg-gray-600 cursor-pointer"
          v-text="action?.label"
          @click.prevent="$emit(action?.emit)"
        />
      </div>
    </template>
  </tippy>
</template>

<script>
import { Tippy } from 'vue-tippy'

export default {
  name: 'PaneActions',

  components: { Tippy },

  data() {
    return {
      actions: [
        {
          emit: 'split3Horizontal',
          label: 'Split to 3 panes horizontally'
        },
        {
          emit: 'split3Vertical',
          label: 'Split to 3 panes vertically'
        }
      ]
    }
  }
}
</script>
