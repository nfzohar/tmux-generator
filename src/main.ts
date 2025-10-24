import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import PreviewPane from './components/Pane.vue'
import PreviewPaneGroup from './components/PaneGroup.vue'

import '@fortawesome/fontawesome-free/css/all.css'

import plugin from './stores/index'

const pinia = createPinia()

const app = createApp(App)

app.use(pinia)

app.use(plugin)

app.component('APane', PreviewPane)

app.component('APaneGroup', PreviewPaneGroup)

app.mount('#app')
