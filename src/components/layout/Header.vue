<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'

const router = useRouter()
const { locale } = useI18n()

// Réactivité de la session Supabase
const session = ref(null)
onMounted(async () => {
  // Récupération de la session initiale
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  // Écoute des changements de session (login / logout)
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })

  // Gestion des clics hors dropdown
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// UI state
const isUserDropdownOpen = ref(false)
const isLangDropdownOpen = ref(false)

// Langue
const storedLanguage = localStorage.getItem('user-language') || locale.value
const currentLanguage = ref(storedLanguage.toUpperCase())

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('user-language', lang)
  currentLanguage.value = lang.toUpperCase()
  isLangDropdownOpen.value = false
}

// Computed
const userEmail = computed(() => session.value?.user?.email || '')

// Handlers
function navToHome() {
  router.push('/')
}

const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    window.location.reload()
  } catch (err) {
    console.error('Erreur lors de la déconnexion:', err)
  }
}

function handleClickOutside(event) {
  const containers = document.querySelectorAll('.dropdown-container')
  let clickedInside = false
  containers.forEach(c => {
    if (c.contains(event.target)) clickedInside = true
  })
  if (!clickedInside) {
    isUserDropdownOpen.value = false
    isLangDropdownOpen.value = false
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white shadow-sm px-6 py-4 flex items-center justify-between">
    <!-- Logo -->
    <div class="cursor-pointer flex items-center space-x-4" @click="navToHome">
      <div class="w-10 h-10 bg-black rounded-full flex items-center justify-center">
        <span class="text-white text-xl font-bold">S</span>
      </div>
      <h1 class="text-xl font-bold tracking-tight text-black">Spy Grocery</h1>
    </div>

    <!-- Actions utilisateur & Langue -->
    <div class="flex items-center space-x-4">
      <!-- Si connecté, afficher dropdown utilisateur -->
      <div v-if="session" class="relative dropdown-container">
        <button
          @click.stop="isUserDropdownOpen = !isUserDropdownOpen"
          class="flex items-center space-x-2 p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-medium text-sm">
            {{ userEmail.charAt(0).toUpperCase() }}
          </div>
          <span class="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-black">
            {{ userEmail }}
          </span>
        </button>
        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="isUserDropdownOpen"
            class="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          >
            <div class="py-2">
              <button
                @click="handleLogout"
                class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!--
      <div class="relative dropdown-container">
        <button
          @click.stop="isLangDropdownOpen = !isLangDropdownOpen"
          class="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span class="text-sm font-medium text-gray-700">{{ currentLanguage }}</span>
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="isLangDropdownOpen"
            class="absolute right-0 mt-2 w-28 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          >
            <button
              @click="changeLanguage('en')"
              class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              :class="{ 'font-bold': currentLanguage === 'EN' }"
            >
              English
            </button>
            <button
              @click="changeLanguage('fr')"
              class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              :class="{ 'font-bold': currentLanguage === 'FR' }"
            >
              Français
            </button>
          </div>
        </transition>
      </div>
       Sélecteur de langue -->
    </div>
  </header>
</template>

<style scoped>
@keyframes uber-counter-enter {
  0% { transform: scale(1) rotate(0deg); }
  30% { transform: scale(1.4) rotate(-20deg); }
  50% { transform: scale(0.8) rotate(20deg); }
  70% { transform: scale(1.2) rotate(-10deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes uber-counter-leave {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  100% { transform: scale(0.8) rotate(0deg); opacity: 0; }
}
.uber-counter-enter-active { animation: uber-counter-enter 600ms cubic-bezier(0.68,-0.55,0.265,1.55); }
.uber-counter-leave-active { animation: uber-counter-leave 300ms ease-out; }
</style>
