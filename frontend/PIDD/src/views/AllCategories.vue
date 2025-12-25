<template>
  <div class="all-categories-page">
    <div class="categories-content">
      <!-- Fil d'Ariane -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Toutes les collections</span>
      </nav>

      <h1 class="title">Toutes nos collections</h1>
      <p class="subtitle">Découvrez notre sélection complète de t-shirts</p>

      <!-- Chargement -->
      <div v-if="loading" class="loading-categories">
        <div class="spinner"></div>
        <p>Chargement des catégories...</p>
      </div>

      <!-- Grille des catégories -->
      <div v-else class="categories-grid">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="`/category/${category.id}`"
          class="category-large-card"
        >
          <div class="category-image-container">
            <img 
              :src="getCategoryImage(category)" 
              :alt="category.name" 
              class="category-large-img"
              @error="handleImageError"
            />
          </div>
          <div class="category-overlay">
            <h2 class="category-large-name">{{ category.name }}</h2>
            <p class="category-count">{{ getProductCount(category.id) }} produits</p>
            <span class="explore-text">Explorer →</span>
          </div>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script>
// Import des images par défaut si elles existent, sinon utiliser des placeholders
// Vérifiez si ces fichiers existent dans votre projet
let defaultHommeImg = null;
let defaultFemmeImg = null;
let defaultEnfantImg = null;

try {
  defaultHommeImg = require('../assets/homme.png');
} catch (e) {
  console.warn('Image homme.png non trouvée, utilisation d\'un placeholder');
}

try {
  defaultFemmeImg = require('../assets/femme.png');
} catch (e) {
  console.warn('Image femme.png non trouvée, utilisation d\'un placeholder');
}

try {
  defaultEnfantImg = require('../assets/enfant.png');
} catch (e) {
  console.warn('Image enfant.png non trouvée, utilisation d\'un placeholder');
}

export default {
  name: 'AllCategories',
  props: ['user', 'setUser'],
  data() {
    return {
      categories: [],
      allProducts: [],
      popularProducts: [],
      loading: true,
      productsLoading: true,
      
      // Images par défaut avec URLs de placeholder
      defaultImages: {
        'homme': defaultHommeImg || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'femme': defaultFemmeImg || 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'enfant': defaultEnfantImg || 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'default': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
    }
  },
  methods: {
    async loadCategories() {
      try {
        this.loading = true;
        
        // Récupération des catégories depuis l'API
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Erreur de chargement des catégories');
        
        let categories = await response.json();
        
        // Si pas de catégories ou API non disponible, utiliser les 3 catégories principales
        if (!categories || categories.length === 0) {
          categories = [
            { id: 1, name: "T-shirts Homme", type: "homme" },
            { id: 2, name: "T-shirts Femme", type: "femme" },
            { id: 3, name: "T-shirts Enfants", type: "enfant" }
          ];
        }
        
        // Prendre seulement les 3 premières catégories principales
        this.categories = categories.slice(0, 3);
        
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        
        // Catégories par défaut en cas d'erreur
        this.categories = [
          { id: 1, name: "T-shirts Homme", type: "homme" },
          { id: 2, name: "T-shirts Femme", type: "femme" },
          { id: 3, name: "T-shirts Enfants", type: "enfant" }
        ];
      } finally {
        this.loading = false;
      }
    },
    
    async loadProducts() {
      try {
        this.productsLoading = true;
        
        // Récupération des produits depuis l'API
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Erreur de chargement des produits');
        
        this.allProducts = await response.json();
        
        // Déterminer les produits populaires (4 premiers)
        this.popularProducts = this.allProducts.slice(0, 4);
        
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        
        // Produits par défaut en cas d'erreur
        this.allProducts = [
          { id: 1, name: "T-shirt Noir Classique", price: 29.99, categoryId: 1, image: 'noir.png' },
          { id: 2, name: "T-shirt Blanc Sport", price: 25.00, categoryId: 1, image: 'blanc.png' },
          { id: 3, name: "T-shirt Gris Urban", price: 23.00, categoryId: 1, image: 'gris.png' },
          { id: 4, name: "T-shirt Femme Rose", price: 27.50, categoryId: 2, image: 'rosefemme.png' },
          { id: 4, name: "T-shirt Femme Rose", price: 27.50, categoryId: 2, image: 'rosefemme.png' },
          { id: 4, name: "T-shirt Femme Rose", price: 27.50, categoryId: 2, image: 'rose.png' },
          { id: 5, name: "T-shirt Enfant Bleu", price: 19.99, categoryId: 3, image: 'enfantbleu.png' },
          { id: 6, name: "T-shirt Enfant Rouge", price: 19.99, categoryId: 3, image: 'enfantrouge.png' }
        ];
        
        this.popularProducts = this.allProducts.slice(0, 4);
      } finally {
        this.productsLoading = false;
      }
    },
    
    getCategoryImage(category) {
      // Si la catégorie a une image dans la BD, l'utiliser
      if (category.image && category.image !== '') {
        return `/images/categories/${category.image}`;
      }
      
      // Sinon, utiliser l'image par défaut selon le type de catégorie
      const categoryType = category.type ? category.type.toLowerCase() : 
                          category.name.toLowerCase().includes('homme') ? 'homme' :
                          category.name.toLowerCase().includes('femme') ? 'femme' :
                          category.name.toLowerCase().includes('enfant') ? 'enfant' : 'default';
      
      return this.defaultImages[categoryType] || this.defaultImages.default;
    },
    
    getProductImage(product) {
      // Si le produit a une image dans la BD, l'utiliser
      if (product.image && product.image !== '') {
        return `/images/products/${product.image}`;
      }
      
      // Sinon, utiliser une image de placeholder basée sur le nom du produit
      const productName = product.name ? product.name.toLowerCase() : '';
      
      if (productName.includes('noir')) {
        return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      } else if (productName.includes('blanc')) {
        return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      } else if (productName.includes('gris')) {
        return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      } else if (productName.includes('rose')) {
        return 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      } else if (productName.includes('bleu')) {
        return 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      } else if (productName.includes('rouge')) {
        return 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      }
      
      // Image par défaut
      return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    },
    
    handleImageError(event) {
      const categoryType = event.target.dataset.categoryType || 'default';
      event.target.src = this.defaultImages[categoryType] || this.defaultImages.default;
    },
    
    handleProductImageError(event) {
      event.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    },
    
    getProductCount(categoryId) {
      if (!this.allProducts || this.allProducts.length === 0) return 0;
      return this.allProducts.filter(p => p.categoryId === categoryId).length;
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    },
    
    logout() {
      if (this.setUser) {
        this.setUser(null);
      }
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  },
  async mounted() {
    await this.loadCategories();
    await this.loadProducts();
  }
}
</script>

<style scoped>
.all-categories-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 0;
}

.categories-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Fil d'Ariane */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #9ca3af;
}

.breadcrumb-current {
  color: #4b5563;
  font-weight: 500;
}

/* Titres */
.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 3rem;
}

/* Chargement */
.loading-categories,
.loading-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3b82f6;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.spinner.small {
  width: 30px;
  height: 30px;
  border-width: 3px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Grille des catégories */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
  margin-bottom: 5rem;
}

.category-large-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 400px;
  display: block;
}

.category-large-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.category-image-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.category-large-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.category-large-card:hover .category-large-img {
  transform: scale(1.05);
}

.category-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 2rem;
  padding-top: 4rem;
}

.category-large-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.category-count {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.explore-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: background 0.3s ease;
}

.category-large-card:hover .explore-text {
  background: rgba(255, 255, 255, 0.3);
}

/* Produits populaires */
.featured-products {
  margin-top: 4rem;
  padding-top: 4rem;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
}

.products-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.product-preview-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-preview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.product-preview-image {
  height: 200px;
  overflow: hidden;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-preview-card:hover .product-preview-img {
  transform: scale(1.05);
}

.product-preview-name {
  padding: 1rem 1rem 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex-grow: 1;
}

.product-preview-price {
  padding: 0 1rem 1rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
}

.view-all-container {
  text-align: center;
  margin-top: 2rem;
}

.view-all-btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
}

.view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .categories-content {
    padding: 0 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .category-large-card {
    height: 350px;
  }
  
  .products-preview {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.8rem;
  }
  
  .category-large-card {
    height: 300px;
  }
  
  .category-large-name {
    font-size: 1.5rem;
  }
  
  .products-preview {
    grid-template-columns: 1fr;
  }
  
  .product-preview-image {
    height: 180px;
  }
}
</style>