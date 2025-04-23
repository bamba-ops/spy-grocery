import { createRouter, createWebHistory } from 'vue-router'
import Listing from '../views/Listing.vue'
import Landing from '@/views/Landing.vue'
import Product from '@/views/Product.vue'
import Auth from '@/views/Auth.vue'
import MaintenancePage from '@/views/Maintenance.vue'
import CartListing from '@/views/CartListing.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing
  },
  {
    path: '/listing',
    name: 'Listing',
    component: Listing,
  },
  {
    path: '/product/:id',
    name: 'Product',
    component: Product
  },
  {
    path: '/cart',
    name: 'CartListing',
    component: CartListing
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: MaintenancePage
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

// Global beforeEach pour rediriger vers la page de maintenance
router.beforeEach((to, from, next) => {
  // Si le site est en maintenance et que l'utilisateur n'est pas déjà sur /maintenance
  if (import.meta.env.VITE_SITE_MAINTENANCE === 'true' && to.path !== '/maintenance') {
    next('/maintenance')
  } else {
    next()
  }
})

export default router
