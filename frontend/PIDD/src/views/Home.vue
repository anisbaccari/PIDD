<template>
  <div class="home-page">
    <!-- Navigation -->
    

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Bienvenue dans notre boutique</h1>
        <p class="hero-subtitle">Découvrez notre collection exclusive de t-shirts</p>
        <router-link to="/category/1" class="cta-button">Voir la collection</router-link>
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
  data() {
    return {
      categories: [
        { id: 1, name: "T-shirts Homme", image: hommeImg },
        { id: 2, name: "T-shirts Femme", image: femmeImg },
        { id: 3, name: "T-shirts Enfants", image: enfantImg }
      ],
      popularProducts: [
        // Produits Homme
        { id: 101, name: "T-shirt Noir Classique", price: 20, image: noirImg },
        { id: 102, name: "T-shirt Blanc Sport", price: 25, image: blancImg },
        { id: 103, name: "T-shirt Gris Urban", price: 23, image: grisImg },
        
        // Produits Femme
        { id: 201, name: "T-shirt Rose Élégant", price: 22, image: rosefemmeImg },
        { id: 202, name: "T-shirt Blanc Femme", price: 24, image: blancfemmeImg },
        { id: 203, name: "T-shirt Noir Femme", price: 21, image: noirfemmeImg },
        
        // Produits Enfants
        { id: 301, name: "T-shirt Bleu Enfant", price: 15, image: enfantbleuImg },
        { id: 302, name: "T-shirt Rouge Enfant", price: 16, image: enfantrougeImg }
      ]
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.product-preview-card {
  text-decoration: none;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  color: #374151;
}

.product-preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.product-preview-img {
  width: 100%;
  height: 150px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.product-preview-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.product-preview-price {
  color: #3b82f6;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
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
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>