import { layout } from './layout'

export default {
  install: (app: any) => {
    const layoutStore = layout()

    app.config.globalProperties.$layout = layoutStore

    //layoutStore.initializeStateFromStorage()
  }
}
