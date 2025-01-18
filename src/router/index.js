import { createRouter, createWebHistory } from 'vue-router'
import ListingView from '@/presenters/Listing/ListingView.vue'
import UnderConstruction from '@/presenters/UnderConstruction/UnderConstruction.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'ListingView',
      component: ListingView,
      beforeEnter: (to, from, next) => {
        const hasAccess = localStorage.getItem('site-access') === 'granted'
        if (!hasAccess) {
          next('/building')
        } else {
          next()
        }
      }
    },
    {
      path: '/building',
      name: 'UnderConstruction',
      component: UnderConstruction
    },
    {
      path: '/listing',
      name: 'Listing',
      component: ListingView,
      beforeEnter: (to, from, next) => {
        const hasAccess = localStorage.getItem('site-access') === 'granted'
        if (!hasAccess) {
          next('/building')
        } else {
          next()
        }
      }
    },
    {
      path: '/cheapest',
      name: 'Cheapest',
      component: () => import('../presenters/Cheapest/CheapestView.vue'),
      beforeEnter: (to, from, next) => {
        const hasAccess = localStorage.getItem('site-access') === 'granted'
        if (!hasAccess) {
          next('/building')
        } else {
          next()
        }
      }
    },
  ],
})

export default router
