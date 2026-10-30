import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import '@fortawesome/fontawesome-free/css/all.css'
import './style.css'

import plugin from './stores/index'

const pinia = createPinia()

const app = createApp(App)

app.use(pinia)

app.use(plugin)

app.mount('#app')
