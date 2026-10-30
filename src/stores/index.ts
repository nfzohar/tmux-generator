import type { App } from 'vue'
import { layout } from './layout'

declare module 'vue' {
  interface ComponentCustomProperties {
    $layout: ReturnType<typeof layout>
  }
}

export default {
  install: (app: App) => {
    const layoutStore = layout()

    app.config.globalProperties.$layout = layoutStore
  }
}
