<template>
  <div class="admin-analytics">
    <!-- Header amélioré -->
    <div class="analytics-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">📊</div>
          <div>
            <h1>Tableau de bord Analytique</h1>
            <p class="subtitle">Suivez les performances de votre boutique en temps réel</p>
          </div>
        </div>
        
        <div class="header-actions">
          <div class="action-buttons">
            <button 
              @click="goToDashboard"
              class="action-btn dashboard-btn"
            >
              <div class="btn-icon">🏠</div>
              <div class="btn-text">
                <span class="btn-title">Dashboard</span>
                <span class="btn-subtitle">Gestion produits</span>
              </div>
            </button>
            
            <button 
              @click="goToCommandes"
              class="action-btn orders-btn"
            >
              <div class="btn-icon">📦</div>
              <div class="btn-text">
                <span class="btn-title">Commandes</span>
                <span class="btn-subtitle">Gestion des ventes</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Filtres de période -->
      <div class="period-filters">
        <div class="filter-section">
          <div class="filter-label">
            <span class="filter-icon">📅</span>
            <span>Période d'analyse</span>
          </div>
          
          <div class="quick-ranges">
            <button 
              v-for="range in dateRanges" 
              :key="range.id"
              @click="selectDateRange(range.id)"
              :class="['range-btn', { active: selectedRange === range.id }]"
            >
              <span class="range-icon">{{ range.icon }}</span>
              <span class="range-text">{{ range.label }}</span>
            </button>
          </div>
          
          <div class="custom-range">
            <div class="date-input-group">
              <div class="input-wrapper">
                <span class="input-icon">📅</span>
                <input 
                  type="date" 
                  v-model="customStartDate" 
                  class="date-input styled"
                  :max="today"
                  title="Date de début"
                />
              </div>
              <span class="date-separator">→</span>
              <div class="input-wrapper">
                <span class="input-icon">📅</span>
                <input 
                  type="date" 
                  v-model="customEndDate" 
                  class="date-input styled"
                  :max="today"
                  :min="customStartDate"
                  title="Date de fin"
                />
              </div>
            </div>
            <button @click="applyCustomRange" class="apply-btn">
              <span class="apply-icon">✓</span>
              <span>Appliquer</span>
            </button>
          </div>
        </div>
        
        <div class="filter-section">
          <div class="filter-label">
            <span class="filter-icon">⚡</span>
            <span>Mise à jour automatique</span>
          </div>
          <div class="auto-refresh">
            <label class="switch">
              <input type="checkbox" v-model="autoRefresh">
              <span class="slider"></span>
            </label>
            <span class="refresh-text">Actualiser toutes les 5 min</span>
            <span class="last-update">Dernière mise à jour: {{ lastUpdate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Cards améliorées -->
    <div class="kpi-grid">
      <div class="kpi-card revenue-card">
        <div class="kpi-card-inner">
          <div class="kpi-header">
            <div class="kpi-icon-wrapper">
              <div class="kpi-icon revenue">
                <span>💰</span>
                <div class="icon-glow"></div>
              </div>
            </div>
            <div class="kpi-trend positive">
              <span class="trend-icon">↗</span>
              <span class="trend-value">+12%</span>
            </div>
          </div>
          <div class="kpi-content">
            <h3 class="kpi-title">Chiffre d'affaires</h3>
            <p class="kpi-value">{{ formatPrice(totalRevenue) }}</p>
            <div class="kpi-footer">
              <span class="kpi-period">vs période précédente</span>
              <span class="kpi-change positive">+{{ formatPrice(revenueChange) }}</span>
            </div>
          </div>
          <div class="kpi-sparkline">
            <svg width="100" height="30">
              <path :d="revenueSparkline" fill="none" stroke="#10b981" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="kpi-card orders-card">
        <div class="kpi-card-inner">
          <div class="kpi-header">
            <div class="kpi-icon-wrapper">
              <div class="kpi-icon orders">
                <span>📦</span>
                <div class="icon-glow"></div>
              </div>
            </div>
            <div class="kpi-trend positive">
              <span class="trend-icon">↗</span>
              <span class="trend-value">+8%</span>
            </div>
          </div>
          <div class="kpi-content">
            <h3 class="kpi-title">Commandes</h3>
            <p class="kpi-value">{{ totalOrders }}</p>
            <div class="kpi-footer">
              <span class="kpi-period">{{ averageOrdersPerDay }} / jour</span>
              <span class="kpi-change positive">+{{ orderChange }}</span>
            </div>
          </div>
          <div class="kpi-sparkline">
            <svg width="100" height="30">
              <path :d="ordersSparkline" fill="none" stroke="#3b82f6" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="kpi-card average-card">
        <div class="kpi-card-inner">
          <div class="kpi-header">
            <div class="kpi-icon-wrapper">
              <div class="kpi-icon average">
                <span>📊</span>
                <div class="icon-glow"></div>
              </div>
            </div>
            <div class="kpi-trend positive">
              <span class="trend-icon">↗</span>
              <span class="trend-value">+5%</span>
            </div>
          </div>
          <div class="kpi-content">
            <h3 class="kpi-title">Panier moyen</h3>
            <p class="kpi-value">{{ formatPrice(averageOrderValue) }}</p>
            <div class="kpi-footer">
              <span class="kpi-period">Par commande</span>
              <span class="kpi-change positive">+{{ formatPrice(aovChange) }}</span>
            </div>
          </div>
          <div class="kpi-sparkline">
            <svg width="100" height="30">
              <path :d="aovSparkline" fill="none" stroke="#8b5cf6" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="kpi-card customers-card">
        <div class="kpi-card-inner">
          <div class="kpi-header">
            <div class="kpi-icon-wrapper">
              <div class="kpi-icon customers">
                <span>👥</span>
                <div class="icon-glow"></div>
              </div>
            </div>
            <div class="kpi-trend positive">
              <span class="trend-icon">↗</span>
              <span class="trend-value">+15%</span>
            </div>
          </div>
          <div class="kpi-content">
            <h3 class="kpi-title">Nouveaux clients</h3>
            <p class="kpi-value">{{ newCustomers }}</p>
            <div class="kpi-footer">
              <span class="kpi-period">Clients actifs</span>
              <span class="kpi-change positive">+{{ customerChange }}</span>
            </div>
          </div>
          <div class="kpi-sparkline">
            <svg width="100" height="30">
              <path :d="customersSparkline" fill="none" stroke="#f59e0b" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Revenue Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3><span class="chart-icon">📈</span> Évolution du chiffre d'affaires</h3>
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
          <h3><span class="chart-icon">📊</span> Commandes par jour</h3>
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
          <h3><span class="chart-icon">🏆</span> Top 5 produits</h3>
          <button @click="exportTopProducts" class="export-btn">
            <span class="export-icon">📤</span>
            <span>Export</span>
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
          <h3><span class="chart-icon">🎯</span> Ventes par catégorie</h3>
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

    <!-- Additional Analytics Sections -->
    <div class="additional-analytics">
      <div class="additional-grid">
        <!-- Taux à proximité -->
        <div class="additional-section large">
          <div class="section-header">
            <h3><span class="section-icon">📍</span> Taux à proximité</h3>
            <span class="section-badge">🔄 Live</span>
          </div>
          <div class="proximity-grid">
            <div class="proximity-card" v-for="item in proximityRates" :key="item.id">
              <div class="proximity-icon" :class="item.type">{{ item.icon }}</div>
              <div class="proximity-content">
                <div class="proximity-label">{{ item.label }}</div>
                <div class="proximity-value">{{ item.value }}</div>
                <div v-if="item.trend" class="proximity-trend" :class="item.trendType">
                  {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Résultats de définition -->
        <div class="additional-section">
          <div class="section-header">
            <h3><span class="section-icon">📝</span> Résultat de définition</h3>
          </div>
          <div class="definition-results">
            <div class="result-item" v-for="result in definitionResults" :key="result.id">
              <div class="result-label">{{ result.label }}</div>
              <div class="result-value">{{ result.value }}</div>
            </div>
          </div>
        </div>

        <!-- Contenu par catégorie -->
        <div class="additional-section">
          <div class="section-header">
            <h3><span class="section-icon">🗂️</span> Contenu par catégorie</h3>
          </div>
          <div class="category-content">
            <div class="category-item" v-for="category in categoryContent" :key="category.id">
              <div class="category-label">{{ category.label }}</div>
              <div class="category-value">{{ category.value }}</div>
            </div>
          </div>
        </div>

        <!-- Contenu d'action -->
        <div class="additional-section">
          <div class="section-header">
            <h3><span class="section-icon">⚡</span> Contenu d'action</h3>
          </div>
          <div class="action-content">
            <div class="action-item" v-for="action in actionContent" :key="action.id">
              <div class="action-label">{{ action.label }}</div>
              <div class="action-value">{{ action.value }}</div>
            </div>
          </div>
        </div>

        <!-- Répartition cliente -->
        <div class="additional-section">
          <div class="section-header">
            <h3><span class="section-icon">👥</span> Répartition cliente</h3>
          </div>
          <div class="distribution-content">
            <div class="distribution-item" v-for="dist in clientDistribution" :key="dist.id">
              <div class="distribution-label">{{ dist.label }}</div>
              <div class="distribution-value">{{ dist.value }}</div>
            </div>
          </div>
        </div>

        <!-- Taux de démarche -->
        <div class="additional-section">
          <div class="section-header">
            <h3><span class="section-icon">🚀</span> Taux de démarche</h3>
          </div>
          <div class="startup-rates">
            <div class="startup-item" v-for="rate in startupRates" :key="rate.id">
              <div class="startup-label">{{ rate.label }}</div>
              <div class="startup-value">{{ rate.value }}</div>
            </div>
          </div>
        </div>

        <!-- Définition d'accueil -->
        <div class="additional-section">
          <div class="section-header">
            <h3><span class="section-icon">👋</span> Définition d'accueil</h3>
          </div>
          <div class="welcome-definitions">
            <div class="welcome-item" v-for="welcome in welcomeDefinitions" :key="welcome.id">
              <div class="welcome-label">{{ welcome.label }}</div>
              <div class="welcome-value">{{ welcome.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Stats -->
    <div class="detailed-stats">
      <div class="stats-header">
        <h3><span class="stats-icon">📋</span> Statistiques détaillées</h3>
        <div class="stats-tabs">
          <button 
            v-for="tab in statsTabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>
      
      <div class="stats-content">
        <!-- Customers Stats -->
        <div v-if="activeTab === 'customers'" class="tab-pane">
          <div class="customer-metrics">
            <div class="metric-card">
              <div class="metric-icon">👤</div>
              <div class="metric-info">
                <h4>Nouveaux clients</h4>
                <p class="metric-value">{{ newCustomers }}</p>
                <p class="metric-change positive">+15%</p>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">🔄</div>
              <div class="metric-info">
                <h4>Taux de rétention</h4>
                <p class="metric-value">{{ retentionRate }}%</p>
                <p class="metric-change positive">+3%</p>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">💰</div>
              <div class="metric-info">
                <h4>CLV (Customer Lifetime Value)</h4>
                <p class="metric-value">{{ formatPrice(clv) }}</p>
                <p class="metric-change positive">+8%</p>
              </div>
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
          <div class="products-table-container">
            <table class="products-table">
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
                      <div class="product-img-placeholder"></div>
                      <div>
                        <strong>{{ product.name }}</strong>
                        <p class="product-sku">{{ product.sku }}</p>
                      </div>
                    </div>
                  </td>
                  <td><span class="sales-badge">{{ product.sales }}</span></td>
                  <td><span class="revenue-badge">{{ formatPrice(product.revenue) }}</span></td>
                  <td>
                    <div class="stock-indicator">
                      <div class="stock-bar">
                        <div class="stock-fill" :style="{ width: product.stockPercent + '%' }"></div>
                      </div>
                      <span>{{ product.stock }}</span>
                    </div>
                  </td>
                  <td><span class="turnover-badge">{{ product.turnover }} jours</span></td>
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
                <div class="metric-icon">📈</div>
                <div class="metric-details">
                  <h4>Conversion rate</h4>
                  <p class="metric-value">{{ conversionRate }}%</p>
                  <p class="metric-subtitle">Taux de conversion global</p>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-icon">🛒</div>
                <div class="metric-details">
                  <h4>Panier abandonné</h4>
                  <p class="metric-value">{{ abandonedCartRate }}%</p>
                  <p class="metric-subtitle">Taux d'abandon</p>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-icon">⏱️</div>
                <div class="metric-details">
                  <h4>Temps moyen d'achat</h4>
                  <p class="metric-value">{{ averagePurchaseTime }} min</p>
                  <p class="metric-subtitle">Durée moyenne</p>
                </div>
              </div>
            </div>
            
            <div class="sales-channels">
              <h4><span class="channel-icon">🌍</span> Canaux de vente</h4>
              <div class="channels-grid">
                <div class="channel-card">
                  <div class="channel-icon web">🌐</div>
                  <div class="channel-info">
                    <h5>Site web</h5>
                    <div class="channel-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: webSalesPercent + '%' }"></div>
                      </div>
                      <span class="channel-percent">{{ webSalesPercent }}%</span>
                    </div>
                    <p class="channel-amount">{{ formatPrice(webSales) }}</p>
                  </div>
                </div>
                <div class="channel-card">
                  <div class="channel-icon mobile">📱</div>
                  <div class="channel-info">
                    <h5>Mobile</h5>
                    <div class="channel-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: mobileSalesPercent + '%' }"></div>
                      </div>
                      <span class="channel-percent">{{ mobileSalesPercent }}%</span>
                    </div>
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
      <div class="export-header">
        <h3><span class="export-header-icon">📁</span> Exporter les rapports</h3>
        <p class="export-subtitle">Générez et téléchargez vos rapports d'analyse</p>
      </div>
      <div class="export-options">
        <button @click="exportRevenueReport" class="export-option">
          <span class="export-icon">📈</span>
          <div class="export-content">
            <span class="export-title">Rapport revenus</span>
            <span class="export-desc">Chiffre d'affaires & tendances</span>
          </div>
        </button>
        <button @click="exportCustomerReport" class="export-option">
          <span class="export-icon">👥</span>
          <div class="export-content">
            <span class="export-title">Rapport clients</span>
            <span class="export-desc">Segmentation & fidélité</span>
          </div>
        </button>
        <button @click="exportProductReport" class="export-option">
          <span class="export-icon">📦</span>
          <div class="export-content">
            <span class="export-title">Rapport produits</span>
            <span class="export-desc">Performance & stocks</span>
          </div>
        </button>
        <button @click="exportFullReport" class="export-option primary">
          <span class="export-icon">📊</span>
          <div class="export-content">
            <span class="export-title">Rapport complet</span>
            <span class="export-desc">Toutes les données d'analyse</span>
          </div>
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
      lastUpdate: new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      autoRefresh: true,
      
      revenueChartType: 'line',
      ordersChartType: 'bar',
      categoryChartType: 'doughnut',
      
      activeTab: 'customers',
      
      dateRanges: [
        { id: 'day', label: 'Aujourd\'hui', icon: '☀️' },
        { id: 'week', label: '7 jours', icon: '📅' },
        { id: 'month', label: '30 jours', icon: '📆' },
        { id: 'quarter', label: '3 mois', icon: '📊' },
        { id: 'year', label: '1 an', icon: '🎯' }
      ],
      
      statsTabs: [
        { id: 'customers', label: 'Clients', icon: '👤' },
        { id: 'products', label: 'Produits', icon: '📦' },
        { id: 'sales', label: 'Ventes', icon: '💰' }
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
      mobileSales: 48911.32,
      
      // Changements pour les KPIs
      revenueChange: 15284.79,
      orderChange: 98,
      aovChange: 5.83,
      customerChange: 24,
      
      // Sparklines data
      revenueSparkline: 'M0,15 L20,8 L40,12 L60,18 L80,10 L100,15',
      ordersSparkline: 'M0,20 L20,15 L40,18 L60,12 L80,16 L100,10',
      aovSparkline: 'M0,18 L20,12 L40,16 L60,10 L80,14 L100,18',
      customersSparkline: 'M0,10 L20,14 L40,8 L60,16 L80,12 L100,10',
      
      // Données pour les sections supplémentaires
      proximityRates: [
        { id: 1, label: 'Sécurité', value: 'Détecteur', icon: '🔒', type: 'security', trend: 12, trendType: 'positive' },
        { id: 2, label: 'Système', value: 'DÉSERT', icon: '🌵', type: 'system' },
        { id: 3, label: 'Aide au Limb Premier', value: 'Active', icon: '🦾', type: 'aid', trend: 8, trendType: 'positive' },
        { id: 4, label: 'Sthérum', value: '12,000 €', icon: '💰', type: 'finance' },
        { id: 5, label: 'Choisisseur', value: '15,000 €', icon: '🎯', type: 'finance' },
        { id: 6, label: 'Étranger', value: 'Vériture', icon: '🌍', type: 'foreign' },
        { id: 7, label: 'Sthérum', value: '40,000 €', icon: '💰', type: 'finance', trend: 25, trendType: 'positive' },
        { id: 8, label: 'Sur Leurs Touches', value: 'En cours', icon: '🎮', type: 'progress' },
        { id: 9, label: 'Bruitier', value: '10,000 €', icon: '📢', type: 'finance' }
      ],
      
      definitionResults: [
        { id: 1, label: 'Nom', value: 'Fonction' },
        { id: 2, label: 'Durée', value: '15,000' },
        { id: 3, label: 'Montant', value: '28,567 €' }
      ],
      
      categoryContent: [
        { id: 1, label: 'Votre type', value: 'Mettre' },
        { id: 2, label: 'Durée', value: '25,000' },
        { id: 3, label: 'Valeur', value: '30,000' }
      ],
      
      actionContent: [
        { id: 1, label: 'Nom', value: 'Nom' },
        { id: 2, label: 'Durée', value: '15,000' }
      ],
      
      clientDistribution: [
        { id: 1, label: 'Chacun', value: '20,000 €' },
        { id: 2, label: 'Durée', value: '28,567 €' }
      ],
      
      startupRates: [
        { id: 1, label: 'Nom', value: 'Nom' },
        { id: 2, label: 'Durée', value: '28,567 €' }
      ],
      
      welcomeDefinitions: [
        { id: 1, label: 'Nom', value: 'Nom' },
        { id: 2, label: 'Durée', value: '28,567 €' }
      ]
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
        { id: 1, name: 'T-shirt Noir', sku: 'TSH-BLK', sales: 245, revenue: 7350.55, stock: 150, stockPercent: 60, turnover: 15, trend: 12 },
        { id: 2, name: 'Pull Laine', sku: 'SWT-WL', sales: 189, revenue: 13230, stock: 80, stockPercent: 40, turnover: 12, trend: 8 },
        { id: 3, name: 'Chaussures Sport', sku: 'SHO-SPT', sales: 156, revenue: 18720, stock: 45, stockPercent: 25, turnover: 8, trend: 15 },
        { id: 4, name: 'Casquette', sku: 'CAP-URB', sales: 234, revenue: 4680, stock: 120, stockPercent: 30, turnover: 20, trend: -3 },
        { id: 5, name: 'Sac Travel', sku: 'BAG-TRV', sales: 98, revenue: 14700, stock: 25, stockPercent: 10, turnover: 7, trend: 22 }
      ];
    }
  },
  mounted() {
    this.initCharts();
    this.setDefaultDates();
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  },
  beforeUnmount() {
    if (this.revenueChart) this.revenueChart.destroy();
    if (this.ordersChart) this.ordersChart.destroy();
    if (this.categoryChart) this.categoryChart.destroy();
    this.stopAutoRefresh();
  },
  watch: {
    autoRefresh(value) {
      if (value) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },
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
      this.applyCustomRange();
    },
    
    applyCustomRange() {
      console.log('Application de la période:', this.customStartDate, 'au', this.customEndDate);
      this.lastUpdate = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      this.showNotification('Période mise à jour', 'success');
    },
    
    startAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.lastUpdate = new Date().toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        console.log('Mise à jour automatique...');
      }, 300000); // 5 minutes
    },
    
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
    },
    
    initCharts() {
      this.createRevenueChart();
      this.createOrdersChart();
      this.createCategoryChart();
    },
    
    createRevenueChart() {
      const ctx = this.$refs.revenueChart?.getContext('2d');
      if (!ctx) return;
      
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
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              padding: 10,
              cornerRadius: 8
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
              ticks: {
                callback: value => `${value / 1000}k€`,
                color: '#6b7280'
              }
            },
            x: {
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
              ticks: { color: '#6b7280' }
            }
          }
        }
      });
    },
    
    createOrdersChart() {
      const ctx = this.$refs.ordersChart?.getContext('2d');
      if (!ctx) return;
      
      this.ordersChart = new Chart(ctx, {
        type: this.ordersChartType,
        data: {
          labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
          datasets: [{
            label: 'Commandes',
            data: [45, 52, 48, 61, 58, 72, 68],
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
              ticks: { color: '#6b7280' }
            },
            x: {
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
              ticks: { color: '#6b7280' }
            }
          }
        }
      });
    },
    
    createCategoryChart() {
      const ctx = this.$refs.categoryChart?.getContext('2d');
      if (!ctx) return;
      
      this.categoryChart = new Chart(ctx, {
        type: this.categoryChartType,
        data: {
          labels: ['Homme', 'Femme', 'Enfant', 'Accessoires'],
          datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)'
            ],
            borderColor: [
              'rgb(59, 130, 246)',
              'rgb(139, 92, 246)',
              'rgb(16, 185, 129)',
              'rgb(245, 158, 11)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#6b7280',
                padding: 20,
                font: { size: 12 }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff'
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
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    },
    
    exportTopProducts() {
      const csv = this.convertToCSV(this.topProducts);
      this.downloadCSV(csv, 'top_produits.csv');
      this.showNotification('Top produits exportés', 'success');
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
      this.showNotification('Rapport revenus exporté', 'success');
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
      this.showNotification('Rapport clients exporté', 'success');
    },
    
    exportProductReport() {
      const csv = this.convertToCSV(this.productStats);
      this.downloadCSV(csv, 'rapport_produits.csv');
      this.showNotification('Rapport produits exporté', 'success');
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
      
      this.showNotification('Rapport complet exporté', 'success');
    },
    
    convertToCSV(data) {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(header => item[header]));
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    },
    
    downloadCSV(csv, filename) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    
    showNotification(message, type) {
      // Implémentez votre système de notification
      console.log(`${type === 'success' ? '✅' : '❌'} ${message}`);
    }
  }
}
</script>

<style scoped>
.admin-analytics {
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* Header amélioré */
.analytics-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.05),
    0 10px 10px -5px rgba(0, 0, 0, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
}

.analytics-header::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(30%, -30%);
}

.analytics-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-30%, 30%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.title-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  box-shadow: 
    0 10px 15px -3px rgba(59, 130, 246, 0.3),
    0 4px 6px -2px rgba(59, 130, 246, 0.1);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.header-title h1 {
  margin: 0;
  color: #1f2937;
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.subtitle {
  margin: 0.75rem 0 0 0;
  color: #6b7280;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Boutons d'action améliorés */
.action-buttons {
  display: flex;
  gap: 1.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.75rem;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.action-btn:hover::before {
  transform: translateX(100%);
}

.dashboard-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 
    0 10px 15px -3px rgba(99, 102, 241, 0.3),
    0 4px 6px -2px rgba(99, 102, 241, 0.1);
}

.dashboard-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 20px 25px -5px rgba(99, 102, 241, 0.4),
    0 10px 10px -5px rgba(99, 102, 241, 0.1);
}

.orders-btn {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  box-shadow: 
    0 10px 15px -3px rgba(16, 185, 129, 0.3),
    0 4px 6px -2px rgba(16, 185, 129, 0.1);
}

.orders-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 20px 25px -5px rgba(16, 185, 129, 0.4),
    0 10px 10px -5px rgba(16, 185, 129, 0.1);
}

.btn-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.btn-title {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.btn-subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
  font-weight: 400;
  margin-top: 0.25rem;
}

/* Filtres de période améliorés */
.period-filters {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  position: relative;
  z-index: 1;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  color: #4b5563;
  font-weight: 600;
  font-size: 1.05rem;
}

.filter-icon {
  font-size: 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quick-ranges {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.range-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  color: #4b5563;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.range-btn:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.range-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-color: transparent;
  box-shadow: 
    0 8px 20px -3px rgba(59, 130, 246, 0.4),
    0 4px 6px -2px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.range-icon {
  font-size: 1.1rem;
}

.custom-range {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 350px;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.1rem;
  pointer-events: none;
  z-index: 2;
}

.date-input.styled {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-family: inherit;
  font-size: 1rem;
  color: #1f2937;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.date-input.styled:hover {
  border-color: #d1d5db;
}

.date-input.styled:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.date-separator {
  color: #9ca3af;
  font-weight: 700;
  font-size: 1.2rem;
  margin: 0 0.5rem;
}

.apply-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.apply-btn:hover {
  background: linear-gradient(135deg, #0da271 0%, #2bb884 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 8px 20px -3px rgba(16, 185, 129, 0.4),
    0 4px 6px -2px rgba(16, 185, 129, 0.1);
}

.apply-icon {
  font-size: 1.2rem;
}

/* Auto-refresh */
.auto-refresh {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 14px;
  border: 2px solid #e5e7eb;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 32px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

input:checked + .slider:before {
  transform: translateX(28px);
}

.refresh-text {
  color: #4b5563;
  font-weight: 600;
  font-size: 1rem;
}

.last-update {
  color: #6b7280;
  font-size: 0.9rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  margin-left: auto;
}

/* KPI Cards améliorées */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.kpi-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.9);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.revenue-card::before { color: #10b981; }
.orders-card::before { color: #3b82f6; }
.average-card::before { color: #8b5cf6; }
.customers-card::before { color: #f59e0b; }

.kpi-card:hover::before {
  opacity: 1;
}

.kpi-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.kpi-card-inner {
  position: relative;
  z-index: 1;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.75rem;
}

.kpi-icon-wrapper {
  position: relative;
}

.kpi-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.kpi-icon.revenue {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.kpi-icon.orders {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.kpi-icon.average {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #5b21b6;
}

.kpi-icon.customers {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #9d174d;
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  background: inherit;
  border-radius: 20px;
  filter: blur(15px);
  opacity: 0.5;
  z-index: 1;
  transition: all 0.3s ease;
}

.kpi-card:hover .icon-glow {
  opacity: 0.7;
  filter: blur(20px);
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  backdrop-filter: blur(10px);
}

.kpi-trend.positive {
  background: rgba(16, 185, 129, 0.15);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.trend-icon {
  font-size: 0.8rem;
}

.kpi-content {
  margin-bottom: 1.75rem;
}

.kpi-title {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 1rem 0;
  line-height: 1;
  background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.kpi-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-period {
  font-size: 0.9rem;
  color: #9ca3af;
  font-weight: 500;
}

.kpi-change {
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.kpi-change.positive {
  background: rgba(16, 185, 129, 0.15);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.kpi-sparkline {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.kpi-card:hover .kpi-sparkline {
  opacity: 1;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.chart-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 2rem;
  border-radius: 24px;
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 15px 20px -5px rgba(0, 0, 0, 0.08),
    0 6px 8px -4px rgba(0, 0, 0, 0.04);
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
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chart-icon {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #4b5563;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.chart-select:hover {
  border-color: #d1d5db;
}

.chart-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  color: #4b5563;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-btn:hover {
  background: white;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.export-icon {
  font-size: 1rem;
}

.chart-container {
  height: 300px;
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
  gap: 1.25rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.product-rank:hover {
  background: white;
  border-color: #d1d5db;
  transform: translateX(4px);
}

.rank-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  font-size: 1.05rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
}

.product-stats .quantity {
  color: #6b7280;
  font-weight: 500;
}

.product-stats .revenue {
  color: #10b981;
  font-weight: 600;
}

.product-trend {
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  min-width: 70px;
  text-align: center;
}

.product-trend.positive {
  background: rgba(16, 185, 129, 0.15);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.product-trend.negative {
  background: rgba(239, 68, 68, 0.15);
  color: #991b1b;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Additional Analytics Sections */
.additional-analytics {
  margin-bottom: 2.5rem;
}

.additional-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.additional-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 
    0 8px 16px -4px rgba(0, 0, 0, 0.05),
    0 4px 8px -2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  height: 100%;
}

.additional-section.large {
  grid-column: span 2;
}

.additional-section:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 24px -6px rgba(0, 0, 0, 0.08),
    0 6px 12px -4px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  font-size: 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-badge {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

/* Proximity Rates */
.proximity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.proximity-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
}

.proximity-card:hover {
  background: white;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.proximity-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.proximity-icon.security {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.proximity-icon.system {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.proximity-icon.aid {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.proximity-icon.finance {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.proximity-icon.foreign {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #7c3aed;
}

.proximity-icon.progress {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #db2777;
}

.proximity-content {
  flex: 1;
  min-width: 0;
}

.proximity-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.proximity-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.proximity-trend {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  display: inline-block;
}

.proximity-trend.positive {
  background: rgba(16, 185, 129, 0.15);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* Definition Results and other sections */
.definition-results,
.category-content,
.action-content,
.distribution-content,
.startup-rates,
.welcome-definitions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item,
.category-item,
.action-item,
.distribution-item,
.startup-item,
.welcome-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 14px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.result-item:hover,
.category-item:hover,
.action-item:hover,
.distribution-item:hover,
.startup-item:hover,
.welcome-item:hover {
  background: white;
  border-color: #d1d5db;
  transform: translateX(2px);
}

.result-label,
.category-label,
.action-label,
.distribution-label,
.startup-label,
.welcome-label {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 600;
}

.result-value,
.category-value,
.action-value,
.distribution-value,
.startup-value,
.welcome-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

/* Detailed Stats */
.detailed-stats {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.03);
  margin-bottom: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.9);
  overflow: hidden;
}

.stats-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.stats-header h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stats-icon {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-tabs {
  display: flex;
  gap: 1rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  color: #4b5563;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.tab-icon {
  font-size: 1.1rem;
}

.stats-content {
  padding: 2rem;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Customer Stats */
.customer-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.metric-card {
  background: #f8fafc;
  border-radius: 18px;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
}

.metric-card:hover {
  background: white;
  border-color: #d1d5db;
  transform: translateY(-4px);
}

.metric-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #2563eb;
  flex-shrink: 0;
}

.metric-info h4 {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  line-height: 1;
}

.metric-change {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0;
}

.metric-change.positive {
  color: #10b981;
}

.customer-segments h4 {
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.segments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.segment-card {
  background: white;
  padding: 1.5rem;
  border-radius: 18px;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
}

.segment-card:hover {
  border-color: #d1d5db;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
}

.segment-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.segment-icon.vip {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.segment-icon.regular {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.segment-icon.new {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #db2777;
}

.segment-info h5 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.segment-count,
.segment-revenue {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.segment-count {
  color: #6b7280;
}

.segment-revenue {
  color: #10b981;
  font-weight: 600;
}

/* Products Table */
.products-table-container {
  overflow-x: auto;
  border-radius: 18px;
  border: 2px solid #e5e7eb;
  background: white;
}

.products-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.products-table th {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  color: #4b5563;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
  border-bottom: 2px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.products-table th:first-child {
  border-top-left-radius: 16px;
}

.products-table th:last-child {
  border-top-right-radius: 16px;
}

.products-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.products-table tbody tr:hover td {
  background: #f8fafc;
}

.products-table tbody tr:last-child td {
  border-bottom: none;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
}

.product-img-placeholder {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.product-cell strong {
  color: #1f2937;
  font-weight: 600;
  font-size: 1rem;
  display: block;
  margin-bottom: 0.25rem;
}

.product-sku {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
}

.sales-badge,
.revenue-badge,
.turnover-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
}

.sales-badge {
  color: #3b82f6;
  border: 1px solid #dbeafe;
}

.revenue-badge {
  color: #10b981;
  border: 1px solid #d1fae5;
}

.turnover-badge {
  color: #8b5cf6;
  border: 1px solid #ede9fe;
}

.stock-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 120px;
}

.stock-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.trend-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  min-width: 80px;
  text-align: center;
}

.trend-badge.positive {
  background: rgba(16, 185, 129, 0.15);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.trend-badge.negative {
  background: rgba(239, 68, 68, 0.15);
  color: #991b1b;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Sales Metrics */
.sales-metrics {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.metric-item {
  background: #f8fafc;
  border-radius: 18px;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
}

.metric-item:hover {
  background: white;
  border-color: #d1d5db;
  transform: translateY(-4px);
}

.metric-details h4 {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.metric-details .metric-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  line-height: 1;
}

.metric-subtitle {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0;
}

.sales-channels h4 {
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.channel-icon {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.channel-card {
  background: white;
  padding: 1.75rem;
  border-radius: 18px;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.channel-card:hover {
  border-color: #d1d5db;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
}

.channel-card .channel-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.channel-card .channel-icon.web {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.channel-card .channel-icon.mobile {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0ea5e9;
}

.channel-info h5 {
  margin: 0 0 0.75rem 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}

.channel-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 4px;
  transition: width 1s ease;
}

.channel-percent {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  min-width: 50px;
}

.channel-amount {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

/* Export Section */
.export-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.export-header {
  margin-bottom: 2rem;
  text-align: center;
}

.export-header h3 {
  margin: 0 0 0.75rem 0;
  color: #1f2937;
  font-size: 1.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.export-header-icon {
  font-size: 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.export-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.export-option {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 18px;
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.export-option:hover {
  background: white;
  border-color: #d1d5db;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.export-option.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: transparent;
  color: white;
}

.export-option.primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.2);
}

.export-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.export-option.primary .export-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.export-content {
  flex: 1;
}

.export-title {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.export-desc {
  display: block;
  font-size: 0.9rem;
  color: #6b7280;
}

.export-option.primary .export-desc {
  color: rgba(255, 255, 255, 0.9);
}

/* Responsive */
@media (max-width: 1400px) {
  .charts-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
  
  .additional-section.large {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1200px) {
  .header-content {
    flex-direction: column;
    gap: 2rem;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-start;
  }
  
  .additional-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 992px) {
  .admin-analytics {
    padding: 1.5rem;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .proximity-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .admin-analytics {
    padding: 1rem;
  }
  
  .analytics-header {
    padding: 1.75rem;
  }
  
  .header-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
  
  .header-title h1 {
    font-size: 1.75rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .date-input-group {
    min-width: 100%;
  }
  
  .custom-range {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .apply-btn {
    width: 100%;
    justify-content: center;
  }
  
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  
  .proximity-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .stats-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    width: 100%;
  }
  
  .export-options {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .analytics-header {
    padding: 1.5rem;
  }
  
  .title-icon {
    width: 56px;
    height: 56px;
    font-size: 2rem;
  }
  
  .quick-ranges {
    gap: 0.5rem;
  }
  
  .range-btn {
    min-width: 100px;
    padding: 0.75rem 1rem;
  }
  
  .proximity-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-row,
  .segments-grid,
  .channels-grid {
    grid-template-columns: 1fr;
  }
  
  .products-table-container {
    border-radius: 14px;
  }
  
  .products-table th,
  .products-table td {
    padding: 1rem;
  }
}
</style>