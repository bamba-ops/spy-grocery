<template>
    <div class="min-h-screen bg-white flex items-center justify-center p-4">
      <div class="w-full max-w-sm space-y-6">
        <!-- Titre principal -->
        <h1 class="text-2xl font-bold text-gray-900 text-center">
          Connexion / Inscription
        </h1>
  
        <!-- Formulaire -->
        <div class="space-y-4">
          <!-- Champ Email -->
          <div>
            <input
              v-model="email"
              type="email"
              placeholder="Entrez votre email"
              class="w-full px-4 py-3 text-gray-900 border-b border-gray-200 focus:border-black focus:outline-none placeholder-gray-400 text-lg"
              @keyup.enter="handleMagicLink"
            />
          </div>
  
          <!-- Bouton Magic Link -->
          <button
            @click="handleMagicLink"
            :disabled="isLoading"
            class="w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <span v-if="!isLoading">Recevoir le lien magique</span>
            <svg
              v-else
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path>
            </svg>
          </button>
  
          <!-- Messages d'état -->
          <div v-if="error || success" class="text-center space-y-2">
            <div v-if="success" class="text-sm text-gray-600 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Lien envoyé à {{ email }}
            </div>
            <div v-if="error" class="text-sm text-red-500 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ error }}
            </div>
          </div>
  
          <!-- Informations complémentaires -->
          <p class="text-center text-gray-500 text-xs px-4">
            Un lien de connexion unique sera envoyé à cette adresse email.
            Aucun mot de passe requis.
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { supabase } from '@/api/supabase'
  
  const email = ref('')
  const isLoading = ref(false)
  const success = ref(false)
  const error = ref(null)
  
  const handleMagicLink = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      error.value = 'Adresse email invalide'
      return
    }
  
    try {
      isLoading.value = true
      error.value = null
      
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.value
      })
  
      if (authError) throw authError
      
      success.value = true
      setTimeout(() => success.value = false, 5000)
    } catch (err) {
      error.value = err.message || 'Échec de l\'envoi du lien'
      setTimeout(() => error.value = null, 5000)
    } finally {
      isLoading.value = false
    }
  }
  </script>
  
  <style>
  /* Animation subtile pour les messages */
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  div[class*="text-sm"] {
    animation: slideIn 0.2s ease-out;
  }
  
  /* Style personnalisé pour le focus */
  input:focus {
    box-shadow: none;
    border-color: #000;
  }
  </style>