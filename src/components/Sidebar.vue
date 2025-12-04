<template>
  <div class="w-85 bg-slate-800 border-r border-slate-700 p-6 overflow-y-hidden">
    <div class="flex flex-col justify-between h-full gap-5">
      <div class="flex flex-col gap-7">
        <div>
          <h1 class="text-2xl font-bold text-white capitalize" v-text="title" />
          <p class="text-xs text-slate-400" v-text="'Build & export your new TMUX layout'" />
        </div>

        <input-wrapper :label="'Session Name'" :name="'session-name'">
          <input
            v-model="tmuxSessionName"
            id="session-name"
            type="text"
            class="mt-1 block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-700 text-white"
            placeholder="My Session"
          />
        </input-wrapper>

        <input-wrapper
          :label="`Add 'Is TMUX installed' check`"
          :label-position="'bottom'"
          :name="'tmux-installed-check'"
          :title="`Check if tmux is installed on your system and install it if it's not.`"
          type="checkbox"
        >
          <input
            id="tmux-installed-check"
            v-model="tmuxInstalledCheck"
            type="checkbox"
            class="rounded border-slate-600"
          />
        </input-wrapper>

        <input-wrapper
          :label="'Enable mouse controls'"
          :label-position="'bottom'"
          :name="'mouse-enabled'"
          :title="`Enable managing the layout with mouse input.`"
          type="checkbox"
        >
          <input
            id="mouse-enabled"
            v-model="mouseInputEnabled"
            type="checkbox"
            class="rounded border-slate-600"
          />
        </input-wrapper>

        <div class="flex gap-2">
          <button
            class="text-center w-full p-1 bg-red-800 hover:bg-red-700 font-bold rounded-md cursor-pointer"
            :title="'Reset current layout configuration.'"
            @click="resetToDefault()"
          >
            <i class="fa fa-reply" />
            {{ 'Reset' }}
          </button>

          <button
            class="text-center w-full p-1 bg-green-800 hover:bg-green-700 font-bold rounded-md cursor-pointer"
            :title="'Export the current layout configuration.'"
            @click="$layout.saveCurrentLayoutToOldLayouts()"
          >
            <i class="fa fa-file-export" />
            {{ 'Export' }}
          </button>
        </div>

        <button
          class="w-full text-left font-bold cursor-pointer hover:underline"
          v-text="`Show previous layouts (${oldLayouts?.length})`"
          @click="showOldLayouts = !showOldLayouts"
        />
      </div>

      <div v-show="showOldLayouts" class="flex flex-col gap-2 h-full overflow-scroll">
        <span
          v-if="!oldLayouts?.length"
          class="w-full text-sm text-slate-400"
          v-text="'No previous layouts.'"
        />
        <div
          v-else
          v-for="(oldLayout, l) in oldLayouts"
          class="flex flex-col bg-slate-700 rounded-md p-2 hover:bg-slate-600"
          :key="l"
        >
          <div class="flex items-center">
            <span class="w-full font-bold capitalize" v-text="oldLayout?.name" />

            <div class="flex items-center gap-2">
              <button
                class="text-center bg-red-700 rounded-md font-bold cursor-pointer hover:bg-red-600 h-8 w-8"
                :title="'Delete this layout.'"
                @click="deleteFromOldLayouts(oldLayout?.id)"
              >
                <i class="fa fa-trash" />
              </button>

              <button
                class="text-center bg-green-700 rounded-md font-bold cursor-pointer hover:bg-green-600 h-8 w-8"
                :title="'Load this layout.'"
                @click="loadOldLayout(oldLayout?.id)"
              >
                <i class="fa fa-square-up-right" />
              </button>
            </div>
          </div>

          <details v-if="layout?.commands?.length">
            <summary style="list-style: none" class="underline cursor-pointer" v-text="'Info'" />
            <span
              v-for="(command, c) in layout?.commands"
              :key="c"
              class="block"
              v-text="`Pane ${c}: ${command}`"
            />
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputWrapper from './InputWrapper.vue'

export default {
  name: 'TheSidebar',

  components: { InputWrapper },

  data() {
    return {
      tmuxSessionName: '',
      tmuxInstalledCheck: false,
      mouseInputEnabled: false,
      showOldLayouts: false
    }
  },

  computed: {
    title() {
      return document.title
    },
    currentLayout() {
      return this.$layout?.currentLayout
    },
    oldLayouts() {
      return this.$layout?.previousLayouts ?? []
    }
  },

  watch: {
    currentLayout: {
      deep: true,
      handler: function () {
        this.setValuesFromStore()
      }
    },
    tmuxSessionName() {
      this.$layout.updateCurrentLayoutProp('name', this.tmuxSessionName)
    },
    mouseInputEnabled() {
      this.$layout.updateCurrentLayoutProp('enabledMouseInput', this.mouseInputEnabled)
    },
    tmuxInstalledCheck() {
      this.$layout.updateCurrentLayoutProp('includeTmuxInstalledCheck', this.tmuxInstalledCheck)
    }
  },

  mounted() {
    this.setValuesFromStore()
  },

  methods: {
    setValuesFromStore() {
      this.tmuxSessionName = this.currentLayout?.name ?? ''
      this.mouseInputEnabled = this.currentLayout?.enabledMouseInput ?? false
      this.tmuxInstalledCheck = this.currentLayout?.includeTmuxInstalledCheck ?? false
    },

    resetToDefault() {
      if (window.confirm('Are you sure? This will permanently delete unsaved layouts.')) {
        this.$layout.resetCurrentLayout()
      }
    },

    deleteFromOldLayouts(oldLayoutId) {
      if (window.confirm('Delete this layout? This action cannot be undone.')) {
        this.$layout.loadOldIntoCurrentLayout(oldLayoutId)
      }
    },

    loadOldLayout(oldLayoutId) {
      if (window.confirm('This will overwrite your current layout. Are you sure?')) {
        this.$layout.loadOldIntoCurrentLayout(oldLayoutId)
      }
    }
  }
}
</script>
