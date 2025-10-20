<template>
  <div class="product-page">
    <!-- Navigation -->
    <nav class="navigation">
      <router-link to="/" class="nav-logo">MonShop</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Accueil</router-link>
        <router-link to="/category/1" class="nav-link">Homme</router-link>
        <router-link to="/category/2" class="nav-link">Femme</router-link>
        <router-link to="/category/3" class="nav-link">Enfants</router-link>
      </div>
    </nav>

    <div class="product-content">
      <!-- Fil d'Ariane -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="breadcrumb-separator">/</span>
        <router-link 
          :to="`/category/${productCategory}`" 
          class="breadcrumb-link"
        >
          {{ getCategoryName(productCategory) }}
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ product ? product.name : 'Produit' }}</span>
      </nav>

      <div v-if="product" class="product-details">
        <div class="product-image-section">
          <img :src="product.image" :alt="product.name" class="product-image" />
        </div>
        
        <div class="product-info-section">
          <h1 class="product-title">{{ product.name }}</h1>
          <p class="product-brand">Marque: {{ product.brand }}</p>
          <p class="product-price">{{ product.price }} €</p>
          
          <div class="product-actions">
            <button class="add-to-cart-btn">Ajouter au panier</button>
            <button class="buy-now-btn">Acheter maintenant</button>
          </div>
          
          <div class="product-description">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>
          
          <router-link 
            :to="`/category/${productCategory}`" 
            class="back-to-category"
          >
            ← Retour à la catégorie
          </router-link>
        </div>
      </div>

      <div v-else class="not-found">
        <h2>Produit non trouvé</h2>
        <p>Le produit que vous recherchez n'existe pas.</p>
        <router-link to="/" class="back-to-home">Retour à l'accueil</router-link>
      </div>
    </div>
  </div>
</template>

<script>
// Import des images CORRIGÉ - utilisation des fichiers existants
import noir from '../assets/noir.png'
import blanc from '../assets/blanc.png'
import rosefemme from '../assets/rosefemme.png'
import blancfemme from '../assets/blancfemme.png'
import noirfemme from '../assets/noirfemme.png'
import enfantbleu from '../assets/enfantbleu.png'
import enfantrouge from '../assets/enfantrouge.png'
import gris from '../assets/gris.png'

export default {
  name: 'ProductPage',
  data() {
    return {
      product: null
    }
  },
  computed: {
    productCategory() {
      if (!this.product) return null
      // Détermine la catégorie basée sur l'ID du produit
      const id = this.product.id
      if (id >= 100 && id < 200) return 1 // Homme
      if (id >= 200 && id < 300) return 2 // Femme
      if (id >= 300 && id < 400) return 3 // Enfants
      return 1
    }
  },
  mounted() {
    this.loadProduct()
  },
  watch: {
    '$route.params.id': {
      handler() {
        this.loadProduct()
      },
      immediate: true
    }
  },
  methods: {
    loadProduct() {
      const productId = parseInt(this.$route.params.id)
      const allProducts = [
        // Produits Homme
        { 
          id: 101, 
          name: "T-shirt Noir Classique", 
          brand: "Nike", 
          price: 20, 
          image: noir,
          description: "T-shirt en coton 100% biologique, coupe classique, confortable et durable. Idéal pour un usage quotidien."
        },
        { 
          id: 102, 
          name: "T-shirt Blanc Sport", 
          brand: "Adidas", 
          price: 25, 
          image: blanc,
          description: "T-shirt technique en matière respirante, parfait pour le sport et les activités extérieures."
        },
        { 
          id: 103, 
          name: "T-shirt Gris Urban", 
          brand: "Puma", 
          price: 23, 
          image: gris,
          description: "T-shirt streetwear en coton premium, design urbain et moderne."
        },
        
        // Produits Femme
        { 
          id: 201, 
          name: "T-shirt Rose Élégant", 
          brand: "Zara", 
          price: 22, 
          image: rosefemme,
          description: "T-shirt féminin en coton stretch, coupe ajustée, couleur rose pastel tendance."
        },
        { 
          id: 202, 
          name: "T-shirt Blanc Femme", 
          brand: "H&M", 
          price: 18, 
          image: blancfemme,
          description: "T-shirt basique femme, coupe standard, matière douce et agréable à porter."
        },
        { 
          id: 203, 
          name: "T-shirt Noir Femme", 
          brand: "Mango", 
          price: 21, 
          image: noirfemme,
          description: "T-shirt femme en coton bio, coupe ajustée, idéal pour toutes les occasions."
        },
        
        // Produits Enfants
        { 
          id: 301, 
          name: "T-shirt Bleu Enfant", 
          brand: "Disney", 
          price: 15, 
          image: enfantbleu,
          description: "T-shirt pour enfant avec motif Disney, coton doux, lavage facile."
        },
        { 
          id: 302, 
          name: "T-shirt Rouge Super-héros", 
          brand: "Marvel", 
          price: 16, 
          image: enfantrouge,
          description: "T-shirt enfant avec impression Marvel, parfait pour les fans de super-héros."
        }
      ]
      
      this.product = allProducts.find(p => p.id === productId)
    },
    
    getCategoryName(categoryId) {
      const categories = {
        1: "T-shirts Homme",
        2: "T-shirts Femme", 
        3: "T-shirts Enfants"
      }
      return categories[categoryId] || "Catégorie"
    }
  }
}
</script>

<style scoped>
.product-page {
  min-height: 100vh;
  background: #f8fafc;
}

.product-content {
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

/* Product Details */
.product-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.product-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-image {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}

.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.product-brand {
  font-size: 1.2rem;
  color: #6b7280;
  margin: 0;
}

.product-price {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
}

.product-actions {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.add-to-cart-btn {
  padding: 1rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  flex: 1;
}

.add-to-cart-btn:hover {
  background: #2563eb;
}

.buy-now-btn {
  padding: 1rem 2rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  flex: 1;
}

.buy-now-btn:hover {
  background: #059669;
}

.product-description {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.product-description h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.product-description p {
  color: #6b7280;
  line-height: 1.6;
}

.back-to-category {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
  display: inline-block;
}

.back-to-category:hover {
  text-decoration: underline;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.not-found h2 {
  color: #ef4444;
  margin-bottom: 1rem;
}

.not-found p {
  color: #6b7280;
  margin-bottom: 2rem;
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

@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .product-content {
    padding: 1rem;
  }
  
  .product-details {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1.5rem;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .product-title {
    font-size: 2rem;
  }
}
</style>