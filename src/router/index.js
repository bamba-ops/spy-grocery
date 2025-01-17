import { createRouter, createWebHistory } from 'vue-router'
import ListingView from '@/presenters/Listing/ListingView.vue'
import UnderConstruction from '@/presenters/UnderConstruction/UnderConstruction.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'ListingView',
      //redirect: '/building',
      component: ListingView,
    },
    {
      path: '/building',
      name: 'UnderConstruction',
      component: UnderConstruction
    },
    {
      path: '/cheapest',
      name: 'Cheapest',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../presenters/Cheapest/CheapestView.vue'),
    },
  ],
})

export default router
