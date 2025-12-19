<template>
  <div class="admin-dashboard">
    <!-- En-tête de l'admin -->
    <div class="admin-header">
      <h1>Tableau de bord Administrateur</h1>
      <p class="admin-welcome">Bienvenue, {{ user?.username || 'Administrateur' }}</p>
    </div>

    <!-- Statistiques rapides -->
    <div class="admin-stats">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Total Produits</h3>
          <p class="stat-value">{{ stats?.totalProducts || '0' }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <h3>Commandes en cours</h3>
          <p class="stat-value">{{ stats?.pendingOrders || '0' }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Revenus du mois</h3>
          <p class="stat-value">{{ stats?.monthlyRevenue || '0' }} €</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>Utilisateurs</h3>
          <p class="stat-value">{{ stats?.totalUsers || '0' }}</p>
        </div>
      </div>
    </div>

    <!-- Actions principales -->
    <div class="admin-actions">
      <h2>Gestion</h2>
      <div class="actions-grid">
        <router-link to="/admin/products" class="action-card">
          <div class="action-icon">🛍️</div>
          <div class="action-content">
            <h3>Gestion des produits</h3>
            <p>Ajouter, modifier ou supprimer des produits</p>
          </div>
          <span class="action-arrow">→</span>
        </router-link>

        <router-link to="/admin/orders" class="action-card">
          <div class="action-icon">📦</div>
          <div class="action-content">
            <h3>Gestion des commandes</h3>
            <p>Suivre et gérer les commandes clients</p>
          </div>
          <span class="action-arrow">→</span>
        </router-link>

        <router-link to="/admin/analytics" class="action-card">
          <div class="action-icon">📊</div>
          <div class="action-content">
            <h3>Analytiques</h3>
            <p>Statistiques et rapports de vente</p>
          </div>
          <span class="action-arrow">→</span>
        </router-link>
      </div>
    </div>

    <!-- Liens rapides -->
    <div class="quick-links">
      <h2>Accès rapide</h2>
      <div class="links-grid">
        <button @click="createNewProduct" class="quick-link">
          <span>➕</span>
          <span>Nouveau produit</span>
        </button>
        <button @click="viewRecentOrders" class="quick-link">
          <span>🔍</span>
          <span>Voir commandes récentes</span>
        </button>
        <button @click="goToSite" class="quick-link">
          <span>🌐</span>
          <span>Voir le site</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Adminview',
  props: ['user', 'setUser', 'getUser'],
  data() {
    return {
      stats: {
        totalProducts: 0,
        pendingOrders: 0,
        monthlyRevenue: 0,
        totalUsers: 0
      },
      loading: false
    }
  },
  async mounted() {
    await this.loadDashboardStats()
  },
  methods: {
    async loadDashboardStats() {
      this.loading = true
      try {
        // Ici vous ferez vos appels API pour les statistiques
        // Exemple :
        // const response = await api.get('/admin/stats')
        // this.stats = response.data
        
        // Pour l'instant, on met des données fictives
        this.stats = {
          totalProducts: 150,
          pendingOrders: 12,
          monthlyRevenue: 4500,
          totalUsers: 85
        }
      } catch (error) {
        console.error('Erreur chargement stats:', error)
      } finally {
        this.loading = false
      }
    },
    
    createNewProduct() {
      this.$router.push('/admin/products?action=create')
    },
    
    viewRecentOrders() {
      this.$router.push('/admin/orders?filter=recent')
    },
    
    goToSite() {
      window.open('/', '_blank')
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  text-align: center;
  margin-bottom: 40px;
}

.admin-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.admin-welcome {
  color: #7f8c8d;
  font-size: 1.1em;
}

/* Statistiques */
.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5em;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  color: #7f8c8d;
  font-size: 0.9em;
}

.stat-value {
  margin: 0;
  font-size: 2em;
  font-weight: bold;
  color: #2c3e50;
}

/* Actions principales */
.admin-actions {
  margin-bottom: 40px;
}

.admin-actions h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: all 0.3s;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-5px);
  border-color: #3498db;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 2.5em;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.action-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9em;
}

.action-arrow {
  font-size: 1.5em;
  color: #3498db;
  opacity: 0;
  transition: opacity 0.3s;
}

.action-card:hover .action-arrow {
  opacity: 1;
}

/* Liens rapides */
.quick-links h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.quick-link {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1em;
}

.quick-link:hover {
  border-color: #3498db;
  background: #f8fafc;
  transform: translateY(-2px);
}

.quick-link span:first-child {
  font-size: 1.2em;
}

.quick-link span:last-child {
  color: #2c3e50;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 15px;
  }
  
  .admin-stats {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>