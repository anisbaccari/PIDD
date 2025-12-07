<template>
  <div class="admin-orders">
    <!-- Header -->
 <div class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
  <button 
  @click="goToDashboard"
  class="group flex items-center gap-4 px-8 py-4 
         bg-gradient-to-r from-blue-600 to-blue-700 
         text-white text-lg font-semibold 
         rounded-2xl shadow-xl 
         hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 
         active:from-blue-800 active:to-blue-900 
         transition-all duration-300 ease-in-out 
         transform hover:-translate-y-1 active:translate-y-0
         border border-blue-400/30"
>
  <span class="text-2xl">🏠</span>
  <span class="tracking-wide">Dashboard</span>
</button>
<button 
  @click="goToAnalytics"
  class="group flex items-center gap-4 px-8 py-4 
         bg-gradient-to-r from-blue-600 to-blue-700 
         text-white text-lg font-semibold 
         rounded-2xl shadow-xl 
         hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 
         active:from-blue-800 active:to-blue-900 
         transition-all duration-300 ease-in-out 
         transform hover:-translate-y-1 active:translate-y-0
         border border-blue-400/30"
>
  
  <span class="tracking-wide"><A>Analytics</A></span>
</button>
    <div class="h-8 w-px bg-slate-200"></div>
       <h1 class="text-2xl font-bold text-slate-800">Gestion des Commandes</h1>
            </div>
            
          </div>
        </div>
      <div class="header-filters">
        <div class="filter-group">
          <label>Statut :</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="">Toutes</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="processing">En traitement</option>
            <option value="shipped">Expédiées</option>
            <option value="delivered">Livrées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Période :</label>
          <select v-model="periodFilter" class="filter-select">
            <option value="all">Toutes périodes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
          </select>
        </div>
        
        <button @click="exportOrders" class="export-btn">
          📤 Exporter CSV
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon total">📦</div>
        <div class="stat-content">
          <h3>Commandes totales</h3>
          <p class="stat-number">{{ totalOrders }}</p>
          
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pending">⏳</div>
        <div class="stat-content">
          <h3>En attente</h3>
          <p class="stat-number">{{ pendingOrders }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon revenue">💰</div>
        <div class="stat-content">
          <h3>Chiffre d'affaires</h3>
          <p class="stat-number">{{ formatPrice(totalRevenue) }}</p>
         
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon average">📊</div>
        <div class="stat-content">
          <h3>Panier moyen</h3>
          <p class="stat-number">{{ formatPrice(averageOrderValue) }}</p>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="orders-table">
      <div class="table-header">
        <div class="table-filters">
          <input 
            v-model="searchQuery" 
            placeholder="Rechercher une commande, client..."
            class="search-input"
          />
          <button @click="showFilters = !showFilters" class="filter-toggle">
            🔍 Plus de filtres
          </button>
        </div>
        
        <div v-if="showFilters" class="advanced-filters">
          <div class="filter-row">
            <div class="filter-item">
              <label>Montant min :</label>
              <input v-model="minAmount" type="number" class="filter-input" placeholder="0">
            </div>
            <div class="filter-item">
              <label>Montant max :</label>
              <input v-model="maxAmount" type="number" class="filter-input" placeholder="1000">
            </div>
            <div class="filter-item">
              <label>Client :</label>
              <input v-model="customerFilter" class="filter-input" placeholder="Email ou nom">
            </div>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th><input type="checkbox" @change="toggleSelectAll"></th>
            <th>N° Commande</th>
            <th>Client</th>
            <th>Date</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Livraison</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" :class="['order-row', order.status]">
            <td><input type="checkbox" :value="order.id" v-model="selectedOrders"></td>
            <td>
              <strong>{{ order.orderNumber }}</strong>
              <div class="order-id">ID: {{ order.id }}</div>
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name">{{ order.customer.name }}</div>
                <div class="customer-email">{{ order.customer.email }}</div>
                <div class="customer-phone">{{ order.customer.phone }}</div>
              </div>
            </td>
            <td>
              <div class="order-date">
                <div>{{ formatDate(order.date) }}</div>
                <div class="order-time">{{ order.time }}</div>
              </div>
            </td>
            <td class="amount-cell">
              <strong>{{ formatPrice(order.amount) }}</strong>
            </td>
            <td>
              <span class="status-badge" :class="order.status">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td>
              <div class="delivery-info">
                <div>{{ order.delivery.method }}</div>
                <div class="tracking-number" v-if="order.trackingNumber">
                  <span>Suivi: {{ order.trackingNumber }}</span>
                  <button @click="copyTracking(order.trackingNumber)" class="copy-btn">
                    📋
                  </button>
                </div>
              </div>
            </td>
            <td>
              <div class="order-actions">
                <button @click="viewOrderDetails(order)" class="action-btn view" title="Voir détails">
                  👁️
                </button>
                <button @click="updateOrderStatus(order)" class="action-btn edit" title="Modifier statut">
                  ✏️
                </button>
                <button @click="printInvoice(order)" class="action-btn print" title="Imprimer facture">
                  🖨️
                </button>
                <button @click="showShippingModal(order)" class="action-btn ship" title="Gérer livraison">
                  🚚
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
            <option value="mark_confirmed">Marquer comme confirmées</option>
            <option value="mark_processing">Marquer en traitement</option>
            <option value="mark_shipped">Marquer comme expédiées</option>
            <option value="export">Exporter sélection</option>
            <option value="cancel">Annuler commandes</option>
          </select>
          <button @click="applyBulkAction" class="apply-btn">Appliquer</button>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
          ← Précédent
        </button>
        <span class="page-info">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">
          Suivant →
        </button>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h2>Détails de la commande #{{ selectedOrder.orderNumber }}</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <div class="order-details-modal">
          <!-- Order Info -->
          <div class="detail-section">
            <h3>Informations commande</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Date :</label>
                <span>{{ formatDate(selectedOrder.date) }} à {{ selectedOrder.time }}</span>
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
                    {{ selectedOrder.customer.name.split(' ').map(n => n[0]).join('') }}
                  </div>
                  <div>
                    <h4>{{ selectedOrder.customer.name }}</h4>
                    <p>{{ selectedOrder.customer.email }}</p>
                  </div>
                </div>
                <div class="customer-contact">
                  <p>📱 {{ selectedOrder.customer.phone }}</p>
                  <p>📍 {{ selectedOrder.delivery.address }}</p>
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
                        <div class="product-name">{{ item.name }}</div>
                        <div class="product-sku">SKU: {{ item.sku }}</div>
                      </div>
                    </td>
                    <td>{{ formatPrice(item.price) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td><strong>{{ formatPrice(item.price * item.quantity) }}</strong></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3">Sous-total</td>
                    <td>{{ formatPrice(selectedOrder.subtotal) }}</td>
                  </tr>
                  <tr>
                    <td colspan="3">Livraison</td>
                    <td>{{ formatPrice(selectedOrder.shipping) }}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3"><strong>Total</strong></td>
                    <td><strong>{{ formatPrice(selectedOrder.amount) }}</strong></td>
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
            <button @click="updateOrderStatus(selectedOrder)" class="action-btn secondary">
              ✏️ Modifier statut
            </button>
            <button @click="sendEmail(selectedOrder)" class="action-btn secondary">
              📧 Envoyer confirmation
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
              <option value="confirmed">Confirmée</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Commentaire (optionnel) :</label>
            <textarea v-model="statusComment" placeholder="Ajouter un commentaire..." rows="3"></textarea>
          </div>
          
          <div class="form-actions">
            <button @click="closeStatusModal" class="btn-cancel">Annuler</button>
            <button @click="saveStatusUpdate" class="btn-save">Enregistrer</button>
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
      minAmount: null,
      maxAmount: null,
      customerFilter: '',
      showFilters: false,
      selectedOrders: [],
      currentPage: 1,
      itemsPerPage: 10,
      selectedOrder: null,
      showStatusModal: false,
      orderToUpdate: null,
      newStatus: '',
      statusComment: '',
      bulkAction: ''
    }
  },
  computed: {
    filteredOrders() {
      let filtered = this.orders;
      
      // Filtre par statut
      if (this.statusFilter) {
        filtered = filtered.filter(order => order.status === this.statusFilter);
      }
      
      // Filtre par période
      if (this.periodFilter !== 'all') {
        const now = new Date();
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.date);
          switch (this.periodFilter) {
            case 'today':
              return orderDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now.setDate(now.getDate() - 7));
              return orderDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
              return orderDate >= monthAgo;
            case 'quarter':
              const quarterAgo = new Date(now.setMonth(now.getMonth() - 3));
              return orderDate >= quarterAgo;
          }
          return true;
        });
      }
      
      // Filtre par montant
      if (this.minAmount) {
        filtered = filtered.filter(order => order.amount >= this.minAmount);
      }
      if (this.maxAmount) {
        filtered = filtered.filter(order => order.amount <= this.maxAmount);
      }
      
      // Filtre par client
      if (this.customerFilter) {
        const query = this.customerFilter.toLowerCase();
        filtered = filtered.filter(order => 
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.email.toLowerCase().includes(query) ||
          order.customer.phone.includes(query)
        );
      }
      
      // Recherche générale
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(order => 
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.email.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    },
    
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredOrders.slice(start, start + this.itemsPerPage);
    },
    
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    },
    
    totalOrders() {
      return this.orders.length;
    },
    
    pendingOrders() {
      return this.orders.filter(o => o.status === 'pending').length;
    },
    
    totalRevenue() {
      return this.orders.reduce((sum, order) => sum + order.amount, 0);
    },
    
    averageOrderValue() {
      return this.orders.length > 0 ? this.totalRevenue / this.orders.length : 0;
    }
  },

  async mounted() {
    await this.loadOrders();
  },
  methods: {
     async loadOrders() {
      this.loading = true;
      try {
        const response = await axios.get('/api/orders/admin/orders', {
          params: {
            status: this.statusFilter,
            page: this.currentPage,
            limit: this.itemsPerPage
          },
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`
          }
        });

        this.orders = response.data.orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          date: order.createdAt,
          time: new Date(order.createdAt).toLocaleTimeString('fr-FR'),
          customer: {
            name: `${order.user.firstName} ${order.user.lastName}`,
            email: order.user.email,
            phone: order.user.phone || ''
          },
          amount: parseFloat(order.totalPrice),
          status: order.status,
          payment: {
            method: order.paymentMethod,
            transactionId: `TRX-${order.id}`
          },
          delivery: {
            method: order.shippingMethod,
            address: order.shippingAddress,
            trackingNumber: order.trackingNumber
          },
          items: order.items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            sku: item.product.sku,
            price: parseFloat(item.unitPrice),
            quantity: item.quantity
          }))
        }));
        
        this.totalOrders = response.data.total;
        
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
      } finally {
        this.loading = false;
      }
    },
        async updateOrderStatus(order) {
      try {
        const response = await axios.put(
          `/api/orders/admin/orders/${order.id}/status`,
          {
            status: this.newStatus,
            notes: this.statusComment
          },
          {
            headers: {
              Authorization: `Bearer ${this.$store.state.user.token}`
            }
          }
        );

        if (response.data.success) {
          // Mettre à jour localement
          const index = this.orders.findIndex(o => o.id === order.id);
          if (index !== -1) {
            this.orders[index].status = this.newStatus;
            this.orders[index].delivery.trackingNumber = response.data.order.trackingNumber;
          }
          
          this.showNotification('Statut mis à jour', 'success');
          this.closeStatusModal();
        }
        
      } catch (error) {
        console.error('Erreur mise à jour:', error);
        this.showNotification('Erreur lors de la mise à jour', 'error');
      }
    },
    
    async exportOrders() {
      try {
        const response = await axios.get('/api/orders/admin/export', {
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`
          },
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `commandes_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        
      } catch (error) {
        console.error('Erreur export:', error);
      }
    },


    goToDashboard() {
      this.$router.push('/admin/products');
    },
    goToAnalytics() {
      this.$router.push('/admin/analytics');
    },
  
    getSampleOrders() {
      return [
        {
          id: 'ORD-001',
          orderNumber: 'CMD-2024-001',
          date: '2024-01-15',
          time: '14:30',
          customer: {
            name: 'Jean Dupont',
            email: 'jean.dupont@email.com',
            phone: '0612345678'
          },
          amount: 149.99,
          subtotal: 145.00,
          shipping: 4.99,
          status: 'confirmed',
          payment: {
            method: 'Carte bancaire',
            transactionId: 'TRX-001'
          },
          delivery: {
            method: 'Livraison standard',
            address: '123 Rue de Paris, 75001 Paris',
            trackingNumber: 'COL123456789FR'
          },
          items: [
            { id: 1, name: 'T-shirt Noir Classique', sku: 'TSHIRT-BLK', price: 29.99, quantity: 2 },
            { id: 2, name: 'Casquette Sport', sku: 'CAP-SPORT', price: 19.99, quantity: 1 },
            { id: 3, name: 'Chaussettes Premium', sku: 'SOCKS-PRM', price: 14.99, quantity: 3 }
          ]
        },
        {
          id: 'ORD-002',
          orderNumber: 'CMD-2024-002',
          date: '2024-01-14',
          time: '09:15',
          customer: {
            name: 'Marie Martin',
            email: 'marie.martin@email.com',
            phone: '0698765432'
          },
          amount: 89.50,
          subtotal: 84.50,
          shipping: 5.00,
          status: 'shipped',
          payment: {
            method: 'PayPal',
            transactionId: 'TRX-002'
          },
          delivery: {
            method: 'Livraison express',
            address: '456 Avenue des Champs, 69002 Lyon',
            trackingNumber: 'CHR987654321FR'
          },
          items: [
            { id: 4, name: 'Pull en Laine', sku: 'SWEATER-WL', price: 49.99, quantity: 1 },
            { id: 5, name: 'Écharpe Hiver', sku: 'SCARF-WIN', price: 34.99, quantity: 1 }
          ]
        },
        // Ajoutez plus de commandes de test...
      ];
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
    
    toggleSelectAll() {
      if (this.selectedOrders.length === this.filteredOrders.length) {
        this.selectedOrders = [];
      } else {
        this.selectedOrders = this.filteredOrders.map(order => order.id);
      }
    },
    
    viewOrderDetails(order) {
      this.selectedOrder = order;
    },
    
    updateOrderStatus(order) {
      this.orderToUpdate = order;
      this.newStatus = order.status;
      this.showStatusModal = true;
    },
    
    saveStatusUpdate() {
      if (this.orderToUpdate) {
        this.orderToUpdate.status = this.newStatus;
        if (this.statusComment) {
          console.log('Commentaire:', this.statusComment);
        }
        this.showNotification('Statut mis à jour', 'success');
      }
      this.closeStatusModal();
    },
    
    printInvoice(order) {
      console.log('Impression facture:', order.orderNumber);
      window.print();
    },
    
    copyTracking(trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      this.showNotification('Numéro copié', 'success');
    },
    
    sendEmail(order) {
      console.log('Envoi email à:', order.customer.email);
      this.showNotification('Email envoyé', 'success');
    },
    
    exportOrders() {
      const csv = this.convertToCSV(this.orders);
      this.downloadCSV(csv, 'commandes.csv');
    },
    
    convertToCSV(data) {
      const headers = ['Numéro', 'Client', 'Date', 'Montant', 'Statut', 'Livraison'];
      const rows = data.map(order => [
        order.orderNumber,
        order.customer.name,
        order.date,
        order.amount,
        this.getStatusLabel(order.status),
        order.delivery.method
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    },
    
    downloadCSV(csv, filename) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    },
    
    applyBulkAction() {
      if (!this.bulkAction) return;
      
      switch (this.bulkAction) {
        case 'mark_confirmed':
          this.orders.forEach(order => {
            if (this.selectedOrders.includes(order.id)) {
              order.status = 'confirmed';
            }
          });
          break;
        case 'mark_processing':
          this.orders.forEach(order => {
            if (this.selectedOrders.includes(order.id)) {
              order.status = 'processing';
            }
          });
          break;
        case 'mark_shipped':
          this.orders.forEach(order => {
            if (this.selectedOrders.includes(order.id)) {
              order.status = 'shipped';
            }
          });
          break;
        case 'export':
          const selectedData = this.orders.filter(order => 
            this.selectedOrders.includes(order.id)
          );
          const csv = this.convertToCSV(selectedData);
          this.downloadCSV(csv, 'commandes_selection.csv');
          break;
        case 'cancel':
          if (confirm(`Annuler ${this.selectedOrders.length} commande(s) ?`)) {
            this.orders.forEach(order => {
              if (this.selectedOrders.includes(order.id)) {
                order.status = 'cancelled';
              }
            });
          }
          break;
      }
      
      this.selectedOrders = [];
      this.bulkAction = '';
      this.showNotification('Action appliquée', 'success');
    },
    
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    
    closeModal() {
      this.selectedOrder = null;
    },
    
    closeStatusModal() {
      this.showStatusModal = false;
      this.orderToUpdate = null;
      this.newStatus = '';
      this.statusComment = '';
    },
    
    showNotification(message, type) {
      // Implémentez votre système de notification
      alert(message);
    }
  }
}
</script>

<style scoped>
.admin-orders {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.admin-header {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.admin-header h1 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.8rem;
}

.header-filters {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #4b5563;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  min-width: 150px;
}

.export-btn {
  margin-left: auto;
  padding: 0.5rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.export-btn:hover {
  background: #2563eb;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid #e5e7eb;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.stat-icon.total {
  background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
  color: #3b82f6;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
  color: #d97706;
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #10b981;
}

.stat-icon.average {
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  color: #8b5cf6;
}

.stat-content h3 {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.stat-change {
  font-size: 0.8rem;
  color: #10b981;
  margin: 0;
  font-weight: 500;
}

/* Table */
.orders-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.table-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
}

.filter-toggle {
  padding: 0.75rem 1.5rem;
  background: #f8fafc;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-toggle:hover {
  background: #f1f5f9;
}

.advanced-filters {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.filter-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-item label {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8fafc;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-row:hover {
  background: #f9fafb;
}

.order-row.pending {
  background: #fffbeb;
}

.order-id {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-name {
  font-weight: 500;
  color: #1f2937;
}

.customer-email,
.customer-phone {
  font-size: 0.85rem;
  color: #6b7280;
}

.order-date {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-time {
  font-size: 0.85rem;
  color: #6b7280;
}

.amount-cell {
  font-weight: 600;
  color: #1f2937;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.processing {
  background: #f0f9ff;
  color: #3b82f6;
}

.status-badge.shipped {
  background: #dcfce7;
  color: #166534;
}

.status-badge.delivered {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.delivery-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tracking-number {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.copy-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  border-radius: 4px;
}

.copy-btn:hover {
  background: #f3f4f6;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn.view {
  background: #f0f9ff;
  color: #3b82f6;
}

.action-btn.view:hover {
  background: #dbeafe;
}

.action-btn.edit {
  background: #fef3c7;
  color: #d97706;
}

.action-btn.edit:hover {
  background: #fde68a;
}

.action-btn.print {
  background: #f5f3ff;
  color: #8b5cf6;
}

.action-btn.print:hover {
  background: #ede9fe;
}

.action-btn.ship {
  background: #dcfce7;
  color: #166534;
}

.action-btn.ship:hover {
  background: #bbf7d0;
}

/* Bulk Actions */
.bulk-actions {
  padding: 1rem 1.5rem;
  background: #f0f9ff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  color: #3b82f6;
  font-weight: 500;
}

.bulk-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.bulk-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  min-width: 200px;
}

.apply-btn {
  padding: 0.5rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.apply-btn:hover {
  background: #2563eb;
}

/* Pagination */
.pagination {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #4b5563;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #d1d5db;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-weight: 500;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.close-btn:hover {
  color: #374151;
}

.order-details-modal {
  padding: 2rem;
}

.detail-section {
  margin-bottom: 2.5rem;
}

.detail-section h3 {
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.customer-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.customer-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.customer-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
}

.customer-header h4 {
  margin: 0;
  color: #1f2937;
}

.customer-header p {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.customer-contact p {
  margin: 0.5rem 0;
  color: #4b5563;
}

.order-items table {
  width: 100%;
  border-collapse: collapse;
}

.order-items th,
.order-items td {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
}

.order-items th {
  background: #f8fafc;
  font-weight: 600;
  color: #4b5563;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 500;
  color: #1f2937;
}

.product-sku {
  font-size: 0.8rem;
  color: #6b7280;
}

.total-row {
  background: #f8fafc;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.action-btn.primary {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  padding: 0.75rem 1.5rem;
  background: #f8fafc;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.action-btn.secondary:hover {
  background: #f1f5f9;
}

/* Status Form */
.status-form {
  padding: 2rem;
}

.status-form .form-group {
  margin-bottom: 1.5rem;
}

.status-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.status-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #4b5563;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-save:hover {
  background: #059669;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-orders {
    padding: 1rem;
  }
  
  .header-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .table-filters {
    flex-direction: column;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .bulk-actions {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .bulk-buttons {
    width: 100%;
  }
  
  .bulk-select {
    flex: 1;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>