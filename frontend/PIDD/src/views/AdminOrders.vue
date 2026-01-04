<template>
  <div class="admin-orders">
    <!-- Header -->
    <div class="admin-header">
      <div class="header-top">
        <div class="header-title-section">
          <h1 class="page-title">
            <span class="title-icon">📊</span>
            Gestion des Commandes
          </h1>
          <p class="page-subtitle">Visualisez et gérez toutes les commandes de votre boutique</p>
        </div>
        
        <div class="header-actions">
          <div class="action-buttons">
            <button @click="goToDashboard" class="action-button dashboard-btn">
              <div class="button-content">
                <div class="button-icon">
                  <span class="icon">🏠</span>
                  <div class="icon-glow"></div>
                </div>
                <div class="button-text">
                  <span class="button-title">Dashboard</span>
                  <span class="button-subtitle">Tableau de bord</span>
                </div>
              </div>
            </button>
            
            <button @click="goToAnalytics" class="action-button analytics-btn">
              <div class="button-content">
                <div class="button-icon">
                  <span class="icon">📈</span>
                  <div class="icon-glow"></div>
                </div>
                <div class="button-text">
                  <span class="button-title">Analytics</span>
                  <span class="button-subtitle">Statistiques</span>
                </div>
              </div>
            </button>
            
           
          </div>
        </div>
      </div>

      <!-- Filtres rapides -->
      <div class="header-filters">
        <div class="filters-container">
          <div class="filter-group">
            <div class="filter-label">
              <span class="filter-icon">🔍</span>
              <span>Filtres rapides</span>
            </div>
            <div class="filter-controls">
              <select v-model="statusFilter" @change="loadOrders" class="filter-select">
                <option value="">Tous les statuts</option>
                <option value="pending">⏳ En attente</option>
                <option value="paid">✅ Payées</option>
                <option value="cancelled">❌ Annulées</option>
              </select>
              
              <select v-model="periodFilter" @change="loadOrders" class="filter-select">
                <option value="all">📅 Toutes périodes</option>
                <option value="today">☀️ Aujourd'hui</option>
                <option value="week">📅 Cette semaine</option>
                <option value="month">📆 Ce mois</option>
              </select>
              
              <button @click="exportOrders" class="export-button">
                <span class="export-icon">📤</span>
                <span>Exporter</span>
              </button>
            </div>
          </div>
          
          <div class="search-container">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input 
                v-model="searchQuery" 
                @input="debounceSearch"
                placeholder="Rechercher une commande, client, email..."
                class="search-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon total">📦</div>
        <div class="stat-content">
          <h3>Commandes totales</h3>
          <p class="stat-number">{{ stats.totalOrders || 0 }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pending">⏳</div>
        <div class="stat-content">
          <h3>En attente</h3>
          <p class="stat-number">{{ stats.pendingOrders || 0 }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon revenue">💰</div>
        <div class="stat-content">
          <h3>Chiffre d'affaires</h3>
          <p class="stat-number">{{ formatPrice(stats.totalRevenue || 0) }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon average">📊</div>
        <div class="stat-content">
          <h3>Panier moyen</h3>
          <p class="stat-number">{{ formatPrice(stats.averageOrderValue || 0) }}</p>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Chargement des commandes...</p>
      </div>
    </div>

    <!-- Orders Table -->
    <div v-else class="orders-table">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" @change="toggleSelectAll"></th>
            <th>N° Commande</th>
            <th>Client</th>
            <th>Date</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="orders.length === 0">
            <td colspan="7" class="no-data">
              <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                <h3>Aucune commande trouvée</h3>
                <p v-if="isUsingTestData" style="color: #f59e0b;">
                  Mode démo - Données de test affichées
                </p>
                <button @click="loadOrders" class="retry-btn" style="margin-top: 1rem;">
                  🔄 Réessayer
                </button>
              </div>
            </td>
          </tr>
          <tr v-for="order in orders" :key="order.id" :class="['order-row', order.status]">
            <td><input type="checkbox" :value="order.id" v-model="selectedOrders"></td>
            <td>
              <strong>{{ order.orderNumber }}</strong>
              <div class="order-id">ID: {{ order.id }}</div>
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name">{{ order.customer.fullName }}</div>
                <div class="customer-email">{{ order.customer.email }}</div>
              </div>
            </td>
            <td>
              <div class="order-date">
                <div>{{ formatDate(order.createdAt) }}</div>
                <div class="order-time">{{ formatTime(order.createdAt) }}</div>
              </div>
            </td>
            <td class="amount-cell">
              <strong>{{ formatPrice(order.totalPrice) }}</strong>
            </td>
            <td>
              <span class="status-badge" :class="order.status">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td>
              <div class="order-actions">
                <button @click="viewOrderDetails(order)" class="action-btn view" title="Voir détails">
                  👁️
                </button>
                <button @click="openStatusModal(order)" class="action-btn edit" title="Modifier statut">
                  ✏️
                </button>
                <button @click="printInvoice(order)" class="action-btn print" title="Imprimer facture">
                  🖨️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Bulk Actions -->
      <div v-if="selectedOrders.length > 0" class="bulk-actions">
        <span class="selected-count">{{ selectedOrders.length }} commande(s) sélectionnée(s)</span>
        <div class="bulk-buttons">
          <select v-model="bulkAction" class="bulk-select">
            <option value="">Action groupée</option>
            <option value="paid">Marquer comme Payées</option>
            <option value="cancelled">Annuler commandes</option>
          </select>
          <button @click="applyBulkAction" class="apply-btn">Appliquer</button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="pagination.pages > 1">
        <button @click="prevPage" :disabled="pagination.page === 1" class="page-btn">
          ← Précédent
        </button>
        <span class="page-info">
          Page {{ pagination.page }} sur {{ pagination.pages }}
        </span>
        <button @click="nextPage" :disabled="pagination.page === pagination.pages" class="page-btn">
          Suivant →
        </button>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h2>Détails de la commande {{ selectedOrder.orderNumber }}</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <div class="order-details-modal">
          <!-- Order Info -->
          <div class="detail-section">
            <h3>Informations commande</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Date :</label>
                <span>{{ formatDate(selectedOrder.createdAt) }} à {{ formatTime(selectedOrder.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <label>Statut :</label>
                <span class="status-badge" :class="selectedOrder.status">
                  {{ getStatusLabel(selectedOrder.status) }}
                </span>
              </div>
              <div class="detail-item">
                <label>Méthode paiement :</label>
                <span>{{ selectedOrder.payment.method }}</span>
              </div>
              <div class="detail-item">
                <label>Transaction :</label>
                <span>{{ selectedOrder.payment.transactionId }}</span>
              </div>
            </div>
          </div>
          
          <!-- Customer Info -->
          <div class="detail-section">
            <h3>Client</h3>
            <div class="customer-details">
              <div class="customer-card">
                <div class="customer-header">
                  <div class="customer-avatar">
                    {{ getInitials(selectedOrder.customer.fullName) }}
                  </div>
                  <div>
                    <h4>{{ selectedOrder.customer.fullName }}</h4>
                    <p>{{ selectedOrder.customer.email }}</p>
                  </div>
                </div>
                <div class="customer-contact">
                  <p>📍 {{ selectedOrder.delivery.address || 'Adresse non renseignée' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Order Items -->
          <div class="detail-section">
            <h3>Articles commandés</h3>
            <div class="order-items">
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Prix unitaire</th>
                    <th>Quantité</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedOrder.items" :key="item.id">
                    <td>
                      <div class="product-info">
                      
                        <div>
                          <div class="product-name">{{ item.product.name }}</div>
                          <div class="product-category">{{ item.product.category }}</div>
                        </div>
                      </div>
                    </td>
                    <td>{{ formatPrice(item.unitPrice) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td><strong>{{ formatPrice(item.total) }}</strong></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="3"><strong>Total</strong></td>
                    <td><strong>{{ formatPrice(selectedOrder.totalPrice) }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="modal-actions">
            <button @click="printInvoice(selectedOrder)" class="action-btn primary">
              🖨️ Imprimer facture
            </button>
            <button @click="openStatusModal(selectedOrder)" class="action-btn secondary">
              ✏️ Modifier statut
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Update Modal -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Modifier le statut</h2>
          <button @click="closeStatusModal" class="close-btn">×</button>
        </div>
        
        <div class="status-form">
          <div class="form-group">
            <label>Nouveau statut :</label>
            <select v-model="newStatus" class="form-select">
              <option value="pending">En attente</option>
              <option value="paid">Payée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
      
          
          <div class="form-group">
            <label>Commentaire :</label>
            <textarea v-model="statusComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
          </div>
          
          <div class="form-actions">
            <button @click="closeStatusModal" class="btn-cancel">Annuler</button>
            <button @click="saveStatusUpdate" class="btn-save" :disabled="!newStatus">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminOrders',
  data() {
    return {
      orders: [],
      loading: false,
      searchQuery: '',
      statusFilter: '',
      periodFilter: 'all',
      selectedOrders: [],
      selectedOrder: null,
      showStatusModal: false,
      orderToUpdate: null,
      newStatus: '',
      trackingNumber: '',
      statusComment: '',
      bulkAction: '',
      searchTimeout: null,
      isUsingTestData: false,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
      },
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        averageOrderValue: 0
      }
    }
  },

  async mounted() {
    await this.loadOrders();
  },

  methods: {
    async loadOrders() {
      this.loading = true;
      this.isUsingTestData = false;
      
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        };

        if (this.statusFilter) params.status = this.statusFilter;
        if (this.searchQuery) params.search = this.searchQuery;
        
        const startDate = this.getStartDateFilter();
        if (startDate) params.startDate = startDate;

        console.log('🔍 Requête API vers /admin/orders avec params:', params);

        const response = await axios.get('/admin/orders', {
          params,
          headers: this.getAuthHeaders()
        });

        console.log('✅ Réponse API reçue:', response.data);

        if (response.data && response.data.success) {
          this.orders = response.data.orders || [];
          this.pagination = response.data.pagination || this.pagination;
          this.stats = response.data.stats || this.stats;
          
          console.log(`📊 ${this.orders.length} commandes chargées`);
          console.log('📈 Statistiques:', this.stats);
          
          // Si pas de données mais API fonctionne
          if (this.orders.length === 0) {
            console.log('⚠️  Aucune commande dans la base de données');
          }
        } else {
          console.warn('⚠️  Réponse API sans succès:', response.data);
          throw new Error(response.data?.error || 'Erreur API');
        }

      } catch (error) {
        console.error('❌ Erreur chargement commandes:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        
        // Fallback: charger des données de test
        this.loadTestData();
        this.showNotification('Données de démo affichées (API non disponible)', 'warning');
        
      } finally {
        this.loading = false;
      }
    },

    async testBackendConnection() {
      try {
        console.log('🧪 Test de connexion backend...');
        
        // Test endpoint simple
        const testResponse = await axios.get('/admin/orders', {
          params: { page: 1, limit: 2 },
          headers: this.getAuthHeaders()
        });
        
        console.log('✅ Backend fonctionnel:', testResponse.data);
        
        if (testResponse.data.success) {
          alert(`✅ Backend OK!\n${testResponse.data.orders?.length || 0} commandes trouvées`);
          await this.loadOrders();
        } else {
          alert(`⚠️  Backend erreur: ${testResponse.data.error}`);
        }
        
        return testResponse.data;
        
      } catch (error) {
        console.error('❌ Test backend échoué:', error);
        
        const errorMsg = error.response?.data?.error || error.message;
        alert(`❌ Erreur backend:\n${errorMsg}\n\nCode: ${error.response?.status}`);
        
        return null;
      }
    },

    loadTestData() {
      console.log('🧪 Chargement données de test...');
      this.isUsingTestData = true;
    
      
      // Calculer les stats locales
      this.calculateLocalStats();
      
      // Mettre à jour la pagination
      this.pagination = {
        page: 1,
        limit: 10,
        total: this.orders.length,
        pages: 1
      };
    },

    calculateLocalStats() {
      this.stats = {
        totalOrders: this.orders.length,
        pendingOrders: this.orders.filter(o => o.status === 'pending').length,
        totalRevenue: this.orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
        averageOrderValue: this.orders.length > 0 
          ? this.orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0) / this.orders.length
          : 0
      };
    },

    debounceSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1;
        this.loadOrders();
      }, 500);
    },

    getProductImage(img) {
      if (!img) {
        return '/image/no-image.png';
      }
      
      if (img.startsWith('http://') || img.startsWith('https://') || img.includes('/')) {
        return img;
      }
      
      return `/image/${img}`;
    },

    handleImageError(event) {
      event.target.src = '/image/no-image.png';
      event.target.onerror = null;
    },

    getStartDateFilter() {
      const now = new Date();
      switch (this.periodFilter) {
        case 'today':
          return now.toISOString().split('T')[0];
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return weekAgo.toISOString().split('T')[0];
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return monthAgo.toISOString().split('T')[0];
        default:
          return null;
      }
    },

    openStatusModal(order) {
      this.orderToUpdate = order;
      this.newStatus = order.status;
      this.trackingNumber = order.delivery?.trackingNumber || '';
      this.showStatusModal = true;
    },

    async saveStatusUpdate() {
      if (!this.orderToUpdate || !this.newStatus) return;

      try {
        const response = await axios.put(
          `/admin/orders/${this.orderToUpdate.id}/status`,
          {
            status: this.newStatus,
            trackingNumber: this.trackingNumber || undefined,
            notes: this.statusComment || undefined
          },
          { headers: this.getAuthHeaders() }
        );

        if (response.data.success) {
          this.showNotification('Statut mis à jour avec succès', 'success');
          this.closeStatusModal();
          await this.loadOrders();
        }

      } catch (error) {
        console.error('❌ Erreur mise à jour statut:', error);
        this.showNotification('Erreur lors de la mise à jour', 'error');
      }
    },

    async applyBulkAction() {
      if (!this.bulkAction || this.selectedOrders.length === 0) return;

      if (this.bulkAction === 'cancelled') {
        if (!confirm(`Êtes-vous sûr de vouloir annuler ${this.selectedOrders.length} commande(s) ?`)) {
          return;
        }
      }

      try {
        const response = await axios.put(
          '/admin/orders/bulk/status',
          {
            orderIds: this.selectedOrders,
            status: this.bulkAction
          },
          { headers: this.getAuthHeaders() }
        );

        if (response.data.success) {
          this.showNotification(`${this.selectedOrders.length} commande(s) mises à jour`, 'success');
          this.selectedOrders = [];
          this.bulkAction = '';
          await this.loadOrders();
        }

      } catch (error) {
        console.error('❌ Erreur action groupée:', error);
        this.showNotification('Erreur lors de l\'action groupée', 'error');
      }
    },

    async exportOrders() {
      try {
        const params = {};
        if (this.statusFilter) params.status = this.statusFilter;
        
        const startDate = this.getStartDateFilter();
        if (startDate) params.startDate = startDate;

        const response = await axios.get('/admin/orders/export', {
          params,
          headers: this.getAuthHeaders(),
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `commandes_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();

      } catch (error) {
        console.error('❌ Erreur export:', error);
        this.showNotification('Erreur lors de l\'export', 'error');
      }
    },

    viewOrderDetails(order) {
      this.selectedOrder = order;
    },

    printInvoice(order) {
      console.log('Impression facture:', order.orderNumber);
      window.print();
    },

    toggleSelectAll(event) {
      if (event.target.checked) {
        this.selectedOrders = this.orders.map(o => o.id);
      } else {
        this.selectedOrders = [];
      }
    },

    prevPage() {
      if (this.pagination.page > 1) {
        this.pagination.page--;
        this.loadOrders();
      }
    },

    nextPage() {
      if (this.pagination.page < this.pagination.pages) {
        this.pagination.page++;
        this.loadOrders();
      }
    },

    closeModal() {
      this.selectedOrder = null;
    },

    closeStatusModal() {
      this.showStatusModal = false;
      this.orderToUpdate = null;
      this.newStatus = '';
      this.trackingNumber = '';
      this.statusComment = '';
    },

    goToDashboard() {
      this.$router.push('/admin/products');
    },

    goToAnalytics() {
      this.$router.push('/admin/analytics');
    },

    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price || 0);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    formatTime(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getStatusLabel(status) {
      const labels = {
        pending: 'En attente',
        confirmed: 'Confirmée',
        processing: 'En traitement',
        shipped: 'Expédiée',
        delivered: 'Livrée',
        cancelled: 'Annulée'
      };
      return labels[status] || status;
    },

    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },

    getAuthHeaders() {
      // Essayer plusieurs sources pour le token
      let token = null;
      
      // 1. LocalStorage
      token = localStorage.getItem('authToken');
      
      // 2. SessionStorage
      if (!token) {
        token = sessionStorage.getItem('authToken');
      }
      
      // 3. Vuex store
      if (!token && this.$store && this.$store.state.auth) {
        token = this.$store.state.auth.token;
      }
      
      // 4. Cookie
      if (!token) {
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1];
        if (cookieToken) token = cookieToken;
      }
      
      console.log('🔑 Token récupéré:', token ? '✅' : '❌ NON TROUVÉ');
      
      if (!token) {
        console.warn('⚠️  Aucun token d\'authentification trouvé');
        // Vous pouvez rediriger vers login si nécessaire
        // this.$router.push('/login');
        return {};
      }
      
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    },

    showNotification(message, type = 'info') {
      // Utilisez votre système de notification préféré
      const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌';
      alert(`${icon} ${message}`);
    }
  }
}
</script>
<style scoped>
/* ============================================
   STYLE PRINCIPAL ADMIN ORDERS
   ============================================ */

.admin-orders {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ============================================
   HEADER
   ============================================ */
.admin-header {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-title-section {
  flex: 1;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  letter-spacing: -0.5px;
}

.title-icon {
  font-size: 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

/* ============================================
   BOUTONS D'ACTION HEADER
   ============================================ */
.action-buttons {
  display: flex;
  gap: 1rem;
}

.action-button {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  padding: 0.8rem 1.2rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  min-width: 140px;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.button-icon {
  position: relative;
  width: 40px;
  height: 40px;
}

.button-icon .icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  filter: blur(8px);
  z-index: 1;
}

.button-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.button-title {
  font-weight: 700;
  font-size: 1rem;
}

.button-subtitle {
  font-size: 0.8rem;
  opacity: 0.8;
  font-weight: 400;
}

/* Boutons spécifiques */
.dashboard-btn {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%);
}

.analytics-btn {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%);
}

.test-btn {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%);
}

/* ============================================
   FILTRES
   ============================================ */
.header-filters {
  background: white;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
}

.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #475569;
  font-size: 0.95rem;
}

.filter-icon {
  font-size: 1.2rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.6rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #334155;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 180px;
}

.filter-select:hover {
  border-color: #94a3b8;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.export-button {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.export-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* ============================================
   RECHERCHE
   ============================================ */
.search-container {
  flex: 1;
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

/* ============================================
   CARTES STATISTIQUES
   ============================================ */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
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
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 18px 18px 0 0;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-icon.total {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1d4ed8;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #059669;
}

.stat-icon.average {
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  color: #7c3aed;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

/* ============================================
   LOADING
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
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
   TABLEAU DES COMMANDES
   ============================================ */
.orders-table {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.orders-table table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.orders-table thead {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
}

.orders-table th {
  padding: 1.2rem 1.5rem;
  text-align: left;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.orders-table th:first-child {
  width: 50px;
  text-align: center;
}

.orders-table th:last-child {
  width: 150px;
}

.orders-table th input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* ============================================
   LIGNES DE COMMANDES
   ============================================ */
.order-row {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.order-row:hover {
  background: #f8fafc;
  transform: scale(1.001);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.order-row.pending:hover {
  background: rgba(254, 243, 199, 0.1);
}

.order-row.confirmed:hover {
  background: rgba(219, 234, 254, 0.1);
}

.order-row.shipped:hover {
  background: rgba(240, 249, 255, 0.1);
}

.order-row.delivered:hover {
  background: rgba(220, 252, 231, 0.1);
}

.order-row.cancelled:hover {
  background: rgba(254, 226, 226, 0.1);
}

.orders-table td {
  padding: 1.2rem 1.5rem;
  vertical-align: middle;
}

.orders-table td:first-child {
  text-align: center;
}

.orders-table td input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

/* ============================================
   INFOS CLIENT
   ============================================ */
.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 1rem;
}

.customer-email {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 400;
}

/* ============================================
   DATE ET HEURE
   ============================================ */
.order-date {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-date > div {
  color: #475569;
  font-weight: 500;
}

.order-time {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* ============================================
   MONTANT
   ============================================ */
.amount-cell {
  font-size: 1.1rem;
  font-weight: 700;
  color: #059669;
}

/* ============================================
   BADGE STATUT
   ============================================ */
.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.status-badge.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border: 2px solid #fbbf24;
}

.status-badge.confirmed {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border: 2px solid #60a5fa;
}

.status-badge.processing {
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  color: #5b21b6;
  border: 2px solid #8b5cf6;
}

.status-badge.shipped {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  color: #0c4a6e;
  border: 2px solid #38bdf8;
}

.status-badge.delivered {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #065f46;
  border: 2px solid #10b981;
}

.status-badge.cancelled {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  border: 2px solid #f87171;
}

/* ============================================
   ACTIONS
   ============================================ */
.order-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  background: #f1f5f9;
  color: #475569;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.view:hover {
  background: #3b82f6;
  color: white;
}

.action-btn.edit:hover {
  background: #10b981;
  color: white;
}

.action-btn.print:hover {
  background: #f59e0b;
  color: white;
}

/* ============================================
   DONNÉES VIDE
   ============================================ */
.no-data {
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
}

.no-data h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem 0;
  color: #334155;
}

.no-data p {
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.retry-btn {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

/* ============================================
   ACTIONS GROUPÉES
   ============================================ */
.bulk-actions {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 1.2rem 1.5rem;
  border-top: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  bottom: 0;
  backdrop-filter: blur(10px);
}

.selected-count {
  font-weight: 600;
  color: #475569;
  font-size: 1rem;
}

.bulk-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.bulk-select {
  padding: 0.6rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #334155;
  font-weight: 500;
  cursor: pointer;
  min-width: 200px;
}

.bulk-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.apply-btn {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.apply-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================
   PAGINATION
   ============================================ */
.pagination {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.page-btn {
  padding: 0.7rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.page-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #64748b;
  font-size: 0.95rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

/* ============================================
   MODALS
   ============================================ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content.large {
  max-width: 900px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 24px 24px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #ef4444;
  color: white;
  transform: rotate(90deg);
}

/* ============================================
   DÉTAILS COMMANDE MODAL
   ============================================ */
.order-details-modal {
  padding: 2rem;
}

.detail-section {
  margin-bottom: 2.5rem;
}

.detail-section h3 {
  font-size: 1.3rem;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  font-weight: 700;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  font-size: 1rem;
  color: #334155;
  font-weight: 500;
}

/* ============================================
   CARTE CLIENT
   ============================================ */
.customer-card {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 18px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
}

.customer-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.customer-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.customer-header h4 {
  margin: 0 0 0.5rem 0;
  color: #0f172a;
  font-size: 1.2rem;
  font-weight: 700;
}

.customer-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.customer-contact p {
  margin: 0;
  color: #475569;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ============================================
   ARTICLES COMMANDÉS
   ============================================ */
.order-items table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.order-items th {
  padding: 1rem;
  text-align: left;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-items td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.order-items tbody tr:hover {
  background: #f8fafc;
}

.order-items tfoot {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.order-items tfoot td {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.1rem;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-img {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
}

.product-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.product-category {
  font-size: 0.85rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  display: inline-block;
}

/* ============================================
   ACTIONS MODAL
   ============================================ */
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
}

.modal-actions .action-btn {
  padding: 0.8rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
}

.modal-actions .primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.modal-actions .secondary {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #475569;
}

.modal-actions .action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* ============================================
   FORMULAIRE STATUT
   ============================================ */
.status-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: #475569;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-select,
.form-input,
textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
}

.form-select:focus,
.form-input:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

/* ============================================
   ACTIONS FORMULAIRE
   ============================================ */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  margin-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  padding: 0.8rem 2rem;
  background: #f1f5f9;
  color: #475569;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.btn-save {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1200px) {
  .admin-orders {
    padding: 1.5rem;
  }
}

@media (max-width: 992px) {
  .header-top {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-start;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .search-container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .admin-orders {
    padding: 1rem;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: 100%;
  }
  
  .bulk-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .bulk-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .modal-content.large {
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .action-btn {
    min-width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-button {
    min-width: 100%;
  }
  
  .page-btn {
    min-width: 100px;
    padding: 0.7rem 1rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}

/* ============================================
   ANIMATIONS SUPPLÉMENTAIRES
   ============================================ */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.float {
  animation: float 3s ease-in-out infinite;
}

/* ============================================
   PERSONNALISATION SCROLLBAR
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
   ICÔNES ANIMÉES
   ============================================ */
.icon-spin {
  animation: iconSpin 2s linear infinite;
}

@keyframes iconSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-bounce {
  animation: iconBounce 2s infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>