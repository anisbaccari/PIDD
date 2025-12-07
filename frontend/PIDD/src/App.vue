<script>
import api from './api';
import AppFooter from './components/AppFooter.vue';
import UserAvatar from './components/UserAvatar.vue';

// Créer un Event Bus simple pour Vue 3 (remplace $root.$on)
const EventBus = {
  events: {},
  $on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  $emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  },
  $off(event, callback) {
    if (this.events[event]) {
      const index = this.events[event].indexOf(callback);
      if (index > -1) {
        this.events[event].splice(index, 1);
      }
    }
  }
};

// Rendre l'Event Bus global
window.EventBus = EventBus;

export default {
  components: { AppFooter, UserAvatar },

  data() {
    return {
      user: null,
      cartItems: JSON.parse(localStorage.getItem("cart_anonymous")) || [], // Panier anonyme par défaut
      isLoadingUser: false,
      previousUserId: null
    };
  },

  methods: {
    /* --- AUTHENTIFICATION --- */
    setUser(user) {
      console.log('🔄 App.vue: setUser appelé avec:', user);
      
      // Si on avait un utilisateur précédent, sauvegarder son panier
      if (this.user && this.user.id) {
        this.saveUserCart(this.user.id);
      }
      
      // Si c'est un NOUVEL utilisateur (différent du précédent)
      if (user && user.id && this.previousUserId !== user.id) {
        console.log(`🔄 Changement d'utilisateur: ${this.previousUserId} -> ${user.id}`);
        
        // Charger le panier du nouvel utilisateur
        this.loadUserCart(user.id);
      } 
      // Si déconnexion (user devient null)
      else if (!user && this.user) {
        console.log('🔓 Déconnexion - Sauvegarde du panier anonyme');
        this.saveAnonymousCart();
      }
      // Si même utilisateur (rechargement de page, etc.)
      else if (user && user.id === this.previousUserId) {
        console.log('🔄 Même utilisateur - Panier inchangé');
        // Le panier est déjà chargé, on ne fait rien
      }
      
      this.user = user;
      
      // Sauvegarder l'utilisateur dans localStorage
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.previousUserId = user.id; // Mettre à jour l'ID précédent
      } else {
        localStorage.removeItem('user');
        this.previousUserId = null;
      }
      
      this.$forceUpdate();
    },

    getUser() {
      return this.user;
    },

    /* --- FONCTIONS PANIER PAR UTILISATEUR --- */
    // Sauvegarder le panier d'un utilisateur spécifique
    saveUserCart(userId) {
      if (!userId) return;
      const cartKey = `cart_user_${userId}`;
      localStorage.setItem(cartKey, JSON.stringify(this.cartItems));
      console.log(`💾 Panier sauvegardé pour l'utilisateur ${userId}`);
    },

    // Charger le panier d'un utilisateur spécifique
    loadUserCart(userId) {
      if (!userId) return;
      const cartKey = `cart_user_${userId}`;
      const savedCart = localStorage.getItem(cartKey);
      
      if (savedCart) {
        try {
          this.cartItems = JSON.parse(savedCart);
          console.log(`📂 Panier chargé pour l'utilisateur ${userId}:`, this.cartItems.length, 'articles');
        } catch (error) {
          console.error('❌ Erreur parsing panier:', error);
          this.cartItems = [];
        }
      } else {
        // Nouvel utilisateur = panier vide
        this.cartItems = [];
        console.log(`🆕 Nouvel utilisateur ${userId} - Panier vide`);
      }
      
      localStorage.removeItem("cart_anonymous"); // Nettoyer le panier anonyme
    },

    // Sauvegarder le panier anonyme (utilisateurs non connectés)
    saveAnonymousCart() {
      localStorage.setItem("cart_anonymous", JSON.stringify(this.cartItems));
      console.log('💾 Panier anonyme sauvegardé');
    },

    // Charger le panier anonyme
    loadAnonymousCart() {
      const anonymousCart = localStorage.getItem("cart_anonymous");
      if (anonymousCart) {
        try {
          this.cartItems = JSON.parse(anonymousCart);
          console.log('📂 Panier anonyme chargé:', this.cartItems.length, 'articles');
        } catch (error) {
          console.error('❌ Erreur parsing panier anonyme:', error);
          this.cartItems = [];
        }
      } else {
        this.cartItems = [];
      }
    },

    /* --- FONCTIONS PANIER (modifiées pour gérer l'utilisateur) --- */
    addToCart(product) {
      const existing = this.cartItems.find(p => p.id === product.id);

      if (existing) {
        existing.quantity++;
      } else {
        this.cartItems.push({ ...product, quantity: 1 });
      }

      // Sauvegarder dans le bon emplacement
      this.saveCurrentCart();
    },

    updateCartQuantity(id, quantity) {
      const item = this.cartItems.find(i => i.id === id);
      if (!item) return;

      if (quantity <= 0) {
        this.removeFromCart(id);
        return;
      }

      item.quantity = quantity;
      this.saveCurrentCart();
    },

    removeFromCart(id) {
      this.cartItems = this.cartItems.filter(i => i.id !== id);
      this.saveCurrentCart();
    },

    clearCart() {
      this.cartItems = [];
      this.saveCurrentCart();
    },

    // Sauvegarder le panier au bon endroit selon l'utilisateur
    saveCurrentCart() {
      if (this.user && this.user.id) {
        this.saveUserCart(this.user.id);
      } else {
        this.saveAnonymousCart();
      }
      
      // Émettre un événement pour notifier les composants
      window.EventBus.$emit('cart-updated');
    },

    getCartTotal() {
      return this.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },

    getTotalItems() {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    },

    /* --- VÉRIFICATION UTILISATEUR --- */
    async checkUserAuthentication() {
      console.log('🔍 Vérification authentification...');
      
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log('🔑 Token dans localStorage:', token);
      console.log('👤 User dans localStorage:', storedUser);
      
      if (!token) {
        console.log('❌ Pas de token, déconnexion');
        this.user = null;
        localStorage.removeItem('user');
        this.previousUserId = null;
        
        // Charger le panier anonyme
        this.loadAnonymousCart();
        return;
      }
      
      // Si on a déjà un user dans localStorage
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Vérifier si c'est un nouvel utilisateur
          const isDifferentUser = this.previousUserId !== parsedUser.id;
          
          if (isDifferentUser && parsedUser.id) {
            // Sauvegarder l'ancien panier si nécessaire
            if (this.previousUserId) {
              this.saveUserCart(this.previousUserId);
            }
            
            // Charger le panier du nouvel utilisateur
            this.loadUserCart(parsedUser.id);
          }
          
          this.user = parsedUser;
          this.previousUserId = parsedUser.id;
          console.log('✅ User chargé depuis localStorage:', this.user);
          return;
        } catch (err) {
          console.error('❌ Erreur parsing user:', err);
          localStorage.removeItem('user');
          this.previousUserId = null;
          this.loadAnonymousCart();
        }
      }
      
      // Sinon, essayer de récupérer depuis l'API
      this.isLoadingUser = true;
      
      try {
        const endpoints = [
          '/auth/me',
          '/api/auth/me',
          '/user/me',
          '/users/me',
          '/profile',
          '/api/profile'
        ];
        
        let userData = null;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`🔄 Tentative GET ${endpoint}`);
            const res = await api.get(endpoint, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log(`✅ Réponse de ${endpoint}:`, res.data);
            
            if (res.data) {
              userData = res.data.user || res.data.data || res.data;
              if (userData && (userData.username || userData.email || userData.id)) {
                console.log(`✅ User trouvé dans ${endpoint}:`, userData);
                break;
              }
            }
          } catch (err) {
            console.log(`❌ ${endpoint} échoué:`, err.message);
            continue;
          }
        }
        
        if (userData) {
          // Vérifier si c'est un nouvel utilisateur
          const isDifferentUser = this.previousUserId !== userData.id;
          
          if (isDifferentUser && userData.id) {
            // Sauvegarder l'ancien panier si nécessaire
            if (this.previousUserId) {
              this.saveUserCart(this.previousUserId);
            }
            
            // Charger le panier du nouvel utilisateur
            this.loadUserCart(userData.id);
          }
          
          this.user = userData;
          this.previousUserId = userData.id;
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('👤 User défini:', this.user);
        } else {
          console.log('⚠️ Aucun endpoint API ne fonctionne');
          this.user = null;
          this.previousUserId = null;
          this.loadAnonymousCart();
        }
        
      } catch (err) {
        console.error('❌ Erreur vérification API:', err);
        this.user = null;
        this.previousUserId = null;
        this.loadAnonymousCart();
      } finally {
        this.isLoadingUser = false;
      }
    },

    // Forcer le rafraîchissement
    refreshUser() {
      console.log('🔄 Rafraîchissement user demandé');
      this.checkUserAuthentication();
    },

    // Déconnexion
    logoutUser() {
      console.log('🚪 Déconnexion');
      
      // Sauvegarder le panier de l'utilisateur avant déconnexion
      if (this.user && this.user.id) {
        this.saveUserCart(this.user.id);
      }
      
      // Basculer vers le panier anonyme
      this.loadAnonymousCart();
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.user = null;
      this.previousUserId = null;
      
      this.$router.push('/');
    }
  },

  async mounted() {
    console.log('🚀 App.vue monté');
    
    // Charger d'abord le panier anonyme (par défaut)
    this.loadAnonymousCart();
    
    // Vérifier l'authentification
    await this.checkUserAuthentication();
    
    // Écouter les événements de login avec Event Bus
    window.EventBus.$on('user-logged-in', (userData) => {
      console.log('🎯 Événement user-logged-in reçu:', userData);
      if (userData) {
        this.setUser(userData);
      } else {
        this.checkUserAuthentication();
      }
    });
    
    // Écouter les événements de logout
    window.EventBus.$on('user-logged-out', () => {
      console.log('🎯 Événement user-logged-out reçu');
      this.logoutUser();
    });
    
    // Écouter les événements de mise à jour du panier
    window.EventBus.$on('cart-updated', () => {
      console.log('🛒 Événement cart-updated reçu');
      this.$forceUpdate();
    });
  },

  beforeUnmount() {
    // Sauvegarder le panier avant de quitter
    if (this.user && this.user.id) {
      this.saveUserCart(this.user.id);
    } else {
      this.saveAnonymousCart();
    }
    
    // Nettoyer les écouteurs d'événements
    window.EventBus.$off('user-logged-in');
    window.EventBus.$off('user-logged-out');
    window.EventBus.$off('cart-updated');
  }
};
</script>

<template>
  <div id="app">
    <!-- Loader utilisateur -->
    <div v-if="isLoadingUser" class="user-loading">
      <div class="loading-spinner"></div>
      <p>Chargement de votre session...</p>
    </div>

    <!-- Navbar -->
    <nav class="navigation">
      <router-link to="/" class="nav-logo">MonShop</router-link>

      <div class="nav-links">
        <router-link to="/" class="nav-link">Accueil</router-link>
        <router-link to="/category/1" class="nav-link">Homme</router-link>
        <router-link to="/category/2" class="nav-link">Femme</router-link>
        <router-link to="/category/3" class="nav-link">Enfants</router-link>
        <router-link to="/cart" class="nav-link">Panier ({{ getTotalItems() }})</router-link>
        <router-link to="/categories" class="nav-link">Catégories</router-link>
      </div>

      <div class="nav-login">
        <router-link v-if="!user" to="/login" class="login-button nav-link">
          Se connecter
        </router-link>

        <div v-else class="user-info">
          <span class="welcome">Bonjour, {{ user.username || 'Utilisateur' }}</span>
          <button @click="logoutUser" class="logout-btn">Déconnexion</button>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <router-view
      :user="user"
      :setUser="setUser"
      :getUser="getUser"
      :cartItems="cartItems"
      :addToCartGlobal="addToCart"
      :updateCartQuantity="updateCartQuantity"
      :removeFromCart="removeFromCart"
      :clearCart="clearCart"
      :getCartTotal="getCartTotal"
      :getTotalItems="getTotalItems"
      :refreshUser="refreshUser"
    />

    <AppFooter />
  </div>
</template>

<style>
/* Styles globaux */
body {
  margin: 0;
  font-family: "Inter", sans-serif;
  background-color: #f8fafc;
}

#app {
  min-height: 100vh;
  position: relative;
}

/* Navigation */
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #3b82f6;
}

.nav-login {
  display: flex;
  align-items: center;
}

.login-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white !important;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome {
  color: #3b82f6;
  font-weight: 500;
  font-size: 0.9rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Loader utilisateur */
.user-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-loading p {
  color: #6b7280;
  font-weight: 500;
}
</style>