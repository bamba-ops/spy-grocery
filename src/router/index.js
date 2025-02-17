import { createRouter, createWebHistory } from 'vue-router'
import Listing from '../views/Listing.vue'
import Compare from '@/views/Compare.vue'
import Auth from '@/views/Auth.vue'
import Profile from '@/views/Profile.vue'
import Landing from '@/views/Landing.vue'
import Pricing from '@/views/Pricing.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing
    },
    {
      path: '/pricing',
      name: 'Pricing',
      component: Pricing
    },
    {
      path: '/listing',
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
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      beforeEnter: async (to, from, next) => {
        const authStore = useAuthStore();
        await authStore.initUserSession()
        if (await authStore.session) {
          next();
        } else {
          next('/auth'); // Redirection vers la page d'authentification
        }
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }

  }
})

export default router
