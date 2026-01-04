<!-- views/AdminSocial.vue -->
<template>
  <div class="admin-social">
    <h1>Gestion des Réseaux Sociaux</h1>
    
    <div class="social-dashboard">
      
      <!-- Statistiques -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>Partages Totaux</h3>
            <p class="stat-number">{{ totalShares }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>Références Sociales</h3>
            <p class="stat-number">{{ socialReferrals }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Ventes Sociales</h3>
            <p class="stat-number">{{ formatPrice(socialSales) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Programmation de posts -->
      <div class="section-card">
        <h2>Posts Programmés</h2>
        
        <div class="schedule-form">
          <div class="form-group">
            <label>Plateforme</label>
            <select v-model="newPost.platform">
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Jour</label>
            <select v-model="newPost.day">
              <option value="monday">Lundi</option>
              <option value="tuesday">Mardi</option>
              <option value="wednesday">Mercredi</option>
              <option value="thursday">Jeudi</option>
              <option value="friday">Vendredi</option>
              <option value="saturday">Samedi</option>
              <option value="sunday">Dimanche</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Heure</label>
            <input type="time" v-model="newPost.time">
          </div>
          
          <div class="form-group full-width">
            <label>Contenu</label>
            <textarea v-model="newPost.content" rows="3" placeholder="Votre message..."></textarea>
          </div>
          
          <button @click="schedulePost" class="btn-primary">Programmer</button>
        </div>
        
        <!-- Liste des posts programmés -->
        <div class="scheduled-posts">
          <h3>Posts à venir</h3>
          <div v-for="post in scheduledPosts" :key="post.id" class="post-item">
            <div class="post-platform">{{ post.platform }}</div>
            <div class="post-schedule">{{ post.day }} à {{ post.time }}</div>
            <div class="post-content">{{ post.content }}</div>
            <div class="post-actions">
              <button @click="editPost(post)">✏️</button>
              <button @click="deletePost(post.id)">🗑️</button>
              <button @click="postNow(post)">🚀</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Analyse des partages -->
      <div class="section-card">
        <h2>Analytics des Partages</h2>
        
        <div class="analytics-grid">
          <div class="analytics-chart">
            <h3>Partages par plateforme</h3>
            <div class="chart-container">
              <!-- Ici vous intégreriez un graphique (Chart.js par exemple) -->
            </div>
          </div>
          
          <div class="analytics-list">
            <h3>Produits les plus partagés</h3>
            <div v-for="product in topSharedProducts" :key="product.id" class="top-product">
              <img :src="getImageUrl(product.img)" :alt="product.name">
              <div class="product-info">
                <h4>{{ product.name }}</h4>
                <p>{{ product.shares }} partages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Génération de contenu -->
      <div class="section-card">
        <h2>Générateur de Contenu</h2>
        
        <div class="content-generator">
          <div class="form-group">
            <label>Produit à promouvoir</label>
            <select v-model="selectedProduct">
              <option v-for="product in products" :key="product.id" :value="product">
                {{ product.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Type de contenu</label>
            <select v-model="contentType">
              <option value="post">Post</option>
              <option value="story">Story</option>
              <option value="reel">Reel</option>
              <option value="tweet">Tweet</option>
            </select>
          </div>
          
          <button @click="generateContent" class="btn-primary">
            Générer le contenu
          </button>
          
          <!-- Résultat -->
          <div v-if="generatedContent" class="generated-content">
            <h3>Contenu généré :</h3>
            <div class="content-preview">
              {{ generatedContent }}
            </div>
            <div class="content-actions">
              <button @click="copyContent">📋 Copier</button>
              <button @click="previewPost">👁️ Prévisualiser</button>
              <button @click="scheduleThisContent">📅 Programmer</button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminSocial',
  
  data() {
    return {
      totalShares: 0,
      socialReferrals: 0,
      socialSales: 0,
      scheduledPosts: [],
      newPost: {
        platform: 'facebook',
        day: 'monday',
        time: '10:00',
        content: ''
      },
      products: [],
      selectedProduct: null,
      contentType: 'post',
      generatedContent: '',
      topSharedProducts: []
    }
  },
  
  async mounted() {
    await this.loadStats()
    await this.loadProducts()
    await this.loadScheduledPosts()
  },
  
  methods: {
    async loadStats() {
      // Charger les statistiques depuis l'API
      // ...
    },
    
    async loadProducts() {
      // Charger les produits depuis l'API
      // ...
    },
    
    async loadScheduledPosts() {
      // Charger les posts programmés
      // ...
    },
    
    async schedulePost() {
      // Programmer un nouveau post
      // ...
    },
    
    generateContent() {
      const templates = {
        post: `🔥 NOUVEAUTÉ !\n\nDécouvrez "${this.selectedProduct.name}" sur MonShop !\n\n✨ ${this.selectedProduct.description}\n\n💶 ${this.selectedProduct.price}€\n\n👉 ${window.location.origin}/product/${this.selectedProduct.id}\n\n#MonShop #Fashion #Style #${this.selectedProduct.category}`,
        story: `✨ ${this.selectedProduct.name}\n\nDisponible maintenant sur MonShop !\n\nLien en bio 👆\n\n#MonShop #Nouveauté`,
        reel: `🎬 Nouvelle collection !\n\n${this.selectedProduct.name} est enfin disponible !\n\n👉 Lien en bio pour shopper\n\n#MonShop #Mode #FashionReel`,
        tweet: `🔥 Just arrived! "${this.selectedProduct.name}" is now available on MonShop!\n\n${window.location.origin}/product/${this.selectedProduct.id}\n\n#MonShop #Fashion #NewArrival`
      }
      
      this.generatedContent = templates[this.contentType]
    },
    
    copyContent() {
      navigator.clipboard.writeText(this.generatedContent)
      alert('Contenu copié !')
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    
    getImageUrl(img) {
      return `/images/${img}`
    }
  }
}
</script>

<style scoped>
.admin-social {
  padding: 2rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #3b82f6;
  margin: 0.5rem 0 0 0;
}

.section-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.schedule-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.scheduled-posts {
  margin-top: 2rem;
}

.post-item {
  display: grid;
  grid-template-columns: 100px 150px 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
}

.top-product {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.top-product img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.content-generator {
  margin-top: 1.5rem;
}

.generated-content {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.content-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

select, input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .post-item {
    grid-template-columns: 1fr;
  }
}
</style>