<template>
  <div class="home-page">
    <!-- Navigation -->
    

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Bienvenue dans notre boutique</h1>
        <p class="hero-subtitle">Découvrez notre collection exclusive de t-shirts</p>
        <router-link to="/categories" class="cta-button">Voir toutes les collections</router-link>
      </div>
    </section>

    <!-- Catégories en vedette -->
    <section class="featured-categories">
      <h2 class="section-title">Catégories populaires</h2>
      <div class="categories-grid">
        <router-link 
          v-for="category in categories" 
          :key="category.id"
          :to="`/category/${category.id}`" 
          class="category-card"
        >
          <img :src="category.image" :alt="category.name" class="category-img" />
          <p class="category-name">{{ category.name }}</p>
        </router-link>
      </div>
    </section>

    <!-- Produits populaires -->
    <section class="popular-products">
      <h2 class="section-title">Produits populaires</h2>
      <div class="products-preview">
        <div
          v-for="product in popularProducts" 
          :key="product.id"
          class="product-preview-card"
        >
          <img :src="product.image" :alt="product.name" class="product-preview-img" />
          <div class="product-preview-info">
            <p class="product-preview-name">{{ product.name }}</p>
            <p class="product-preview-price">{{ product.price }} €</p>
          </div>
          <div class="product-preview-actions">
            <router-link :to="`/product/${product.id}`" class="view-details-btn">
              Voir détails
            </router-link>
            <button @click="addToCart(product)" class="add-to-cart-btn" title="Ajouter au panier">
              🛒
            </button>
          </div>
        </div>
      </div>
    </section>
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

  name: 'HomePage',
  // ✅ CORRECTION : Ajouter toutes les props nécessaires
  props: ['user', 'setUser', 'addToCartGlobal'],
  data() {
    return {
      categories: [
        { id: 1, name: "T-shirts Homme", image: hommeImg },
        { id: 2, name: "T-shirts Femme", image: femmeImg },
        { id: 3, name: "T-shirts Enfants", image: enfantImg }
      ],
      popularProducts: [
        // Produits Homme
        { 
          id: 101, 
          name: "T-shirt Noir Classique", 
          price: 20, 
          image: noirImg,
          img: 'noir.png',
          brand: "Nike"
        },
        { 
          id: 102, 
          name: "T-shirt Blanc Sport", 
          price: 25, 
          image: blancImg,
          img: 'blanc.png',
          brand: "Adidas"
        },
        { 
          id: 103, 
          name: "T-shirt Gris Urban", 
          price: 23, 
          image: grisImg,
          img: 'gris.png',
          brand: "Puma"
        },
        
        // Produits Femme
        { 
          id: 201, 
          name: "T-shirt Rose Élégant", 
          price: 22, 
          image: rosefemmeImg,
          img: 'rosefemme.png',
          brand: "Zara"
        },
        { 
          id: 202, 
          name: "T-shirt Blanc Femme", 
          price: 24, 
          image: blancfemmeImg,
          img: 'blancfemme.png',
          brand: "H&M"
        },
        { 
          id: 203, 
          name: "T-shirt Noir Femme", 
          price: 21, 
          image: noirfemmeImg,
          img: 'noirfemme.png',
          brand: "Mango"
        },
        
        // Produits Enfants
        { 
          id: 301, 
          name: "T-shirt Bleu Enfant", 
          price: 15, 
          image: enfantbleuImg,
          img: 'enfantbleu.png',
          brand: "Disney"
        },
        { 
          id: 302, 
          name: "T-shirt Rouge Enfant", 
          price: 16, 
          image: enfantrougeImg,
          img: 'enfantrouge.png',
          brand: "Marvel"
        }
      ]
    }
  },
  methods: {
    logout() {
      // Appeler la méthode de déconnexion du parent
      if (this.setUser) {
        this.setUser(null);
      }
      
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      
      // Rediriger vers la page d'accueil
      this.$router.push('/');
      
      console.log('✅ Déconnexion réussie');
    },
    
    // ✅ AJOUT: Méthode pour ajouter au panier
    addToCart(product) {
      const productToAdd = {
        ...product,
        quantity: 1
      }
      
      if (this.addToCartGlobal) {
        this.addToCartGlobal(productToAdd);
        this.showSuccess(`✅ ${product.name} ajouté au panier !`);
      } else {
        this.addToCartLocal(productToAdd);
      }
    },
    
    // ✅ AJOUT: Méthode de fallback
    addToCartLocal(product) {
      const existingCart = JSON.parse(localStorage.getItem('monShop_cart') || '[]');
      const existingItem = existingCart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        existingCart.push(product);
      }
      
      localStorage.setItem('monShop_cart', JSON.stringify(existingCart));
      this.showSuccess(`✅ ${product.name} ajouté au panier !`);
    },
    
    showSuccess(message) {
      // Simple alert pour l'instant - à remplacer par un système de notifications
      alert(message);
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
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

/* ✅ CORRECTION: Styles pour la section login */
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
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
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

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
}

/* Sections communes */
.featured-categories,
.popular-products {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #1f2937;
}

/* Grid Catégories */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.category-card {
  text-decoration: none;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  color: #374151;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.category-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.category-name {
  font-weight: 600;
  font-size: 1.1rem;
}

/* Produits populaires */
.products-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

/* ✅ CORRECTION: Changé de router-link à div pour contenir plusieurs éléments */
.product-preview-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.product-preview-img {
  width: 100%;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.product-preview-info {
  flex-grow: 1;
  margin-bottom: 1rem;
}

.product-preview-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.product-preview-price {
  color: #3b82f6;
  font-weight: 700;
  font-size: 1.2rem;
}

/* ✅ AJOUT: Styles pour les actions des produits */
.product-preview-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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

.add-to-cart-btn {
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

.add-to-cart-btn:hover {
  background: #059669;
  transform: scale(1.05);
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
  
  .user-menu {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .featured-categories,
  .popular-products {
    padding: 2rem 1rem;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .products-preview {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .product-preview-actions {
    flex-direction: column;
  }
}
</style>