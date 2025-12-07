<template>
  <div class="admin-analytics">
    <!-- Header -->
    <div class="analytics-header">
        <button 
    @click="goToDashboard"
    class="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0 border border-blue-400/20"
  >
    <span class="text-xl">🏠</span>
    <span>
      Dashboard
    </span>
  </button>
   <button 
    @click="goToCommandes"
    class="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0 border border-blue-400/20"
  >
    
    <span>
      Gestion des commandes
    </span>
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
          class="date-input"
          :max="today"
        />
        <span>au</span>
        <input 
          type="date" 
          v-model="customEndDate" 
          class="date-input"
          :max="today"
          :min="customStartDate"
        />
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-icon revenue">💰</div>
          <div class="kpi-trend positive">+12%</div>
        </div>
        <div class="kpi-content">
          <h3>Chiffre d'affaires</h3>
          <p class="kpi-value">{{ formatPrice(totalRevenue) }}</p>
          <p class="kpi-period">vs période précédente</p>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-icon orders">📦</div>
          <div class="kpi-trend positive">+8%</div>
        </div>
        <div class="kpi-content">
          <h3>Commandes</h3>
          <p class="kpi-value">{{ totalOrders }}</p>
          <p class="kpi-period">{{ averageOrdersPerDay }} / jour</p>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-icon average">📊</div>
          <div class="kpi-trend positive">+5%</div>
        </div>
        <div class="kpi-content">
          <h3>Panier moyen</h3>
          <p class="kpi-value">{{ formatPrice(averageOrderValue) }}</p>
          <p class="kpi-period">Par commande</p>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-icon customers">👥</div>
          <div class="kpi-trend positive">+15%</div>
        </div>
        <div class="kpi-content">
          <h3>Nouveaux clients</h3>
          <p class="kpi-value">{{ newCustomers }}</p>
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
          <select v-model="revenueChartType" class="chart-select">
            <option value="line">Ligne</option>
            <option value="bar">Barres</option>
            <option value="area">Aire</option>
          </select>
        </div>
        <div class="chart-container">
          <canvas ref="revenueChart"></canvas>
        </div>
      </div>
      
      <!-- Orders Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Commandes par jour</h3>
          <select v-model="ordersChartType" class="chart-select">
            <option value="bar">Barres</option>
            <option value="line">Ligne</option>
          </select>
        </div>
        <div class="chart-container">
          <canvas ref="ordersChart"></canvas>
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
          <div v-for="(product, index) in topProducts" :key="product.id" class="product-rank">
            <div class="rank-number">{{ index + 1 }}</div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-stats">
                <span class="quantity">{{ product.quantity }} ventes</span>
                <span class="revenue">{{ formatPrice(product.revenue) }}</span>
              </div>
            </div>
            <div class="product-trend" :class="product.trend > 0 ? 'positive' : 'negative'">
              {{ product.trend > 0 ? '+' : '' }}{{ product.trend }}%
            </div>
          </div>
        </div>
      </div>
      
      <!-- Categories Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Ventes par catégorie</h3>
          <select v-model="categoryChartType" class="chart-select">
            <option value="doughnut">Anneau</option>
            <option value="pie">Camembert</option>
            <option value="polarArea">Polaire</option>
          </select>
        </div>
        <div class="chart-container">
          <canvas ref="categoryChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Detailed Stats -->
    <div class="detailed-stats">
      <div class="stats-tabs">
        <button 
          v-for="tab in statsTabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
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
              <h4>Nouveaux clients</h4>
              <p class="metric-value">{{ newCustomers }}</p>
              <p class="metric-change positive">+15%</p>
            </div>
            <div class="metric-card">
              <h4>Taux de rétention</h4>
              <p class="metric-value">{{ retentionRate }}%</p>
              <p class="metric-change positive">+3%</p>
            </div>
            <div class="metric-card">
              <h4>CLV (Customer Lifetime Value)</h4>
              <p class="metric-value">{{ formatPrice(clv) }}</p>
              <p class="metric-change positive">+8%</p>
            </div>
          </div>
          
          <div class="customer-segments">
            <h4>Segmentation clients</h4>
            <div class="segments-grid">
              <div class="segment-card">
                <div class="segment-icon vip">👑</div>
                <div class="segment-info">
                  <h5>Clients VIP</h5>
                  <p class="segment-count">{{ vipCustomers }}</p>
                  <p class="segment-revenue">{{ formatPrice(vipRevenue) }}</p>
                </div>
              </div>
              <div class="segment-card">
                <div class="segment-icon regular">👍</div>
                <div class="segment-info">
                  <h5>Réguliers</h5>
                  <p class="segment-count">{{ regularCustomers }}</p>
                  <p class="segment-revenue">{{ formatPrice(regularRevenue) }}</p>
                </div>
              </div>
              <div class="segment-card">
                <div class="segment-icon new">🌟</div>
                <div class="segment-info">
                  <h5>Nouveaux</h5>
                  <p class="segment-count">{{ newCustomers }}</p>
                  <p class="segment-revenue">{{ formatPrice(newRevenue) }}</p>
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
                  <th>Taux de rotation</th>
                  <th>Tendance</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in productStats" :key="product.id">
                  <td>
                    <div class="product-cell">
                      <img :src="product.image" :alt="product.name" class="product-img">
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
                        <div class="stock-fill" :style="{ width: product.stockPercent + '%' }"></div>
                      </div>
                      <span>{{ product.stock }}</span>
                    </div>
                  </td>
                  <td>{{ product.turnover }} jours</td>
                  <td>
                    <span class="trend-badge" :class="product.trend >= 0 ? 'positive' : 'negative'">
                      {{ product.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(product.trend) }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Sales Stats -->
        <div v-else class="tab-pane">
          <div class="sales-metrics">
            <div class="metric-row">
              <div class="metric-item">
                <h4>Conversion rate</h4>
                <p class="metric-value">{{ conversionRate }}%</p>
              </div>
              <div class="metric-item">
                <h4>Panier abandonné</h4>
                <p class="metric-value">{{ abandonedCartRate }}%</p>
              </div>
              <div class="metric-item">
                <h4>Temps moyen d'achat</h4>
                <p class="metric-value">{{ averagePurchaseTime }} min</p>
              </div>
            </div>
            
            <div class="sales-channels">
              <h4>Canaux de vente</h4>
              <div class="channels-grid">
                <div class="channel-card">
                  <div class="channel-icon web">🌐</div>
                  <div class="channel-info">
                    <h5>Site web</h5>
                    <p class="channel-percent">{{ webSalesPercent }}%</p>
                    <p class="channel-amount">{{ formatPrice(webSales) }}</p>
                  </div>
                </div>
                <div class="channel-card">
                  <div class="channel-icon mobile">📱</div>
                  <div class="channel-info">
                    <h5>Mobile</h5>
                    <p class="channel-percent">{{ mobileSalesPercent }}%</p>
                    <p class="channel-amount">{{ formatPrice(mobileSales) }}</p>
                  </div>
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
        <button @click="exportRevenueReport" class="export-option">
          <span class="export-icon">📈</span>
          <span>Rapport revenus</span>
        </button>
        <button @click="exportCustomerReport" class="export-option">
          <span class="export-icon">👥</span>
          <span>Rapport clients</span>
        </button>
        <button @click="exportProductReport" class="export-option">
          <span class="export-icon">📦</span>
          <span>Rapport produits</span>
        </button>
        <button @click="exportFullReport" class="export-option primary">
          <span class="export-icon">📊</span>
          <span>Rapport complet</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'AdminAnalytics',
  data() {
    return {
      selectedRange: 'month',
      customStartDate: '',
      customEndDate: '',
      today: new Date().toISOString().split('T')[0],
      
      revenueChartType: 'line',
      ordersChartType: 'bar',
      categoryChartType: 'doughnut',
      
      activeTab: 'customers',
      
      dateRanges: [
        { id: 'day', label: 'Aujourd\'hui' },
        { id: 'week', label: '7 jours' },
        { id: 'month', label: '30 jours' },
        { id: 'quarter', label: '3 mois' },
        { id: 'year', label: '1 an' }
      ],
      
      statsTabs: [
        { id: 'customers', label: 'Clients' },
        { id: 'products', label: 'Produits' },
        { id: 'sales', label: 'Ventes' }
      ],
      
      revenueChart: null,
      ordersChart: null,
      categoryChart: null,
      
      // Données de démo
      totalRevenue: 152847.89,
      totalOrders: 1247,
      averageOrderValue: 122.54,
      newCustomers: 156,
      averageOrdersPerDay: 41.6,
      retentionRate: 78.5,
      clv: 285.76,
      vipCustomers: 45,
      vipRevenue: 68500,
      regularCustomers: 420,
      regularRevenue: 64320,
      newRevenue: 20027.89,
      conversionRate: 3.2,
      abandonedCartRate: 65.4,
      averagePurchaseTime: 8.5,
      webSalesPercent: 68,
      mobileSalesPercent: 32,
      webSales: 103936.57,
      mobileSales: 48911.32
    }
  },
  computed: {
    topProducts() {
      return [
        { id: 1, name: 'T-shirt Noir Classique', quantity: 245, revenue: 7350.55, trend: 12 },
        { id: 2, name: 'Pull en Laine Premium', quantity: 189, revenue: 13230, trend: 8 },
        { id: 3, name: 'Chaussures Sport', quantity: 156, revenue: 18720, trend: 15 },
        { id: 4, name: 'Casquette Urbaine', quantity: 234, revenue: 4680, trend: -3 },
        { id: 5, name: 'Sac à dos Travel', quantity: 98, revenue: 14700, trend: 22 }
      ];
    },
    
    productStats() {
      return [
        { id: 1, name: 'T-shirt Noir', sku: 'TSH-BLK', image: '', sales: 245, revenue: 7350.55, stock: 150, stockPercent: 60, turnover: 15, trend: 12 },
        { id: 2, name: 'Pull Laine', sku: 'SWT-WL', image: '', sales: 189, revenue: 13230, stock: 80, stockPercent: 40, turnover: 12, trend: 8 },
        { id: 3, name: 'Chaussures Sport', sku: 'SHO-SPT', image: '', sales: 156, revenue: 18720, stock: 45, stockPercent: 25, turnover: 8, trend: 15 },
        { id: 4, name: 'Casquette', sku: 'CAP-URB', image: '', sales: 234, revenue: 4680, stock: 120, stockPercent: 30, turnover: 20, trend: -3 },
        { id: 5, name: 'Sac Travel', sku: 'BAG-TRV', image: '', sales: 98, revenue: 14700, stock: 25, stockPercent: 10, turnover: 7, trend: 22 }
      ];
    }
  },
  mounted() {
    this.initCharts();
    this.setDefaultDates();
  },
  beforeUnmount() {
    if (this.revenueChart) this.revenueChart.destroy();
    if (this.ordersChart) this.ordersChart.destroy();
    if (this.categoryChart) this.categoryChart.destroy();
  },
  watch: {
    revenueChartType() {
      this.updateRevenueChart();
    },
    ordersChartType() {
      this.updateOrdersChart();
    },
    categoryChartType() {
      this.updateCategoryChart();
    }
  },
  methods: {
    setDefaultDates() {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      
      this.customStartDate = start.toISOString().split('T')[0];
      this.customEndDate = end.toISOString().split('T')[0];
    },
    goToDashboard() {
      this.$router.push('/admin/products');
    },
     goToCommandes() {
      this.$router.push('/admin/orders');
    },
    selectDateRange(rangeId) {
      this.selectedRange = rangeId;
      const end = new Date();
      const start = new Date();
      
      switch (rangeId) {
        case 'day':
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
        case 'year':
          start.setFullYear(start.getFullYear() - 1);
          break;
      }
      
      this.customStartDate = start.toISOString().split('T')[0];
      this.customEndDate = end.toISOString().split('T')[0];
    },
    
    initCharts() {
      this.createRevenueChart();
      this.createOrdersChart();
      this.createCategoryChart();
    },
    
    createRevenueChart() {
      const ctx = this.$refs.revenueChart.getContext('2d');
      
      this.revenueChart = new Chart(ctx, {
        type: this.revenueChartType,
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul'],
          datasets: [{
            label: 'Chiffre d\'affaires (€)',
            data: [45000, 52000, 48000, 61000, 58000, 72000, 68000],
            borderColor: '#3b82f6',
            backgroundColor: this.revenueChartType === 'line' ? 'rgba(59, 130, 246, 0.1)' : '#3b82f6',
            fill: this.revenueChartType === 'area',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => `${value / 1000}k€`
              }
            }
          }
        }
      });
    },
    
    createOrdersChart() {
      const ctx = this.$refs.ordersChart.getContext('2d');
      
      this.ordersChart = new Chart(ctx, {
        type: this.ordersChartType,
        data: {
          labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
          datasets: [{
            label: 'Commandes',
            data: [45, 52, 48, 61, 58, 72, 68],
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    },
    
    createCategoryChart() {
      const ctx = this.$refs.categoryChart.getContext('2d');
      
      this.categoryChart = new Chart(ctx, {
        type: this.categoryChartType,
        data: {
          labels: ['Homme', 'Femme', 'Enfant', 'Accessoires'],
          datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: [
              '#3b82f6',
              '#8b5cf6',
              '#10b981',
              '#f59e0b'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    },
    
    updateRevenueChart() {
      if (this.revenueChart) {
        this.revenueChart.destroy();
        this.createRevenueChart();
      }
    },
    
    updateOrdersChart() {
      if (this.ordersChart) {
        this.ordersChart.destroy();
        this.createOrdersChart();
      }
    },
    
    updateCategoryChart() {
      if (this.categoryChart) {
        this.categoryChart.destroy();
        this.createCategoryChart();
      }
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    },
    
    exportTopProducts() {
      const csv = this.convertToCSV(this.topProducts);
      this.downloadCSV(csv, 'top_produits.csv');
    },
    
    exportRevenueReport() {
      const data = [
        ['Période', 'Chiffre d\'affaires'],
        ['Janvier', '45,000 €'],
        ['Février', '52,000 €'],
        ['Mars', '48,000 €'],
        ['Avril', '61,000 €'],
        ['Mai', '58,000 €'],
        ['Juin', '72,000 €'],
        ['Juillet', '68,000 €']
      ];
      
      const csv = data.map(row => row.join(',')).join('\n');
      this.downloadCSV(csv, 'rapport_revenus.csv');
    },
    
    exportCustomerReport() {
      const data = [
        ['Segment', 'Clients', 'Chiffre d\'affaires'],
        ['Clients VIP', '45', '68,500 €'],
        ['Clients réguliers', '420', '64,320 €'],
        ['Nouveaux clients', '156', '20,028 €']
      ];
      
      const csv = data.map(row => row.join(',')).join('\n');
      this.downloadCSV(csv, 'rapport_clients.csv');
    },
    
    exportProductReport() {
      const csv = this.convertToCSV(this.productStats);
      this.downloadCSV(csv, 'rapport_produits.csv');
    },
    
    exportFullReport() {
      const now = new Date();
      const report = {
        date: now.toISOString(),
        periode: `${this.customStartDate} au ${this.customEndDate}`,
        metrics: {
          totalRevenue: this.totalRevenue,
          totalOrders: this.totalOrders,
          averageOrderValue: this.averageOrderValue,
          newCustomers: this.newCustomers,
          conversionRate: this.conversionRate
        },
        topProducts: this.topProducts,
        customerSegments: {
          vip: { count: this.vipCustomers, revenue: this.vipRevenue },
          regular: { count: this.regularCustomers, revenue: this.regularRevenue },
          new: { count: this.newCustomers, revenue: this.newRevenue }
        }
      };
      
      const json = JSON.stringify(report, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_complet_${now.getTime()}.json`;
      a.click();
      
      this.showNotification('Rapport exporté avec succès', 'success');
    },
    
    convertToCSV(data) {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(header => item[header]));
      
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
    
    showNotification(message, type) {
      // Implémentez votre système de notification
      alert(message);
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
}

.analytics-header h1 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.8rem;
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
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.kpi-trend {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.kpi-trend.positive {
  background: #d1fae5;
  color: #065f46;
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
}

.export-btn.small {
  padding: 0.25rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: #4b5563;
  font-size: 0.85rem;
  cursor: pointer;
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
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
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

.product-trend {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.product-trend.positive {
  background: #d1fae5;
  color: #065f46;
}

.product-trend.negative {
  background: #fee2e2;
  color: #991b1b;
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
}

.tab-btn:hover {
  color: #374151;
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
  from { opacity: 0; }
  to { opacity: 1; }
}

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

.metric-change {
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
}

.metric-change.positive {
  color: #10b981;
}

.customer-segments h4 {
  color: #1f2937;
  margin: 0 0 1rem 0;
  font-weight: 600;
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
}

.segment-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.segment-icon.vip {
  background: #fef3c7;
  color: #d97706;
}

.segment-icon.regular {
  background: #dbeafe;
  color: #3b82f6;
}

.segment-icon.new {
  background: #fce7f3;
  color: #db2777;
}

.segment-info h5 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 0.9rem;
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
}

.products-table table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th,
.products-table td {
  padding: 0.75rem 1rem;
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
  background: #f3f4f6;
  object-fit: cover;
}

.product-sku {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.stock-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-bar {
  width: 60px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  background: #10b981;
  border-radius: 3px;
}

.trend-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.trend-badge.positive {
  background: #d1fae5;
  color: #065f46;
}

.trend-badge.negative {
  background: #fee2e2;
  color: #991b1b;
}

/* Sales Metrics */
.sales-metrics {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.metric-item h4 {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.sales-channels h4 {
  color: #1f2937;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.channel-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.channel-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.channel-icon.web {
  background: #dbeafe;
  color: #3b82f6;
}

.channel-icon.mobile {
  background: #f0f9ff;
  color: #0ea5e9;
}

.channel-info h5 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 0.9rem;
}

.channel-percent {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.channel-amount {
  font-size: 0.85rem;
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
}

.export-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.export-option {
  flex: 1;
  min-width: 200px;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-option:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
}

.export-option.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.export-option.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.export-icon {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-analytics {
    padding: 1rem;
  }
  
  .date-range {
    flex-direction: column;
    align-items: stretch;
  }
  
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .customer-metrics {
    grid-template-columns: 1fr;
  }
  
  .segments-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-row {
    grid-template-columns: 1fr;
  }
  
  .channels-grid {
    grid-template-columns: 1fr;
  }
  
  .export-options {
    flex-direction: column;
  }
  
  .export-option {
    min-width: unset;
  }
}
</style>