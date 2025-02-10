import { createRouter, createWebHistory } from 'vue-router'
import Listing from '../views/Listing.vue'
import Compare from '@/views/Compare.vue'
import Auth from '@/views/Auth.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Listing',
      component: Listing,
    },
    {
      path: '/compare',
      name: 'Compare',
      component: Compare
    },
    {
      path: '/auth',
      name: 'Auth',
      component: Auth
    }
  ],
})

export default router
