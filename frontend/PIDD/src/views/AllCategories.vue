<template>
  <div class="all-categories-page">
    <!-- Navigation 
    <nav class="navigation">
      <router-link to="/" class="nav-logo">MonShop</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Accueil</router-link>
        <router-link to="/categories" class="nav-link">Toutes les collections</router-link>
        <router-link to="/category/1" class="nav-link">Homme</router-link>
        <router-link to="/category/2" class="nav-link">Femme</router-link>
        <router-link to="/category/3" class="nav-link">Enfants</router-link>
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

    <div class="categories-content">
      <!-- Fil d'Ariane -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Toutes les collections</span>
      </nav>

      <h1 class="title">Toutes nos collections</h1>
      <p class="subtitle">Découvrez notre sélection complète de t-shirts</p>

      <div class="categories-grid">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="`/category/${category.id}`"
          class="category-large-card"
        >
          <img :src="category.image" :alt="category.name" class="category-large-img" />
          <div class="category-overlay">
            <h2 class="category-large-name">{{ category.name }}</h2>
            <p class="category-count">{{ getProductCount(category.id) }} produits</p>
            <span class="explore-text">Explorer →</span>
          </div>
        </router-link>
      </div>

      <!-- Section produits populaires -->
      <section class="featured-products">
        <h2 class="section-title">Produits populaires</h2>
        <div class="products-preview">
          <router-link 
            v-for="product in popularProducts" 
            :key="product.id"
            :to="`/product/${product.id}`" 
            class="product-preview-card"
          >
            <img :src="product.image" :alt="product.name" class="product-preview-img" />
            <p class="product-preview-name">{{ product.name }}</p>
            <p class="product-preview-price">{{ product.price }} €</p>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
// Import des images des catégories
import enfantImg from '../assets/enfant.png'
import femmeImg from '../assets/femme.png'
import hommeImg from '../assets/homme.png'

// Import des images des produits
import blancImg from '../assets/blanc.png'
import blancfemmeImg from '../assets/blancfemme.png'
import enfantbleuImg from '../assets/enfantbleu.png'
import enfantrougeImg from '../assets/enfantrouge.png'
import grisImg from '../assets/gris.png'
import noirImg from '../assets/noir.png'
import noirfemmeImg from '../assets/noirfemme.png'
import rosefemmeImg from '../assets/rosefemme.png'

export default {
  name: 'AllCategories',
  props: ['user', 'setUser'],
  data() {
    return {
      categories: [
        { id: 1, name: "T-shirts Homme", image: hommeImg },
        { id: 2, name: "T-shirts Femme", image: femmeImg },
        { id: 3, name: "T-shirts Enfants", image: enfantImg }
      ],
      // Les mêmes produits que CategoryPage.vue
      allProducts: [
        // Produits Homme
        { id: 101, name: "T-shirt Noir Classique", brand: "Nike", price: 20, image: noirImg, categoryId: 1 },
        { id: 102, name: "T-shirt Blanc Sport", brand: "Adidas", price: 25, image: blancImg, categoryId: 1 },
        { id: 103, name: "T-shirt Gris Urban", brand: "Puma", price: 23, image: grisImg, categoryId: 1 },
        
        // Produits Femme
        { id: 201, name: "T-shirt Rose Élégant", brand: "Zara", price: 22, image: rosefemmeImg, categoryId: 2 },
        { id: 202, name: "T-shirt Blanc Femme", brand: "H&M", price: 18, image: blancfemmeImg, categoryId: 2 },
        { id: 203, name: "T-shirt Noir Femme", brand: "Mango", price: 21, image: noirfemmeImg, categoryId: 2 },
        
        // Produits Enfants
        { id: 301, name: "T-shirt Bleu Enfant", brand: "Disney", price: 15, image: enfantbleuImg, categoryId: 3 },
        { id: 302, name: "T-shirt Rouge Super-héros", brand: "Marvel", price: 16, image: enfantrougeImg, categoryId: 3 }
      ],
      popularProducts: [
        { id: 101, name: "T-shirt Noir Classique", price: 20, image: noirImg },
        { id: 201, name: "T-shirt Rose Élégant", price: 22, image: rosefemmeImg },
        { id: 301, name: "T-shirt Bleu Enfant", price: 15, image: enfantbleuImg },
        { id: 102, name: "T-shirt Blanc Sport", price: 25, image: blancImg }
      ]
    }
  },
  methods: {
    getProductCount(categoryId) {
      return this.allProducts.filter(p => p.categoryId === categoryId).length;
    },
    logout() {
      if (this.setUser) {
        this.setUser(null);
      }
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.all-categories-page {
  min-height: 100vh;
  background: #f8fafc;
}

.categories-content {
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
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #1f2937;
}

.subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #6b7280;
  margin-bottom: 4rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 5rem;
}

.category-large-card {
  position: relative;
  text-decoration: none;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  height: 400px;
  background: white;
}

.category-large-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.category-large-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-large-card:hover .category-large-img {
  transform: scale(1.05);
}

.category-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  color: white;
  padding: 2rem;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.category-large-card:hover .category-overlay {
  transform: translateY(-5px);
}

.category-large-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.category-count {
  margin: 0 0 1rem 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.explore-text {
  font-weight: 600;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.category-large-card:hover .explore-text {
  opacity: 1;
  transform: translateX(0);
}

/* Featured Products */
.featured-products {
  padding: 3rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #1f2937;
}

.products-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.product-preview-card {
  text-decoration: none;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  color: #374151;
}

.product-preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.product-preview-img {
  width: 100%;
  height: 200px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.product-preview-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.product-preview-price {
  color: #3b82f6;
  font-weight: 700;
  font-size: 1.2rem;
}

/* Navigation (identique à HomePage) */
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

/* Responsive */
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
  
  .categories-content {
    padding: 1rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .category-large-card {
    height: 300px;
  }
  
  .title {
    font-size: 2.2rem;
  }
  
  .products-preview {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .user-menu {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>