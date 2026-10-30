<template>
  <button
    class="flex items-center bg-green-700 gap-2 py-1 px-3 hover:bg-green-800 transition-colors rounded-md font-semibold cursor-pointer"
    :title="'Export layout as program'"
    @click.prevent="show = !show"
  >
    <i class="fa fa-file" />
    <small v-text="'Export'" />
  </button>

  <div
    v-if="show"
    class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
    @click.self="show = false"
  >
    <div
      class="bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg p-6 w-full max-w-6xl mx-4 h-[80vh]"
    >
      <div class="flex items-start gap-5 w-full h-full">
        <div class="flex flex-col gap-3 w-64 shrink-0">
          <h3
            class="text-lg text-center font-semibold text-gray-900 dark:text-white"
            v-text="'Export TMUX Configuration'"
          />

          <div class="flex flex-col gap-5 bg-gray-100 dark:bg-gray-800 rounded-md p-3 my-1">
            <input-wrapper :label="'Session Name'" :name="'session-name'">
              <input
                v-model="sessionName"
                id="session-name"
                type="text"
                class="block w-full p-2 rounded-md shadow-sm focus:outline-none focus:ring-0 bg-white dark:bg-slate-700"
                :placeholder="generatedSessionName"
              />
            </input-wrapper>

            <input-wrapper
              :label="`Add 'Is TMUX installed' check`"
              :label-position="'bottom'"
              :name="'tmux-installed-check'"
              :title="`Check if tmux is installed on your system and install it if missing.`"
              type="checkbox"
            >
              <input
                id="tmux-installed-check"
                v-model="checkTmuxInstall"
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

            <input-wrapper
              :label="'Show comments'"
              :label-position="'bottom'"
              :name="'show-comments'"
              :title="`Toggle comments for script commands.`"
              type="checkbox"
            >
              <input
                id="show-comments"
                v-model="showComments"
                type="checkbox"
                class="rounded border-slate-600"
              />
            </input-wrapper>
          </div>

          <button
            class="bg-green-700 text-white gap-2 p-2 hover:bg-green-800 transition-colors rounded-md font-semibold cursor-pointer text-center"
            @click="downloadScriptAsAFile()"
          >
            <i class="fa fa-download pr-2" />
            <small v-text="'Download'" />
          </button>
        </div>

        <div
          class="flex flex-col bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 overflow-hidden rounded-lg p-4 h-full flex-1 min-w-0"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium" v-text="'Generated Script'" />

            <button
              class="flex items-center bg-gray-700 text-white gap-2 p-2 hover:bg-blue-800 transition-colors rounded-md font-semibold cursor-pointer"
              @click="copyScriptToClipboard()"
            >
              <i class="fa" :class="copied ? 'fa-check' : 'fa-copy'" />
              <small v-text="copied ? 'Copied' : 'Copy'" />
            </button>
          </div>

          <pre
            class="block text-xs font-mono whitespace-pre-wrap overflow-auto scrollbar-hide flex-1 min-h-0 pt-1 mt-4"
            v-text="generatedScript"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import InputWrapper from './InputWrapper.vue'
import { generateScript, type Pane } from '../generator'

export default defineComponent({
  name: 'ExportDialog',

  components: { InputWrapper },

  props: {
    paneTree: {
      type: Object as PropType<Pane>,
      required: true
    }
  },

  data() {
    return {
      show: false,
      copied: false,
      sessionName: '',
      generatedSessionName: `session_${Math.random().toString().slice(2, 8)}`,
      showComments: true,
      mouseInputEnabled: false,
      checkTmuxInstall: false
    }
  },

  computed: {
    tmuxSessionName(): string {
      // tmux rejects "." and ":" in session names, keep it shell-safe too
      return this.sessionName.trim().replace(/[^\w-]+/g, '_') || this.generatedSessionName
    },

    generatedScript(): string {
      return generateScript(this.paneTree, {
        sessionName: this.tmuxSessionName,
        colors: this.$layout.colors,
        showComments: this.showComments,
        mouseInputEnabled: this.mouseInputEnabled,
        checkTmuxInstall: this.checkTmuxInstall
      })
    }
  },

  methods: {
    downloadScriptAsAFile() {
      const blob = new Blob([this.generatedScript], {
        type: 'text/x-shellscript'
      })
      const a = document.createElement('a')
      const url = URL.createObjectURL(blob)

      a.download = `${this.tmuxSessionName}.sh`
      a.href = url
      a.click()

      URL.revokeObjectURL(url)
    },

    async copyScriptToClipboard() {
      await navigator.clipboard.writeText(this.generatedScript)

      this.copied = true
      setTimeout(() => (this.copied = false), 1500)
    }
  }
})
</script>
