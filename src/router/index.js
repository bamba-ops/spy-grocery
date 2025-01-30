import { createRouter, createWebHistory } from 'vue-router'
import Listing from '@/views/Listing.vue'
import UnderConstruction from '@/views/UnderConstruction.vue'
import Cheapest from '@/views/Cheapest.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/listing'
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
      meta: { requiresAuth: true }
    },
    {
      path: '/cheapest',
      name: 'Cheapest',
      component: Cheapest,
      meta: { requiresAuth: true }
    },
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
