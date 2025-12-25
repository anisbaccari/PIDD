<template>
  <div class="admin-analytics">
    <!-- Header -->
    <div class="analytics-header">
      <button 
        @click="goToDashboard"
        class="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
      >
        <span class="text-xl">🏠</span>
        <span>Dashboard</span>
      </button>
      
      <button 
        @click="goToCommandes"
        class="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
      >
        <span>Gestion des commandes</span>
      </button>
      
      <h1>Tableau de bord Statistiques</h1>
      
      <div class="date-range">
        <button 
          v-for="range in dateRanges" 
          :key="range.id"
          @click="selectDateRange(range.id)"
          :class="['range-btn', { active: selectedRange === range.id }]"
        >
          {{ range.label }}
        </button>
        <input 
          type="date" 
          v-model="customStartDate" 
          @change="loadStats"
          class="date-input"
          :max="today"
        />
        <span>au</span>
        <input 
          type="date" 
          v-model="customEndDate" 
          @change="loadStats"
          class="date-input"
          :max="today"
          :min="customStartDate"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    </div>

    <!-- KPI Cards -->
    <div v-else class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-icon revenue">💰</div>
        </div>
        <div class="kpi-content">
          <h3>Chiffre d'affaires</h3>
          <p class="kpi-value">{{ formatPrice(stats.totalRevenue) }}</p>
          <p class="kpi-period">Période sélectionnée</p>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-icon orders">📦</div>
        </div>
        <div class="kpi-content">
          <h3>Commandes</h3>
          <p class="kpi-value">{{ stats.totalOrders }}</p>
          <p class="kpi-period">{{ stats.averageOrdersPerDay }} / jour</p>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-icon average">📊</div>
        </div>
        <div class="kpi-content">
          <h3>Panier moyen</h3>
          <p class="kpi-value">{{ formatPrice(stats.averageOrderValue) }}</p>
          <p class="kpi-period">Par commande</p>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-icon customers">👥</div>
        </div>
        <div class="kpi-content">
          <h3>Clients uniques</h3>
          <p class="kpi-value">{{ stats.newCustomers }}</p>
          <p class="kpi-period">Clients actifs</p>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Revenue Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Évolution du chiffre d'affaires</h3>
          <select v-model="revenueChartType" @change="updateRevenueChart" class="chart-select">
            <option value="line">Ligne</option>
            <option value="bar">Barres</option>
          </select>
        </div>
        <div class="chart-container">
          <canvas ref="revenueChart"></canvas>
        </div>
      </div>
      
      <!-- Top Products -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Top 5 produits</h3>
          <button @click="exportTopProducts" class="export-btn small">
            📤 Export
          </button>
        </div>
        <div class="top-products">
          <div v-if="topProducts.length === 0" class="no-data">
            Aucun produit vendu sur cette période
          </div>
          <div v-else v-for="(product, index) in topProducts" :key="product.id" class="product-rank">
            <div class="rank-number">{{ index + 1 }}</div>
            <img 
              v-if="product.image" 
              :src="getProductImage(product.image)" 
              :alt="product.name" 
              class="product-thumb"
              @error="handleImageError"
            >
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-stats">
                <span class="quantity">{{ product.quantity }} ventes</span>
                <span class="revenue">{{ formatPrice(product.revenue) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Categories Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Ventes par catégorie</h3>
          <select v-model="categoryChartType" @change="updateCategoryChart" class="chart-select">
            <option value="doughnut">Anneau</option>
            <option value="pie">Camembert</option>
          </select>
        </div>
        <div class="chart-container">
          <canvas ref="categoryChart"></canvas>
        </div>
      </div>
      
      <!-- Orders by Status -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Commandes par statut</h3>
        </div>
        <div class="status-stats">
          <div v-for="(count, status) in stats.ordersByStatus || {}" :key="status" class="status-item">
            <span class="status-badge" :class="status">
              {{ getStatusLabel(status) }}
            </span>
            <span class="status-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Stats -->
    <div class="detailed-stats">
      <div class="stats-tabs">
        <button 
          v-for="tab in statsTabs" 
          :key="tab.id"
          @click="selectTab(tab.id)"
          :class="['tab-btn', { active: activeTab === tab.id }]"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="stats-content">
        <!-- Customers Stats -->
        <div v-if="activeTab === 'customers'" class="tab-pane">
          <div class="customer-metrics">
            <div class="metric-card">
              <h4>Clients totaux</h4>
              <p class="metric-value">{{ customerStats.totalCustomers || 0 }}</p>
            </div>
            <div class="metric-card">
              <h4>Taux de rétention</h4>
              <p class="metric-value">{{ customerStats.retentionRate || 0 }}%</p>
            </div>
            <div class="metric-card">
              <h4>CLV moyen</h4>
              <p class="metric-value">{{ formatPrice(customerStats.clv || 0) }}</p>
            </div>
          </div>
          
          <div class="customer-segments">
            <h4>Segmentation clients</h4>
            <div class="segments-grid">
              <div class="segment-card">
                <div class="segment-icon vip">👑</div>
                <div class="segment-info">
                  <h5>Clients VIP</h5>
                  <p class="segment-count">{{ customerStats.vipCustomers || 0 }}</p>
                  <p class="segment-revenue">{{ formatPrice(customerStats.vipRevenue || 0) }}</p>
                </div>
              </div>
              <div class="segment-card">
                <div class="segment-icon regular">👍</div>
                <div class="segment-info">
                  <h5>Réguliers</h5>
                  <p class="segment-count">{{ customerStats.regularCustomers || 0 }}</p>
                  <p class="segment-revenue">{{ formatPrice(customerStats.regularRevenue || 0) }}</p>
                </div>
              </div>
              <div class="segment-card">
                <div class="segment-icon new">🌟</div>
                <div class="segment-info">
                  <h5>Nouveaux</h5>
                  <p class="segment-count">{{ customerStats.newCustomers || 0 }}</p>
                  <p class="segment-revenue">{{ formatPrice(customerStats.newRevenue || 0) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Products Stats -->
        <div v-else-if="activeTab === 'products'" class="tab-pane">
          <div class="products-table">
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Ventes</th>
                  <th>Chiffre d'affaires</th>
                  <th>Stock</th>
                  <th>Rotation</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="productStats.length === 0">
                  <td colspan="5" class="no-data">Aucune donnée disponible</td>
                </tr>
                <tr v-else v-for="product in productStats" :key="product.id">
                  <td>
                    <div class="product-cell">
                      <img 
                        v-if="product.image" 
                        :src="getProductImage(product.image)" 
                        :alt="product.name" 
                        class="product-img"
                        @error="handleImageError"
                      >
                      <div>
                        <strong>{{ product.name }}</strong>
                        <p class="product-sku">{{ product.sku }}</p>
                      </div>
                    </div>
                  </td>
                  <td>{{ product.sales }}</td>
                  <td>{{ formatPrice(product.revenue) }}</td>
                  <td>
                    <div class="stock-indicator">
                      <div class="stock-bar">
                        <div class="stock-fill" :style="{ width: Math.min(product.stockPercent || 0, 100) + '%' }"></div>
                      </div>
                      <span>{{ product.stock }}</span>
                    </div>
                  </td>
                  <td>{{ product.turnover }} jours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Sales Stats -->
        <div v-else class="tab-pane">
          <div class="sales-metrics">
            <h4>Répartition des commandes par statut</h4>
            <div class="status-grid">
              <div v-for="(count, status) in stats.ordersByStatus || {}" :key="status" class="status-card">
                <div class="status-badge-large" :class="status">
                  {{ getStatusLabel(status) }}
                </div>
                <div class="status-details">
                  <p class="status-count-large">{{ count }}</p>
                  <p class="status-percentage">
                    {{ getStatusPercentage(count) }}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Section -->
    <div class="export-section">
      <h3>Exporter les rapports</h3>
      <div class="export-options">
        <button @click="exportTopProducts" class="export-option">
          <span class="export-icon">📦</span>
          <span>Top produits</span>
        </button>
        <button @click="exportCustomerReport" class="export-option">
          <span class="export-icon">👥</span>
          <span>Rapport clients</span>
        </button>
        <button @click="exportProductReport" class="export-option">
          <span class="export-icon">📊</span>
          <span>Rapport produits</span>
        </button>
        <button @click="exportFullReport" class="export-option primary">
          <span class="export-icon">📈</span>
          <span>Rapport complet</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'AdminAnalytics',
  data() {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return {
      loading: false,
      selectedRange: 'month',
      customStartDate: lastMonth.toISOString().split('T')[0],
      customEndDate: today.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0],
      
      revenueChartType: 'line',
      categoryChartType: 'doughnut',
      
      activeTab: 'customers',
      
      dateRanges: [
        { id: 'day', label: 'Aujourd\'hui' },
        { id: 'week', label: '7 jours' },
        { id: 'month', label: '30 jours' },
        { id: 'quarter', label: '3 mois' }
      ],
      
      statsTabs: [
        { id: 'customers', label: 'Clients' },
        { id: 'products', label: 'Produits' },
        { id: 'sales', label: 'Ventes' }
      ],
      
      revenueChart: null,
      categoryChart: null,
      
      stats: {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        newCustomers: 0,
        averageOrdersPerDay: 0,
        ordersByStatus: {}
      },
      
      revenueEvolution: [],
      topProducts: [],
      categories: [],
      customerStats: {},
      productStats: []
    }
  },
  
  async mounted() {
    await this.loadStats();
  },
  
  beforeUnmount() {
    if (this.revenueChart) this.revenueChart.destroy();
    if (this.categoryChart) this.categoryChart.destroy();
  },
  
  methods: {
    selectDateRange(rangeId) {
      this.selectedRange = rangeId;
      const end = new Date();
      const start = new Date();
      
      switch (rangeId) {
        case 'day':
          // Aujourd'hui
          break;
        case 'week':
          start.setDate(start.getDate() - 7);
          break;
        case 'month':
          start.setMonth(start.getMonth() - 1);
          break;
        case 'quarter':
          start.setMonth(start.getMonth() - 3);
          break;
      }
      
      this.customStartDate = start.toISOString().split('T')[0];
      this.customEndDate = end.toISOString().split('T')[0];
      
      this.loadStats();
    },
    
    async loadStats() {
      this.loading = true;
      try {
        const params = {
          startDate: this.customStartDate,
          endDate: this.customEndDate
        };
        
        console.log('📊 Chargement des stats avec params:', params);
        
        // Charger toutes les stats en parallèle
        const [general, revenue, topProds, cats] = await Promise.all([
          axios.get('/admin/stats/general', { 
            params, 
            headers: this.getAuthHeaders() 
          }).catch(err => {
            console.error('Erreur stats générales:', err);
            return { data: { success: false } };
          }),
          
          axios.get('/admin/stats/revenue-evolution', { 
            params: { ...params, groupBy: 'day' }, 
            headers: this.getAuthHeaders() 
          }).catch(err => {
            console.error('Erreur évolution revenu:', err);
            return { data: { success: false, data: [] } };
          }),
          
          axios.get('/admin/stats/top-products', { 
            params: { ...params, limit: 5 }, 
            headers: this.getAuthHeaders() 
          }).catch(err => {
            console.error('Erreur top produits:', err);
            return { data: { success: false, products: [] } };
          }),
          
          axios.get('/admin/stats/categories', { 
            params, 
            headers: this.getAuthHeaders() 
          }).catch(err => {
            console.error('Erreur catégories:', err);
            return { data: { success: false, categories: [] } };
          })
        ]);
        
        if (general.data.success) {
          this.stats = general.data.stats;
        } else {
          this.stats = {
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            newCustomers: 0,
            averageOrdersPerDay: 0,
            ordersByStatus: {}
          };
        }
        
        if (revenue.data.success) {
          this.revenueEvolution = revenue.data.data || [];
          this.createRevenueChart();
        } else {
          this.revenueEvolution = [];
        }
        
        if (topProds.data.success) {
          this.topProducts = topProds.data.products || [];
        } else {
          this.topProducts = [];
        }
        
        if (cats.data.success) {
          this.categories = cats.data.categories || [];
          this.createCategoryChart();
        } else {
          this.categories = [];
        }
        
        console.log('✅ Statistiques chargées:', this.stats);
        
      } catch (error) {
        console.error('❌ Erreur chargement stats:', error);
        this.showNotification('Erreur lors du chargement des statistiques', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async selectTab(tabId) {
      this.activeTab = tabId;
      
      const params = {
        startDate: this.customStartDate,
        endDate: this.customEndDate
      };
      
      try {
        if (tabId === 'customers') {
          const response = await axios.get('/admin/stats/customers', { 
            params, 
            headers: this.getAuthHeaders() 
          });
          if (response.data.success) {
            this.customerStats = response.data.customerStats || {};
          }
        } else if (tabId === 'products') {
          const response = await axios.get('/admin/stats/products', { 
            params, 
            headers: this.getAuthHeaders() 
          });
          if (response.data.success) {
            this.productStats = response.data.products || [];
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement onglet:', error);
        if (tabId === 'customers') {
          this.customerStats = {};
        } else if (tabId === 'products') {
          this.productStats = [];
        }
      }
    },
    
    createRevenueChart() {
      if (this.revenueChart) {
        this.revenueChart.destroy();
      }
      
      const ctx = this.$refs.revenueChart?.getContext('2d');
      if (!ctx || this.revenueEvolution.length === 0) {
        return;
      }
      
      const labels = this.revenueEvolution.map(item => {
        try {
          const date = new Date(item.period);
          return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        } catch {
          return item.period;
        }
      });
      
      const data = this.revenueEvolution.map(item => item.revenue || 0);
      
      this.revenueChart = new Chart(ctx, {
        type: this.revenueChartType,
        data: {
          labels,
          datasets: [{
            label: 'Chiffre d\'affaires (€)',
            data,
            borderColor: '#3b82f6',
            backgroundColor: this.revenueChartType === 'line' ? 'rgba(59, 130, 246, 0.1)' : '#3b82f6',
            fill: this.revenueChartType === 'line',
            tension: 0.4,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              display: false 
            },
            tooltip: {
              callbacks: {
                label: (context) => `CA: ${this.formatPrice(context.raw)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => `${value.toLocaleString('fr-FR')}€`
              }
            }
          }
        }
      });
    },
    
    createCategoryChart() {
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }
      
      const ctx = this.$refs.categoryChart?.getContext('2d');
      if (!ctx || this.categories.length === 0) return;
      
      const labels = this.categories.map(cat => cat.category || 'Sans catégorie');
      const data = this.categories.map(cat => cat.revenue || 0);
      
      this.categoryChart = new Chart(ctx, {
        type: this.categoryChartType,
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: [
              '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
              '#06b6d4', '#84cc16', '#f97316', '#8b5cf6', '#ec4899'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: ${this.formatPrice(context.raw)}`
              }
            }
          }
        }
      });
    },
    
    updateRevenueChart() {
      this.createRevenueChart();
    },
    
    updateCategoryChart() {
      this.createCategoryChart();
    },
    
    getStatusPercentage(count) {
      if (!this.stats.ordersByStatus) return '0.0';
      const total = Object.values(this.stats.ordersByStatus).reduce((sum, c) => sum + c, 0);
      return total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    },
    
    getProductImage(img) {
      if (!img) {
        return '/placeholder-product.png';
      }
      
      if (img.startsWith('http')) {
        return img;
      }
      
      if (img.includes('/')) {
        return img;
      }
      
      return `/uploads/products/${img}`;
    },
    
    handleImageError(event) {
      event.target.src = '/placeholder-product.png';
    },
    
    goToDashboard() {
      this.$router.push('/admin/dashboard');
    },
    
    goToCommandes() {
      this.$router.push('/admin/orders');
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price || 0);
    },
    
    getStatusLabel(status) {
      const labels = {
        pending: 'En attente',
        confirmed: 'Confirmée',
        processing: 'En traitement',
        shipped: 'Expédiée',
        delivered: 'Livrée',
        cancelled: 'Annulée',
        completed: 'Terminée'
      };
      return labels[status] || status;
    },
    
    exportTopProducts() {
      if (this.topProducts.length === 0) {
        this.showNotification('Aucun produit à exporter', 'warning');
        return;
      }
      
      const csv = this.convertToCSV(this.topProducts.map(p => ({
        'Nom': p.name,
        'Quantité vendue': p.quantity,
        'Chiffre d\'affaires': p.revenue,
        'Prix unitaire': p.price
      })));
      
      this.downloadCSV(csv, `top_produits_${this.customStartDate}_${this.customEndDate}.csv`);
      this.showNotification('Top produits exporté avec succès', 'success');
    },
    
    exportCustomerReport() {
      const data = [
        { 
          'Segment': 'Clients VIP', 
          'Nombre': this.customerStats.vipCustomers || 0, 
          'Revenue': this.customerStats.vipRevenue || 0 
        },
        { 
          'Segment': 'Clients réguliers', 
          'Nombre': this.customerStats.regularCustomers || 0, 
          'Revenue': this.customerStats.regularRevenue || 0 
        },
        { 
          'Segment': 'Nouveaux clients', 
          'Nombre': this.customerStats.newCustomers || 0, 
          'Revenue': this.customerStats.newRevenue || 0 
        }
      ];
      
      const csv = this.convertToCSV(data);
      this.downloadCSV(csv, `rapport_clients_${this.customStartDate}_${this.customEndDate}.csv`);
      this.showNotification('Rapport clients exporté avec succès', 'success');
    },
    
    exportProductReport() {
      if (this.productStats.length === 0) {
        this.showNotification('Aucune donnée produit à exporter', 'warning');
        return;
      }
      
      const csv = this.convertToCSV(this.productStats.map(p => ({
        'Nom': p.name,
        'Ventes': p.sales,
        'Revenue': p.revenue,
        'Stock': p.stock,
        'Pourcentage stock': p.stockPercent + '%',
        'Rotation (jours)': p.turnover
      })));
      
      this.downloadCSV(csv, `rapport_produits_${this.customStartDate}_${this.customEndDate}.csv`);
      this.showNotification('Rapport produits exporté avec succès', 'success');
    },
    
    exportFullReport() {
      const report = {
        periode: `${this.customStartDate} au ${this.customEndDate}`,
        stats: this.stats,
        topProducts: this.topProducts,
        categories: this.categories,
        customerStats: this.customerStats,
        productStats: this.productStats,
        generatedAt: new Date().toISOString()
      };
      
      const json = JSON.stringify(report, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_complet_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      this.showNotification('Rapport complet exporté avec succès', 'success');
    },
    
    convertToCSV(data) {
      if (!data || data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(h => {
        const value = item[h];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }));
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    },
    
    downloadCSV(csv, filename) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    
    getAuthHeaders() {
      const token = localStorage.getItem('authToken') || 
                    (this.$store && this.$store.state.auth?.token);
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    },
    
    showNotification(message, type = 'info') {
      // Utilisez votre propre système de notifications
      const types = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };
      
      const icon = types[type] || types.info;
      alert(`${icon} ${message}`);
    }
  }
}
</script>

<style scoped>
.admin-analytics {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.analytics-header {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.analytics-header h1 {
  margin: 0;
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 600;
}

.date-range {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.range-btn {
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.range-btn:hover {
  background: #f1f5f9;
}

.range-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.kpi-header {
  margin-bottom: 1rem;
}

.kpi-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.kpi-icon.revenue {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #10b981;
}

.kpi-icon.orders {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #3b82f6;
}

.kpi-icon.average {
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  color: #8b5cf6;
}

.kpi-icon.customers {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  color: #db2777;
}

.kpi-content h3 {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.kpi-period {
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 0.25rem 0 0 0;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}

.chart-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #4b5563;
  font-size: 0.9rem;
  cursor: pointer;
}

.export-btn.small {
  padding: 0.25rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: #4b5563;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn.small:hover {
  background: #f1f5f9;
}

.chart-container {
  height: 250px;
  position: relative;
}

/* Top Products */
.top-products {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-rank {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.product-rank:hover {
  background: #f1f5f9;
}

.rank-number {
  width: 30px;
  height: 30px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.product-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
}

.product-stats .quantity {
  color: #6b7280;
}

.product-stats .revenue {
  color: #10b981;
  font-weight: 500;
}

/* Status Stats */
.status-stats {
  display: grid;
  gap: 1rem;
  padding: 1rem 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.confirmed {
  background: #dbeafe;
  color: #3b82f6;
}

.status-badge.processing {
  background: #f5f3ff;
  color: #8b5cf6;
}

.status-badge.shipped {
  background: #f0f9ff;
  color: #0ea5e9;
}

.status-badge.delivered {
  background: #dcfce7;
  color: #10b981;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #ef4444;
}

.status-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* No Data */
.no-data {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-style: italic;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
}

/* Detailed Stats */
.detailed-stats {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
}

.stats-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #374151;
  background: #f8fafc;
}

.tab-btn.active {
  color: #3b82f6;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
}

.stats-content {
  padding: 1.5rem;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Customer Metrics */
.customer-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.metric-card h4 {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Customer Segments */
.customer-segments h4 {
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
  font-size: 1.1rem;
}

.segments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.segment-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.segment-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.segment-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.segment-icon.vip {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
}

.segment-icon.regular {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #3b82f6;
}

.segment-icon.new {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  color: #db2777;
}

.segment-info h5 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 0.9rem;
  font-weight: 600;
}

.segment-count,
.segment-revenue {
  margin: 0;
  font-size: 0.85rem;
}

.segment-count {
  color: #6b7280;
}

.segment-revenue {
  color: #10b981;
  font-weight: 500;
}

/* Products Table */
.products-table {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.products-table table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.products-table th,
.products-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.products-table th {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f8fafc;
  white-space: nowrap;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-img {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f3f4f6;
}

.product-sku {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.stock-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stock-bar {
  width: 80px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

.stock-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Status Grid for Sales Tab */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.status-badge-large {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  margin-bottom: 1rem;
  display: inline-block;
}

.status-badge-large.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge-large.confirmed {
  background: #dbeafe;
  color: #3b82f6;
}

.status-badge-large.processing {
  background: #f5f3ff;
  color: #8b5cf6;
}

.status-badge-large.shipped {
  background: #f0f9ff;
  color: #0ea5e9;
}

.status-badge-large.delivered {
  background: #dcfce7;
  color: #10b981;
}

.status-badge-large.cancelled {
  background: #fee2e2;
  color: #ef4444;
}

.status-count-large {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0.5rem 0;
}

.status-percentage {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Export Section */
.export-section {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.export-section h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.2rem;
  font-weight: 600;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.export-option {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.export-option:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.export-option.primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-color: transparent;
}

.export-option.primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border-color: transparent;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
}

.export-icon {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-analytics {
    padding: 1rem;
  }
  
  .analytics-header {
    padding: 1rem;
  }
  
  .date-range {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .date-range span {
    text-align: center;
  }
  
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card {
    min-width: unset;
  }
  
  .customer-metrics {
    grid-template-columns: 1fr;
  }
  
  .segments-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-tabs {
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .export-options {
    grid-template-columns: 1fr;
  }
}
</style>