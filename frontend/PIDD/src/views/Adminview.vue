<template>
  <div class="admin-dashboard">
    <!-- En-tête de l'admin -->
    <div class="admin-header">
      <h1>Tableau de bord Administrateur</h1>
      <p class="admin-welcome">Bienvenue, {{ user?.username || 'Administrateur' }}</p>
    </div>

    <!-- Statistiques rapides 
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
    </div> -->

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
/* ============================================
   STYLE PRINCIPAL TABLEAU DE BORD ADMIN
   ============================================ */

.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ============================================
   EN-TÊTE ADMIN
   ============================================ */
.admin-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInDown 0.8s ease-out;
}

.admin-header h1 {
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
  position: relative;
}

.admin-header h1::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.admin-welcome {
  font-size: 1.2rem;
  color: #64748b;
  margin-top: 1rem;
  font-weight: 500;
  animation: fadeIn 1s ease-out 0.2s both;
}

/* ============================================
   CARTES STATISTIQUES
   ============================================ */
.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 1.8rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.stat-card:nth-child(2)::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.stat-card:nth-child(3)::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.stat-card:nth-child(4)::before {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border-color: #e2e8f0;
}

.stat-icon {
  font-size: 3.5rem;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: float 3s ease-in-out infinite;
}

.stat-card:nth-child(1) .stat-icon {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
  color: #10b981;
  animation-delay: 0.5s;
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
  color: #f59e0b;
  animation-delay: 1s;
}

.stat-card:nth-child(4) .stat-icon {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1));
  color: #8b5cf6;
  animation-delay: 1.5s;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ============================================
   ACTIONS PRINCIPALES
   ============================================ */
.admin-actions {
  margin-bottom: 3rem;
}

.admin-actions h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 2rem;
  position: relative;
  padding-left: 1.5rem;
}

.admin-actions h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(102, 126, 234, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border-color: #e2e8f0;
}

.action-card:hover::before {
  opacity: 1;
}

.action-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.action-card:nth-child(1) .action-icon {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
}

.action-card:nth-child(2) .action-icon {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
  color: #10b981;
}

.action-card:nth-child(3) .action-icon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
  color: #f59e0b;
}

.action-card:hover .action-icon {
  transform: scale(1.1) rotate(5deg);
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.action-content p {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.action-arrow {
  font-size: 1.8rem;
  color: #667eea;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ============================================
   LIENS RAPIDES
   ============================================ */
.quick-links {
  margin-bottom: 3rem;
}

.quick-links h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 2rem;
  position: relative;
  padding-left: 1.5rem;
}

.quick-links h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 40px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 3px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.2rem;
}

.quick-link {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
  font-weight: 500;
  color: #334155;
  position: relative;
  overflow: hidden;
}

.quick-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.quick-link:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.quick-link:hover::before {
  opacity: 1;
}

.quick-link span:first-child {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
}

.quick-link:nth-child(2) span:first-child {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
  color: #10b981;
}

.quick-link:nth-child(3) span:first-child {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
  color: #f59e0b;
}

.quick-link:hover span:first-child {
  transform: scale(1.1) rotate(15deg);
}

.quick-link span:last-child {
  font-weight: 600;
  color: #334155;
}

/* ============================================
   ANIMATIONS
   ============================================ */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Animation des cartes */
.stat-card:nth-child(1) { animation: slideInLeft 0.6s ease-out; }
.stat-card:nth-child(2) { animation: slideInLeft 0.6s ease-out 0.1s both; }
.stat-card:nth-child(3) { animation: slideInRight 0.6s ease-out 0.2s both; }
.stat-card:nth-child(4) { animation: slideInRight 0.6s ease-out 0.3s both; }

.action-card:nth-child(1) { animation: slideInLeft 0.6s ease-out 0.4s both; }
.action-card:nth-child(2) { animation: slideInLeft 0.6s ease-out 0.5s both; }
.action-card:nth-child(3) { animation: slideInRight 0.6s ease-out 0.6s both; }

.quick-link:nth-child(1) { animation: fadeIn 0.6s ease-out 0.7s both; }
.quick-link:nth-child(2) { animation: fadeIn 0.6s ease-out 0.8s both; }
.quick-link:nth-child(3) { animation: fadeIn 0.6s ease-out 0.9s both; }

/* ============================================
   SCROLLBAR PERSONNALISÉE
   ============================================ */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  border-radius: 10px;
  border: 2px solid #f1f5f9;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #64748b, #475569);
}

/* ============================================
   EFFETS SPÉCIAUX
   ============================================ */
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.hover-lift {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* ============================================
   RESPONSIVE DESIGN
   ============================================ */
@media (max-width: 1200px) {
  .admin-dashboard {
    padding: 1.5rem;
  }
}

@media (max-width: 992px) {
  .admin-header h1 {
    font-size: 2.5rem;
  }
  
  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }
  
  .admin-header h1 {
    font-size: 2rem;
  }
  
  .admin-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card,
  .action-card {
    padding: 1.5rem;
  }
  
  .stat-icon,
  .action-icon {
    width: 60px;
    height: 60px;
    font-size: 2.5rem;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
  
  .action-content h3 {
    font-size: 1.2rem;
  }
}

@media (max-width: 576px) {
  .admin-stats {
    grid-template-columns: 1fr;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-actions h2,
  .quick-links h2 {
    font-size: 1.5rem;
    padding-left: 1rem;
  }
  
  .admin-actions h2::before,
  .quick-links h2::before {
    height: 30px;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .action-arrow {
    display: none;
  }
}

/* ============================================
   ÉTAT LOADING
   ============================================ */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #475569;
  font-weight: 500;
  font-size: 1.1rem;
}

/* ============================================
   ÉLÉMENTS DÉCORATIFS
   ============================================ */
.decorative-dots {
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
  pointer-events: none;
}

/* ============================================
   TRANSITIONS GLOBALES
   ============================================ */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>