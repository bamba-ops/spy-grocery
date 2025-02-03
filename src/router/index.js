import { createRouter, createWebHistory } from 'vue-router'
import Listing from '@/views/Listing.vue'
import UnderConstruction from '@/views/UnderConstruction.vue'
import Cheapest from '@/views/Cheapest.vue'
import Landing from '@/views/Landing.vue'
import Profile from '@/views/Profile.vue'
import Price from '@/views/Price.vue'
import SignInMagic from '@/views/SignInMagic.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing,
    },
    {
      path: '/price',
      name: 'Price',
      component: Price,
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
    },
    {
      path: '/building',
      name: 'UnderConstruction',
      component: UnderConstruction
    },
    {
      path: '/listing',
      name: 'Listing',
      component: Listing,
      //meta: { requiresAuth: true }
    },
    {
      path: '/cheapest',
      name: 'Cheapest',
      component: Cheapest,
      //meta: { requiresAuth: true }
    },
    {
      path: '/auth',
      name: 'SignInMagic',
      component: SignInMagic,
    },
    {
      path: '/payment',
      name: 'payment-status',
      component: () => import('@/views/PaymentStatus.vue')
    }
  ],
})

router.beforeEach((to, from, next) => {
  const accessData = JSON.parse(localStorage.getItem("site-access"));
  const isValidAccess = accessData?.status === "granted" && Date.now() < accessData.expires;

  if (to.meta.requiresAuth) {
    isValidAccess ? next() : (localStorage.removeItem("site-access"), next("/building"));
  } else {
    next();
  }
})

export default router
