import './assets/index.css'
import { createPinia } from 'pinia';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './plugin/i18n'

const app = createApp(App)
const pinia = createPinia();


app.use(router)
app.use(pinia);
app.use(i18n);
app.mount('#app')
