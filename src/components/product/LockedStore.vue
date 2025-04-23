<template>
    <div class="locked-store-promo bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
      <div class="flex flex-col items-center justify-center space-y-4 min-h-[300px]">
        <!-- Cadenas animé -->
        <div class="relative animate-bounce">
          <svg 
            class="w-16 h-16 text-gray-700" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style="filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="1.5" 
              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
        </div>
  
        <!-- Texte d'appel à l'action -->
        <div class="text-center space-y-2">
          <h3 class="text-xl font-semibold text-gray-800">Découvrez plus de magasins</h3>
          <p class="text-gray-600 text-sm max-w-xs mx-auto">
            Créez un compte gratuit pour accéder à tous les magasins. 
          </p>
        </div>
  
        <!-- Bouton d'inscription -->
        <button
        @click="navToAuth()"
          class="mt-4 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg 
            class="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>S'inscrire gratuitement</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
    function navToAuth(){
        window.location.href = '/auth'
    }
  </script>
  
  <style scoped>
  .locked-store-promo {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  .animate-bounce {
    animation: store-bounce 1.5s infinite;
  }
  
  @keyframes store-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  </style>