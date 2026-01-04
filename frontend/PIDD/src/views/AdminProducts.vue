<template>
  <div class="admin-dashboard">
    <!-- Sidebar Navigation -->
    <aside class="admin-sidebar" :class="{ 'show': sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="admin-logo">
          <span class="logo-icon">🛍️</span>
          <span class="logo-text">Admin Dashboard</span>
        </div>
        <div class="admin-profile">
          <div class="profile-avatar">
            {{ getUserInitials() }}
          </div>
          <div class="profile-info">
            <h3>{{ user?.name || user?.username || 'Admin' }} {{ user?.lastName || '' }}</h3>
            <span class="role-badge" :class="user?.is_admin ? 'admin' : 'moderator'">
              {{ user?.is_admin ? 'Administrateur' : 'Utilisateur' }}
            </span>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
       

        <div class="nav-section">
          <h4 class="section-title">Gestion</h4>
          <router-link to="/admin/products" class="nav-item" active-class="active">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Produits</span>
            <span class="nav-badge">{{ products.length }}</span>
          </router-link>
          
          <router-link to="/admin/orders" class="nav-item" active-class="active">
            <span class="nav-icon">📋</span>
            <span class="nav-text">Commandes</span>
            
          </router-link>
          
        <!--   <router-link to="/admin/users" class="nav-item" active-class="active">
            <span class="nav-icon">👥</span>
            <span class="nav-text">Utilisateurs</span>
          </router-link> -->
        </div>

        <div class="nav-section">
          <h4 class="section-title">Analyse</h4>
          <router-link to="/admin/analytics" class="nav-item" active-class="active">
            <span class="nav-icon">📈</span>
            <span class="nav-text">Analytics</span>
          </router-link>
          
          <router-link to="/admin/reports" class="nav-item" active-class="active">
            <span class="nav-icon">📄</span>
            <span class="nav-text">Rapports</span>
          </router-link>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn">
          <span class="logout-icon">🚪</span>
          <span class="logout-text">Déconnexion</span>
        </button>
        <div class="version-info">v1.0.0</div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <!-- Top Header -->
      <header class="admin-header">
        <div class="header-left">
          <button class="menu-toggle" @click="toggleSidebar">
            <span class="menu-icon">☰</span>
          </button>
          <h1 class="page-title">Gestion des Produits</h1>
        </div>
        
        <div class="header-right">
          <div class="header-search">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Rechercher un produit..."
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
          
          <div class="header-actions">
            <button class="header-btn notification-btn">
              <span class="btn-icon">🔔</span>
              <span class="notification-count">{{ notifications.length }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card add-product-card" @click="showAddModal">
  <div class="stat-icon add">➕</div>
  <div class="stat-content">
    <h3>Ajouter un produit</h3>
  </div>
</div>

        <div class="stat-card">
          <div class="stat-icon total">📦</div>
          <div class="stat-content">
            <h3>Total Produits</h3>
            <p class="stat-number">{{ products.length }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon low">⚠️</div>
          <div class="stat-content">
            <h3>Stock Faible</h3>
            <p class="stat-number">{{ lowStockCount }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon category">🏷️</div>
          <div class="stat-content">
            <h3>Catégories</h3>
            <p class="stat-number">3</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon value">💰</div>
          <div class="stat-content">
            <h3>Valeur Stock</h3>
            <p class="stat-number">{{ formatPrice(totalStockValue) }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-card">
        <div class="card-header">
          <h2>Liste des Produits</h2>
          <div class="card-actions">
            <button @click="showAddModal" class="action-btn primary">
              <span class="btn-icon">➕</span>
              Ajouter un produit
            </button>
            <div class="view-controls">
              <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
                <span class="btn-icon">▦</span>
              </button>
              <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
                <span class="btn-icon">≡</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div v-if="viewMode === 'list'" class="products-table">
          <table>
            <thead>
              <tr>
                <th class="check-col">
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                </th>
                <th class="image-col">Image</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in paginatedProducts" :key="product.id" :class="{ selected: selectedProducts.includes(product.id) }">
                <td>
                  <input type="checkbox" :value="product.id" v-model="selectedProducts">
                </td>
                <td>
                  <img :src="getProductImageUrl(product.img)" :alt="product.name" class="product-image">
                </td>
                <td>
                  <div class="product-info">
                    <h4 class="product-name">{{ product.name }}</h4>
                    <p class="product-desc">{{ product.description }}</p>
                  </div>
                </td>
                <td>
                  <span class="category-tag" :class="'cat-' + product.category">
                    {{ getCategoryName(product.category) }}
                  </span>
                </td>
                <td class="price-cell">
                  {{ formatPrice(product.price) }}
                </td>
                <td>
                  <div class="stock-info">
                    <div class="stock-bar">
                      <div class="stock-fill" :style="{ width: getStockPercentage(product) + '%' }"></div>
                    </div>
                    <span :class="{ 'low-stock': product.quantity < 10 }">
                      {{ product.quantity }} unités
                    </span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" :class="getProductStatus(product)">
                    {{ getProductStatus(product) === 'active' ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="editProduct(product)" class="action-btn edit-btn" title="Modifier">
                      ✏️
                    </button>
                    <button @click="duplicateProduct(product)" class="action-btn duplicate-btn" title="Dupliquer">
                      📋
                    </button>
                    <button @click="deleteProduct(product.id)" class="action-btn delete-btn" title="Supprimer">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Products Grid -->
        <div v-else class="products-grid">
          <div class="grid-header">
            <div class="grid-info">
              {{ filteredProducts.length }} produits affichés
            </div>
            <div class="grid-sort">
              <select v-model="sortBy" class="sort-select">
                <option value="name">Trier par nom</option>
                <option value="price">Trier par prix</option>
                <option value="quantity">Trier par stock</option>
              </select>
            </div>
          </div>
          
          <div class="grid-container">
            <div 
              v-for="product in paginatedProducts" 
              :key="product.id" 
              class="product-card"
            >
              <div class="product-card-header">
                <input type="checkbox" :value="product.id" v-model="selectedProducts" class="card-checkbox">
                <img :src="getProductImageUrl(product.img)" :alt="product.name" class="card-image">
                <div class="card-actions">
                  <button @click="editProduct(product)" class="card-action-btn edit">
                    ✏️
                  </button>
                  <button @click="deleteProduct(product.id)" class="card-action-btn delete">
                    🗑️
                  </button>
                </div>
              </div>
              
              <div class="product-card-body">
                <div class="product-category">
                  <span class="category-badge" :class="'cat-' + product.category">
                    {{ getCategoryName(product.category) }}
                  </span>
                </div>
                
                <h3 class="product-title">{{ product.name }}</h3>
                <p class="product-description">{{ product.description }}</p>
                
                <div class="product-meta">
                  <div class="meta-item">
                    <span class="meta-label">Prix:</span>
                    <span class="meta-value">{{ formatPrice(product.price) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Stock:</span>
                    <span class="meta-value" :class="{ 'low': product.quantity < 10 }">
                      {{ product.quantity }} unités
                    </span>
                  </div>
                </div>
                
                <div class="product-status">
                  <span class="status-dot" :class="getProductStatus(product)"></span>
                  <span class="status-text">{{ product.quantity > 0 ? 'En stock' : 'Rupture' }}</span>
                </div>
              </div>
              
              <div class="product-card-footer">
                <button @click="editProduct(product)" class="card-btn edit">
                  Modifier
                </button>
                <button @click="duplicateProduct(product)" class="card-btn duplicate">
                  Dupliquer
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedProducts.length > 0" class="bulk-actions">
          <div class="bulk-info">
            {{ selectedProducts.length }} produit(s) sélectionné(s)
          </div>
          <div class="bulk-buttons">
            <button @click="updateStockBulk" class="bulk-btn stock">
              📦 Mettre à jour le stock
            </button>
            <button @click="deleteSelected" class="bulk-btn delete">
              🗑️ Supprimer
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            ← Précédent
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in totalPages" 
              :key="page" 
              @click="currentPage = page"
              :class="{ active: currentPage === page }"
              class="page-number"
            >
              {{ page }}
            </button>
          </div>
          
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
            Suivant →
          </button>
        </div>
      </div>
    </main>

    <!-- Modal pour ajouter/modifier un produit -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Modifier le produit' : 'Ajouter un produit' }}</h2>
          <button @click="showModal = false" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Nom du produit *</label>
            <input v-model="form.name" type="text" class="form-input" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Prix (€) *</label>
              <input v-model="form.price" type="number" min="0" step="0.01" class="form-input" required>
            </div>
            
            <div class="form-group">
              <label>Quantité en stock *</label>
              <input v-model="form.quantity" type="number" min="0" class="form-input" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>Catégorie *</label>
            <select v-model="form.category" class="form-select" required>
              <option value="">Sélectionner une catégorie</option>
              <option value="1">Homme</option>
              <option value="2">Femme</option>
              <option value="3">Enfants</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Image *</label>
            <select v-model="form.img" class="form-select" required>
              <option value="">Sélectionner une image</option>
              <option value="noir.png">T-shirt Noir Homme</option>
              <option value="blanc.png">T-shirt Blanc Homme</option>
              <option value="gris.png">T-shirt Gris Homme</option>
              <option value="rosefemme.png">T-shirt Rose Femme</option>
              <option value="blancfemme.png">T-shirt Blanc Femme</option>
              <option value="noirfemme.png">T-shirt Noir Femme</option>
              <option value="enfantbleu.png">T-shirt Bleu Enfant</option>
              <option value="enfantrouge.png">T-shirt Rouge Enfant</option>
            </select>
            <div v-if="form.img" class="image-preview">
              <img :src="getProductImageUrl(form.img)" alt="Preview" class="preview-img">
            </div>
          </div>
          
          <div class="form-group">
            <label>Description *</label>
            <textarea v-model="form.description" rows="3" class="form-textarea" required></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showModal = false" class="btn btn-secondary">Annuler</button>
          <button @click="saveProduct" class="btn btn-primary">
            {{ editingProduct ? 'Mettre à jour' : 'Ajouter' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_PREFIX = '/product'; // Préfixe de vos routes produits

import noir from '../assets/noir.png';
import blanc from '../assets/blanc.png';
import rosefemme from '../assets/rosefemme.png';
import blancfemme from '../assets/blancfemme.png';
import noirfemme from '../assets/noirfemme.png';
import enfantbleu from '../assets/enfantbleu.png';
import enfantrouge from '../assets/enfantrouge.png';
import gris from '../assets/gris.png';

export default {
  name: 'AdminProducts',
  props: ['user', 'setUser'],
  data() {
    return {
      products: [],
      orders: [],
      users: [],
      notifications: [],
      searchQuery: '',
      showModal: false,
      editingProduct: null,
      loading: false,
      form: {
        name: '',
        price: 0,
        quantity: 0,
        category: '',
        img: '',
        description: ''
      },
      formErrors: {},
      notification: {
        show: false,
        message: '',
        type: 'success'
      },
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
      selectedProducts: [],
      selectAll: false,
      viewMode: 'list',
      sortBy: 'name',
      currentPage: 1,
      itemsPerPage: 10,
      sidebarCollapsed: false
    };
  },
  computed: {
    filteredProducts() {
      if (!this.searchQuery) return this.products;
      const query = this.searchQuery.toLowerCase();
      return this.products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    },
    sortedProducts() {
      const sorted = [...this.filteredProducts];
      switch (this.sortBy) {
        case 'name':
          return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'price':
          return sorted.sort((a, b) => b.price - a.price);
        case 'quantity':
          return sorted.sort((a, b) => b.quantity - a.quantity);
        default:
          return sorted;
      }
    },
    lowStockCount() {
      return this.products.filter(p => p.quantity < 10).length;
    },
    totalStockValue() {
      return this.products.reduce((total, product) => {
        return total + (product.price * product.quantity);
      }, 0);
    },
    pendingOrdersCount() {
      return this.orders.filter(order => order.status === 'pending').length;
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedProducts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      await this.loadProducts();
      await this.loadOrders();
      await this.loadUsers();
    },
    async loadProducts() {
  try {
    this.loading = true;
    console.log('🔄 Chargement des produits depuis /product/allproduct...');
    
    const response = await axios.get('http://localhost:3000/product/allproduct', {
      headers: this.getAuthHeaders()
    });
    
    console.log('✅ Réponse API:', response.data);
    
    // CORRECTION: Votre contrôleur retourne {success: true, data: [...]}
    if (response.data && response.data.success === true) {
      this.products = response.data.data || [];
      console.log(`✅ ${this.products.length} produits chargés`);
    } else {
      this.products = [];
      console.warn('⚠️ Réponse API sans success:true', response.data);
    }
  } catch (error) {
    console.error('❌ Erreur chargement produits:', error);
    
    // Debug détaillé
    if (error.response) {
      console.error('📊 Détails erreur:');
      console.error('- Status:', error.response.status);
      console.error('- Data:', error.response.data);
      console.error('- URL:', error.config?.url);
    }
    
    this.products = [];
    this.showNotification(`Erreur: ${error.message}`, 'error');
  } finally {
    this.loading = false;
  }
},
    async loadOrders() {
      try {
        const response = await axios.get(`${API_URL}/orders`, {
          headers: this.getAuthHeaders()
        });
        this.orders = response.data || [];
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
        this.orders = [];
      }
    },
   // Dans AdminProducts.vue, corrigez la méthode loadUsers :
async loadUsers() {
  try {
    console.log('Chargement des utilisateurs...');
    
    // Assurez-vous que la route /users existe dans votre backend
    const response = await axios.get(`${API_URL}/users`, {
      headers: this.getAuthHeaders()
    });
    
    console.log('Réponse utilisateurs:', response.data);
    
    if (response.data && response.data.success) {
      this.users = response.data.data || [];
      console.log(`${this.users.length} utilisateurs chargés`);
    } else {
      this.users = [];
      console.warn('Aucun utilisateur trouvé');
    }
  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error);
    this.users = [];
    
    // Ne montrez pas d'erreur si c'est juste que la route n'existe pas encore
    if (error.response && error.response.status === 404) {
      console.log('Route /users non implémentée pour le moment');
    }
  }
},
    getAuthHeaders() {
      const token = localStorage.getItem('token');
      return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };
    },
    getProductImageUrl(imgName) {
      return this.imageMap[imgName] || '';
    },
    getCategoryName(category) {
      const categories = {
        1: 'Homme',
        2: 'Femme',
        3: 'Enfants'
      };
      return categories[category] || 'Non catégorisé';
    },
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    },
    getStockPercentage(product) {
      const maxStock = 100;
      return Math.min((product.quantity / maxStock) * 100, 100);
    },
    getProductStatus(product) {
      return product.quantity > 0 ? 'active' : 'inactive';
    },
    showAddModal() {
      this.editingProduct = null;
      this.form = {
        name: '',
        price: 0,
        quantity: 0,
        category: '',
        img: '',
        description: ''
      };
      this.formErrors = {};
      this.showModal = true;
    },
    editProduct(product) {
      this.editingProduct = product;
      this.form = { ...product };
      this.formErrors = {};
      this.showModal = true;
    },
 async saveProduct() {
  console.log('💾 saveProduct appelé');
  console.log('✏️ Édition:', this.editingProduct ? `ID: ${this.editingProduct.id}` : 'Nouveau produit');
  console.log('📝 Données formulaire:', this.form);
  
  // Validation
  if (!this.validateForm()) {
    console.log('❌ Validation échouée:', this.formErrors);
    return;
  }
  
  try {
    this.loading = true;
    
    if (this.editingProduct) {
      console.log(`🔄 Mise à jour du produit ${this.editingProduct.id}`);
      
      // Mise à jour - formatage des données
      const updateData = {
        name: this.form.name,
        price: parseFloat(this.form.price),
        quantity: parseInt(this.form.quantity),
        category: parseInt(this.form.category),
        img: this.form.img,
        description: this.form.description
      };
      
      console.log('📤 Données envoyées pour update:', updateData);
      
      const response = await axios.put(
        `http://localhost:3000/product/update/${this.editingProduct.id}`,
        updateData,
        { 
          headers: this.getAuthHeaders(),
          timeout: 10000 // 10 secondes timeout
        }
      );
      
      console.log('📥 Réponse update:', response.data);
      
      if (response.data && response.data.success === true) {
        // Mettre à jour localement avec les données de la réponse
        const index = this.products.findIndex(p => p.id === this.editingProduct.id);
        if (index !== -1) {
          this.products[index] = response.data.data;
          console.log('✅ Produit mis à jour localement');
        }
        this.showNotification('Produit mis à jour avec succès', 'success');
      } else {
        throw new Error(response.data?.error || 'Erreur lors de la mise à jour');
      }
      
    } else {
      console.log('🔄 Création d\'un nouveau produit');
      
      // Création - formatage des données
      const createData = {
        name: this.form.name,
        price: parseFloat(this.form.price),
        quantity: parseInt(this.form.quantity),
        category: parseInt(this.form.category),
        img: this.form.img,
        description: this.form.description
      };
      
      console.log('📤 Données envoyées pour création:', createData);
      
      const response = await axios.post(
        'http://localhost:3000/product/addAdmin',
        createData,
        { 
          headers: this.getAuthHeaders(),
          timeout: 10000
        }
      );
      
      console.log('📥 Réponse création:', response.data);
      
      if (response.data && response.data.success === true) {
        // Ajouter le nouveau produit au début de la liste
        this.products = [response.data.data, ...this.products];
        console.log('✅ Produit ajouté localement');
        this.showNotification('Produit ajouté avec succès', 'success');
      } else {
        throw new Error(response.data?.error || 'Erreur lors de la création');
      }
    }
    
    // Fermer le modal et réinitialiser
    this.showModal = false;
    this.resetForm();
    
  } catch (error) {
    console.error('❌ Erreur saveProduct:', error);
    
    // Debug détaillé
    if (error.response) {
      console.error('📊 Détails erreur:');
      console.error('- Status:', error.response.status);
      console.error('- Data:', error.response.data);
      console.error('- URL:', error.config?.url);
    }
    
    this.showNotification(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
  } finally {
    this.loading = false;
  }
},

async deleteProduct(id) {
  console.log(`🗑️ deleteProduct(${id}) appelé`);
  
  if (!confirm('Supprimer ce produit ?')) return;
  
  try {
    console.log(`📤 Envoi DELETE pour produit ${id}`);
    
    const response = await axios.delete(
      'http://localhost:3000/product/deleteProduct',
      { 
        data: { productId: id },
        headers: this.getAuthHeaders()
      }
    );
    
    console.log('📥 Réponse DELETE:', response.data);
    
    if (response.data && response.data.success) {
      console.log('✅ Suppression réussie');
      this.products = this.products.filter(p => p.id !== id);
      this.showNotification('Produit supprimé', 'success');
    }
  } catch (error) {
    console.error('❌ Erreur DELETE:', error.response?.data || error.message);
    this.showNotification(`Erreur: ${error.message}`, 'error');
  }
},

    async duplicateProduct(product) {
      try {
        const duplicatedProduct = {
          name: product.name + ' (Copie)',
          price: product.price,
          quantity: product.quantity,
          category: product.category,
          img: product.img,
          description: product.description
        };
        
        const response = await axios.post(
          `${API_URL}/product/addAdmin`,
          duplicatedProduct,
          { headers: this.getAuthHeaders() }
        );
        
        if (response.data && response.data.success) {
          this.products = [response.data.data, ...this.products];
          this.showNotification('Produit dupliqué avec succès', 'success');
        } else {
          throw new Error(response.data?.message || 'Erreur lors de la duplication');
        }
      } catch (error) {
        console.error('Erreur duplication produit:', error);
        this.showNotification(`Erreur: ${error.message}`, 'error');
      }
    },
    validateForm() {
      this.formErrors = {};
      if (!this.form.name.trim()) {
        this.formErrors.name = 'Le nom est requis';
      }
      if (!this.form.price || this.form.price <= 0) {
        this.formErrors.price = 'Le prix doit être supérieur à 0';
      }
      if (!this.form.quantity || this.form.quantity < 0) {
        this.formErrors.quantity = 'La quantité est requise';
      }
      if (!this.form.category) {
        this.formErrors.category = 'La catégorie est requise';
      }
      if (!this.form.img) {
        this.formErrors.img = "L'image est requise";
      }
      if (!this.form.description.trim()) {
        this.formErrors.description = 'La description est requise';
      }
      return Object.keys(this.formErrors).length === 0;
    },
    showNotification(message, type = 'success') {
      this.notification = {
        show: true,
        message,
        type
      };
      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    },
    getUserInitials() {
      if (!this.user) return 'AD';
      const first = (this.user.name || this.user.username || 'A')[0] || '';
      const last = (this.user.lastName || '')[0] || '';
      return (first + last).toUpperCase();
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedProducts = this.filteredProducts.map(p => p.id);
      } else {
        this.selectedProducts = [];
      }
    },
    resetForm() {
      this.form = {
        name: '',
        price: 0,
        quantity: 0,
        category: '',
        img: '',
        description: ''
      };
      this.editingProduct = null;
      this.formErrors = {};
    },
    async updateStockBulk() {
      if (this.selectedProducts.length === 0) {
        this.showNotification('Veuillez sélectionner au moins un produit', 'error');
        return;
      }
      
      const newStock = prompt(`Mettre à jour le stock pour ${this.selectedProducts.length} produit(s).\nEntrez la nouvelle quantité:`);
      if (newStock === null) return;
      
      const quantity = parseInt(newStock);
      
      if (isNaN(quantity) || quantity < 0) {
        this.showNotification('Veuillez entrer un nombre valide (≥ 0)', 'error');
        return;
      }
      
      try {
        for (const productId of this.selectedProducts) {
          const product = this.products.find(p => p.id === productId);
          if (product) {
            await axios.put(
              `${API_URL}/product/update/${productId}`,
              { ...product, quantity },
              { headers: this.getAuthHeaders() }
            );
          }
        }
        
        this.products = this.products.map(product => {
          if (this.selectedProducts.includes(product.id)) {
            return { ...product, quantity: quantity };
          }
          return product;
        });
        
        this.showNotification(`Stock mis à jour pour ${this.selectedProducts.length} produit(s)`, 'success');
        this.selectedProducts = [];
        this.selectAll = false;
      } catch (error) {
        console.error('Erreur mise à jour stock:', error);
        this.showNotification(`Erreur: ${error.message}`, 'error');
      }
    },
    async deleteSelected() {
      if (this.selectedProducts.length === 0) {
        this.showNotification('Veuillez sélectionner au moins un produit', 'error');
        return;
      }
      
      if (!confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedProducts.length} produit(s) ?`)) return;
      
      try {
        for (const productId of this.selectedProducts) {
          await axios.delete(
            `${API_URL}/product/deleteProduct`,
            {
              data: { id: productId },
              headers: this.getAuthHeaders()
            }
          );
        }
        
        this.products = this.products.filter(p => !this.selectedProducts.includes(p.id));
        this.showNotification('Produits supprimés avec succès', 'success');
        this.selectedProducts = [];
        this.selectAll = false;
      } catch (error) {
        console.error('Erreur suppression produits:', error);
        this.showNotification(`Erreur: ${error.message}`, 'error');
      }
    },
    logout() {
      this.setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  },
  watch: {
    selectedProducts(newVal) {
      this.selectAll = newVal.length === this.filteredProducts.length && this.filteredProducts.length > 0;
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* Sidebar */
.admin-sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 1.8rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 700;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.notification.success {
  background: #10b981;
}

.notification.error {
  background: #ef4444;
}

.notification.warning {
  background: #f59e0b;
}
.profile-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.profile-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.role-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  font-weight: 500;
}

.role-badge.admin {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.5px;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.nav-icon {
  font-size: 1.2rem;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  flex: 1;
  font-weight: 500;
}

.nav-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-radius: 12px;
  font-weight: 600;
}

.nav-badge.new {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.version-info {
  text-align: center;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 1rem;
}

/* Main Content */
.admin-main {
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.admin-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #4b5563;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-search {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.header-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.header-btn:hover {
  background: #f8fafc;
  border-color: #d1d5db;
}

.notification-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
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

.stat-icon.low {
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
  color: #d97706;
}

.stat-icon.category {
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  color: #8b5cf6;
}

.stat-icon.value {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  color: #10b981;
}

.stat-content h3 {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Main Content Card */
.content-card {
  background: white;
  margin: 0 2rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.view-controls {
  display: flex;
  gap: 0.25rem;
  background: #f8fafc;
  padding: 0.25rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.view-btn {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.3s ease;
}

.view-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Table Styles */
.products-table {
  flex: 1;
  overflow-x: auto;
}

.products-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.products-table thead {
  background: #f8fafc;
}

.products-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #4b5563;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.products-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.products-table tr:hover {
  background: #f9fafb;
}

.products-table tr.selected {
  background: #f0f9ff;
}

.check-col {
  width: 40px;
}

.image-col {
  width: 80px;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  background: #f8fafc;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.product-brand {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.product-desc {
  color: #9ca3af;
  font-size: 0.8rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category-tag.cat-1 {
  background: #dbeafe;
  color: #1e40af;
}

.category-tag.cat-2 {
  background: #fce7f3;
  color: #9d174d;
}

.category-tag.cat-3 {
  background: #dcfce7;
  color: #166534;
}

.price-cell {
  font-weight: 600;
  color: #1f2937;
}

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 120px;
}

.stock-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  background: #10b981;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stock-info span {
  font-size: 0.875rem;
  color: #4b5563;
}

.stock-info .low-stock {
  color: #ef4444;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons button {
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

.action-buttons .edit-btn {
  background: #fef3c7;
  color: #d97706;
}

.action-buttons .edit-btn:hover {
  background: #fde68a;
}

.action-buttons .duplicate-btn {
  background: #dbeafe;
  color: #1e40af;
}

.action-buttons .duplicate-btn:hover {
  background: #bfdbfe;
}

.action-buttons .delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.action-buttons .delete-btn:hover {
  background: #fecaca;
}

/* Grid View */
.products-grid {
  padding: 1.5rem;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.grid-info {
  color: #6b7280;
  font-size: 0.9rem;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #4b5563;
  font-size: 0.9rem;
  cursor: pointer;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.product-card-header {
  position: relative;
  height: 180px;
  background: #f8fafc;
}

.card-checkbox {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2;
}

.card-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.card-action-btn.edit:hover {
  background: #3b82f6;
  color: white;
}

.card-action-btn.delete:hover {
  background: #ef4444;
  color: white;
}

.product-card-body {
  padding: 1.5rem;
}

.product-category {
  margin-bottom: 0.75rem;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category-badge.cat-1 {
  background: #dbeafe;
  color: #1e40af;
}

.category-badge.cat-2 {
  background: #fce7f3;
  color: #9d174d;
}

.category-badge.cat-3 {
  background: #dcfce7;
  color: #166534;
}

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.product-brand {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
}

.product-description {
  color: #9ca3af;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.8rem;
  color: #6b7280;
}

.meta-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1f2937;
}

.meta-value.low {
  color: #ef4444;
}

.product-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.active {
  background: #10b981;
  animation: pulse 2s infinite;
}

.status-dot.inactive {
  background: #ef4444;
}

.status-text {
  font-size: 0.9rem;
  color: #6b7280;
}

.product-card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 0.5rem;
}

.card-btn {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #4b5563;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-btn.edit:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.card-btn.duplicate:hover {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

/* Bulk Actions */
.bulk-actions {
  padding: 1rem 2rem;
  background: #f0f9ff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-info {
  color: #3b82f6;
  font-weight: 500;
}

.bulk-buttons {
  display: flex;
  gap: 0.5rem;
}

.bulk-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bulk-btn.export {
  background: #dbeafe;
  color: #1e40af;
}

.bulk-btn.export:hover {
  background: #bfdbfe;
}

.bulk-btn.stock {
  background: #dcfce7;
  color: #166534;
}

.bulk-btn.stock:hover {
  background: #bbf7d0;
}

.bulk-btn.delete {
  background: #fee2e2;
  color: #991b1b;
}

.bulk-btn.delete:hover {
  background: #fecaca;
}

/* Pagination */
.pagination {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
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

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #4b5563;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.page-number:hover {
  background: #f8fafc;
}

.page-number.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.preview-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Notifications */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: #10b981;
}

.notification.error {
  background: #ef4444;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }
  
  .admin-sidebar.show {
    transform: translateX(0);
  }
  
  .admin-main {
    margin-left: 0;
  }
  
  .menu-toggle {
    display: block;
  }
  
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .header-search {
    flex: 1;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 1rem;
    gap: 1rem;
  }
  
  .content-card {
    margin: 0 1rem 1rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .products-table {
    font-size: 0.9rem;
  }
  
  .products-table th,
  .products-table td {
    padding: 0.75rem;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .bulk-actions {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  @media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .header-search {
    flex: 1;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 1rem;
    gap: 1rem;
  }
  
  .content-card {
    margin: 0 1rem 1rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .products-table {
    font-size: 0.9rem;
  }
  
  .products-table th,
  .products-table td {
    padding: 0.75rem;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .bulk-actions {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
}
</style>