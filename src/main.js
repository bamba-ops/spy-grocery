import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue'


import App from './App.vue'
import router from './router'
import './assets/index.css'
import i18n from './plugin/i18n'


const app = createApp(App)
const head = createHead()


app.use(createPinia())
app.use(router)
app.use(i18n);

app.mount('#app')
