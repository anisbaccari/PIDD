<template>
  <div class="category-page">
    <!-- Navigation -->
    <div class="category-content">
      <!-- Fil d'Ariane -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ categoryName }}</span>
      </nav>

      <h1 class="title">{{ categoryName }}</h1>

      <div v-if="products.length" class="products-grid">
        <router-link
          v-for="p in products"
          :key="p.id"
          :to="`/product/${p.id}`"
          class="product-card"
        >
       
          <img :src="p.image" :alt="p.name" class="product-img" />
          <div class="product-info">
            <p class="product-name">{{ p.name }}</p>
            <p class="product-brand">{{ p.brand }}</p>
            <p class="product-price">{{ p.price }} €</p>
          </div>
          <button class="view-details-btn">Voir détails</button>
        </router-link>
      </div>

      <div v-else class="empty-state">
        <p class="empty-text">Aucun produit dans cette catégorie</p>
        <router-link to="/" class="back-to-home">Retour à l'accueil</router-link>
      </div>
    </div>
  </div>
</template>

<script>
// Import des images CORRIGÉ - utilisation des fichiers existants
import blanc from '../assets/blanc.png'
import blancfemme from '../assets/blancfemme.png'
import enfantbleu from '../assets/enfantbleu.png'
import enfantrouge from '../assets/enfantrouge.png'
import gris from '../assets/gris.png'
import noir from '../assets/noir.png'
import noirfemme from '../assets/noirfemme.png'
import rosefemme from '../assets/rosefemme.png'
import api from '../api.js'
export default {
  name: 'CategoryPage',
  data() {
    return {
      products: [], 
      imageMap: {
        'noir.png': noir,
        'blanc.png': blanc,
        'rosefemme.png': rosefemme,
        'gris.png': gris,
        'blancfemme.png': blancfemme,
        'noirfemme.png': noirfemme,
        'enfantbleu.png': enfantbleu,
        'enfantrouge.png': enfantrouge
      },
      categoryName: ""
    }
  },
  mounted() {
    this.initProduct()
    this.loadCategoryData()
  },
  watch: {
    '$route.params.id': {
      handler() {
        this.loadCategoryData()
      },
      immediate: true
    }
  },
  methods: {

    async initProduct(){
      const productList =  await api.get(`http://localhost:3000/product/all`)
      console.log('productList : ',productList);
      console.log('productList : ',productList.data);
    },
      getProductImage(imgName) {
      if (!imgName) return '';
      return this.imageMap[imgName] || '';
    },
    loadCategoryData() {
      const categoryId = this.$route.params.id
      if (categoryId == 1) {
        this.categoryName = "T-shirts Homme"
        this.products = [
          { id: 101, name: "T-shirt Noir Classique", brand: "Nike", price: 20, image: noir },
          { id: 102, name: "T-shirt Blanc Sport", brand: "Adidas", price: 25, image: blanc },
          { id: 103, name: "T-shirt Gris Urban", brand: "Puma", price: 23, image: gris }
        ]
      } else if (categoryId == 2) {
        this.categoryName = "T-shirts Femme"
        this.products = [
          { id: 201, name: "T-shirt Rose Élégant", brand: "Zara", price: 22, image: rosefemme },
          { id: 202, name: "T-shirt Blanc Femme", brand: "H&M", price: 18, image: blancfemme },
          { id: 203, name: "T-shirt Noir Femme", brand: "Mango", price: 21, image: noirfemme }
        ]
      } else if (categoryId == 3) {
        this.categoryName = "T-shirts Enfants"
        this.products = [
          { id: 301, name: "T-shirt Bleu Enfant", brand: "Disney", price: 15, image: enfantbleu },
          { id: 302, name: "T-shirt Rouge Super-héros", brand: "Marvel", price: 16, image: enfantrouge }
        ]
      } else {
        this.categoryName = "Catégorie inconnue"
        this.products = []
      }
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

.product-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-decoration: none;
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

.view-details-btn {
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.view-details-btn:hover {
  background: #2563eb;
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

/* Navigation (identique à Home) */
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
  
  .category-content {
    padding: 1rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
}
</style>