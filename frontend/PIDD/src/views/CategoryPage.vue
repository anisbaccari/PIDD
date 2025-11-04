<template>
  <div class="category-page">
    <!-- Navigation
    <nav class="navigation">
      <router-link to="/" class="nav-logo">MonShop</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Accueil</router-link>
        <router-link to="/categories" class="nav-link">Collections</router-link>
        <router-link to="/category/1" class="nav-link">Homme</router-link>
        <router-link to="/category/2" class="nav-link">Femme</router-link>
        <router-link to="/category/3" class="nav-link">Enfants</router-link>
        <router-link to="/cart" class="nav-link">Panier</router-link>
      </div>
      <div class="nav-login">
        <div v-if="user" class="user-menu">
          <span class="welcome-message">Bienvenue, {{ user.prenom }}!</span>
          <button @click="logout" class="logout-button">Déconnexion</button>
        </div>
        <router-link v-else to="/login" class="login-button nav-link">
          Se connecter
        </router-link>
      </div>
    </nav>
    -->

    <div class="category-content">
      <!-- Fil d'Ariane -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ categoryName }}</span>
      </nav>

      <h1 class="title">{{ categoryName }}</h1>

      <div v-if="products.length" class="products-grid">
        <div
          v-for="p in products"
          :key="p.id"
          class="product-card"
        >
          <img :src="p.image" :alt="p.name" class="product-img" />
          <div class="product-info">
            <p class="product-name">{{ p.name }}</p>
            <p class="product-brand">{{ p.brand }}</p>
            <p class="product-price">{{ p.price }} €</p>
          </div>
          
          <div class="product-card-actions">
            <router-link :to="`/product/${p.id}`" class="view-details-btn">
              Voir détails
            </router-link>
            <!-- ✅ BOUTON AJOUTER AU PANIER -->
            <button @click="addToCart(p)" class="add-to-cart-quick-btn" title="Ajouter au panier">
              🛒
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-text">Aucun produit dans cette catégorie</p>
        <router-link to="/categories" class="back-to-home">Voir toutes les collections</router-link>
      </div>
    </div>
  </div>
</template>

<script>
// Import des images
import noir from '../assets/noir.png'
import blanc from '../assets/blanc.png'
import rosefemme from '../assets/rosefemme.png'
import blancfemme from '../assets/blancfemme.png'
import noirfemme from '../assets/noirfemme.png'
import enfantbleu from '../assets/enfantbleu.png'
import enfantrouge from '../assets/enfantrouge.png'
import gris from '../assets/gris.png'

export default {
  name: 'CategoryPage',
  // ✅ AJOUT: Props pour la méthode globale d'ajout au panier
  props: ['user', 'setUser', 'addToCartGlobal'],
  data() {
    return {
      products: [],
      categoryName: "",
      // ✅ AJOUT: Champ img manquant dans les produits
      allProducts: [
        // Produits Homme
        { 
          id: 101, 
          name: "T-shirt Noir Classique", 
          brand: "Nike", 
          price: 20, 
          image: noir,
          img: 'noir.png', // ✅ AJOUT: champ img manquant
          categoryId: 1,
          description: "T-shirt en coton 100% biologique, coupe classique, confortable et durable."
        },
        { 
          id: 102, 
          name: "T-shirt Blanc Sport", 
          brand: "Adidas", 
          price: 25, 
          image: blanc,
          img: 'blanc.png', // ✅ AJOUT: champ img manquant
          categoryId: 1,
          description: "T-shirt technique en matière respirante, parfait pour le sport."
        },
        { 
          id: 103, 
          name: "T-shirt Gris Urban", 
          brand: "Puma", 
          price: 23, 
          image: gris,
          img: 'gris.png', // ✅ AJOUT: champ img manquant
          categoryId: 1,
          description: "T-shirt streetwear en coton premium, design urbain et moderne."
        },
        
        // Produits Femme
        { 
          id: 201, 
          name: "T-shirt Rose Élégant", 
          brand: "Zara", 
          price: 22, 
          image: rosefemme,
          img: 'rosefemme.png', // ✅ AJOUT: champ img manquant
          categoryId: 2,
          description: "T-shirt féminin en coton stretch, coupe ajustée, couleur rose pastel."
        },
        { 
          id: 202, 
          name: "T-shirt Blanc Femme", 
          brand: "H&M", 
          price: 18, 
          image: blancfemme,
          img: 'blancfemme.png', // ✅ AJOUT: champ img manquant
          categoryId: 2,
          description: "T-shirt basique femme, coupe standard, matière douce et agréable."
        },
        { 
          id: 203, 
          name: "T-shirt Noir Femme", 
          brand: "Mango", 
          price: 21, 
          image: noirfemme,
          img: 'noirfemme.png', // ✅ AJOUT: champ img manquant
          categoryId: 2,
          description: "T-shirt femme en coton bio, coupe ajustée, idéal pour toutes les occasions."
        },
        
        // Produits Enfants
        { 
          id: 301, 
          name: "T-shirt Bleu Enfant", 
          brand: "Disney", 
          price: 15, 
          image: enfantbleu,
          img: 'enfantbleu.png', // ✅ AJOUT: champ img manquant
          categoryId: 3,
          description: "T-shirt pour enfant avec motif Disney, coton doux, lavage facile."
        },
        { 
          id: 302, 
          name: "T-shirt Rouge Super-héros", 
          brand: "Marvel", 
          price: 16, 
          image: enfantrouge,
          img: 'enfantrouge.png', // ✅ AJOUT: champ img manquant
          categoryId: 3,
          description: "T-shirt enfant avec impression Marvel, parfait pour les fans de super-héros."
        }
      ]
    }
  },
  mounted() {
    this.loadCategoryProducts()
  },
  watch: {
    '$route.params.id': {
      handler() {
        this.loadCategoryProducts()
      },
      immediate: true
    }
  },
  methods: {
    loadCategoryProducts() {
      const categoryId = parseInt(this.$route.params.id);
      console.log("🔄 Filtrage pour catégorie:", categoryId);
      
      // ✅ FILTRAGE LOCAL SIMPLE
      this.products = this.allProducts.filter(product => 
        product.categoryId === categoryId
      );
      
      // Définir le nom de la catégorie
      this.setCategoryName(categoryId);
      
      console.log("✅ Produits trouvés:", this.products.length);
    },
    
    setCategoryName(categoryId) {
      const categoryNames = {
        1: 'T-shirts Homme',
        2: 'T-shirts Femme', 
        3: 'T-shirts Enfants'
      };
      
      this.categoryName = categoryNames[categoryId] || 'Catégorie';
    },
    
    // ✅ AJOUT: Méthode pour ajouter au panier
    addToCart(product) {
      const productToAdd = {
        ...product,
        quantity: 1
      }
      
      if (this.addToCartGlobal) {
        this.addToCartGlobal(productToAdd)
      } else {
        this.addToCartLocal(productToAdd)
      }
      
      this.showSuccess(`✅ ${product.name} ajouté au panier !`)
    },
    
    // ✅ AJOUT: Méthode de fallback
    addToCartLocal(product) {
      const existingCart = JSON.parse(localStorage.getItem('monShop_cart') || '[]')
      const existingItem = existingCart.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        existingCart.push(product)
      }
      
      localStorage.setItem('monShop_cart', JSON.stringify(existingCart))
    },
    
    // ✅ AJOUT: Méthode de déconnexion
    logout() {
      if (this.setUser) {
        this.setUser(null);
      }
      localStorage.removeItem('token');
      this.$router.push('/');
    },
    
    showSuccess(message) {
      // Simple alert pour l'instant
      alert(message)
    }
  }
}
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background: #f8fafc;
}

.category-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #9ca3af;
}

.breadcrumb-current {
  color: #6b7280;
  font-weight: 500;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #1f2937;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

/* ✅ CORRECTION: Changé de router-link à div pour contenir plusieurs éléments */
.product-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  color: inherit;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.product-img {
  width: 100%;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.product-info {
  flex-grow: 1;
  margin-bottom: 1rem;
}

.product-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.product-brand {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.product-price {
  color: #3b82f6;
  font-weight: 700;
  font-size: 1.2rem;
}

/* ✅ AJOUT: Styles pour les actions des cartes produits */
.product-card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: auto;
}

.view-details-btn {
  flex: 1;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  transition: background 0.3s ease;
  font-size: 0.9rem;
}

.view-details-btn:hover {
  background: #2563eb;
}

.add-to-cart-quick-btn {
  padding: 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 1.1rem;
}

.add-to-cart-quick-btn:hover {
  background: #059669;
  transform: scale(1.05);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-text {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.back-to-home {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.3s ease;
}

.back-to-home:hover {
  background: #2563eb;
}

/* Navigation */
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

/* ✅ AJOUT: Styles pour la section login */
.nav-login {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-message {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.9rem;
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

.logout-button {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .user-menu {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .category-content {
    padding: 1rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .product-card-actions {
    flex-direction: column;
  }
}
</style>