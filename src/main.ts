import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import '@fortawesome/fontawesome-free/css/all.css'
import './style.css'

import plugin from './stores/index'
import labelsPlugin, { label } from './labels'

const pinia = createPinia()

const app = createApp(App)

app.use(pinia)

app.use(plugin)

app.use(labelsPlugin)

document.title = label('document-title')

app.mount('#app')
