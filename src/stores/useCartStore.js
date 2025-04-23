import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { supabase } from '@/api/supabase';

export const useCartStore = defineStore("cartStore", () => {
  const stores = ref([]);
  const cart = ref([]);
  const savedCarts = ref([]);
  const defaultImage = ref(
    'https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg'
  );
  const showSaveModal = ref(false);
  const cartName = ref('');
  const errorMessage = ref('');


  async function handleSave(){
    try {
      if(!cartName.value.trim()) {
        throw new Error('Veuillez entrer un nom');
      }
      
      await saveCart(cartName.value.trim());
      showSaveModal.value = false;
      cartName.value = '';
      cart.value = [];
      errorMessage.value = '';
    } catch (error) {
      errorMessage.value = error.message;
    }
  };

   // Charger les paniers sauvegardés au démarrage
   function loadSavedCarts() {
    const saved = localStorage.getItem('savedCarts');
    savedCarts.value = saved ? JSON.parse(saved) : [];
  }

   // Sauvegarder un panier avec nom unique
   function saveCart(cartName) {
    loadSavedCarts(); // Rafraîchir la liste
    
    if(savedCarts.value.some(c => c.name.toLowerCase() === cartName.toLowerCase())) {
      throw new Error('Ce nom est déjà utilisé');
    }
    
    const newCart = {
      name: cartName,
      date: new Date().toISOString(),
      items: [...cart.value],
      total: totalCart.value
    };
    
    savedCarts.value.push(newCart);
    localStorage.setItem('savedCarts', JSON.stringify(savedCarts.value));
  }

    // Total calculé
    const totalCart = computed(() => 
      cart.value.reduce((sum, item) => sum + (item.price_un * item.product_quantity), 0)
    );

  // Initialise le panier depuis localStorage
  const saved = localStorage.getItem('cart');
  if (saved) {
    try {
      cart.value = JSON.parse(saved);
    } catch {
      cart.value = [];
    }
  }

  
  // Charger un panier existant
  function loadCart(cartName) {
    const found = savedCarts.value.find(c => c.name === cartName);
    if(found) {
      cart.value = found.items;
    }
  }

    // Supprimer un panier sauvegardé
    function deleteSavedCart(cartName) {
      savedCarts.value = savedCarts.value.filter(c => c.name !== cartName);
      localStorage.setItem('savedCarts', JSON.stringify(savedCarts.value));
    }
  

  function onImgError(event) {
    event.target.src = defaultImage.value;
    event.target.onerror = null;
  }

  function addToCart(product) {
    const existing = cart.value.find(
      item => item.product_id === product.product_id && item.store_id === product.store_id
    );
    if (existing) {
      existing.product_quantity = (existing.product_quantity || 1) + 1;
    } else {
      cart.value.push({ ...product, product_quantity: 1 });
    }
  }

  function decreaseQuantity(product) {
    const existing = cart.value.find(
      item => item.product_id === product.product_id && item.store_id === product.store_id
    );
    if (!existing) return;
    if (existing.product_quantity > 1) {
      existing.product_quantity--;
    } else {
      // retire l'article si quantité à 0
      cart.value = cart.value.filter(
        item => !(item.product_id === product.product_id && item.store_id === product.store_id)
      );
    }
  }

  function deleteCart(){
    cart.value = []
  }

  async function getStores() {
    const { data, error } = await supabase
      .from('stores')
      .select('*');
    if (error) {
      console.error(error);
    } else {
      stores.value = data;
    }
  }

  // Sauvegarde automatique à chaque changement de `cart`
  watch(cart, newCart => {
    localStorage.setItem('cart', JSON.stringify(newCart));
  }, { deep: true });

  return {
    loadSavedCarts,
    errorMessage,
    showSaveModal,
    cartName,
    handleSave,
    savedCarts,
    saveCart,
    loadCart,
    deleteSavedCart,
    totalCart,
    deleteCart,
    stores,
    cart,
    onImgError,
    addToCart,
    decreaseQuantity,
    getStores
  };
});
