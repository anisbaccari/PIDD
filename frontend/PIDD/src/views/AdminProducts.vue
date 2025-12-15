<template>
  <div class="admin-page">
  
    <div class="admin-content">
      <h1 class="title">Gestion des Produits</h1>

      <!-- Barre d'actions -->
      <div class="admin-actions">
        <button @click="openCreateModal" class="btn-primary">
          + Ajouter un produit
        </button>
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            placeholder="Rechercher un produit..." 
            class="search-input"
          />
        </div>
      </div>

      <!-- Liste des produits -->
      <div class="products-table">
        <div class="table-header">
          <div class="table-row header-row">
            <div class="table-cell">Image</div>
            <div class="table-cell">Nom</div>
            <div class="table-cell">Marque</div>
            <div class="table-cell">Prix</div>
            <div class="table-cell">Catégorie</div>
            <div class="table-cell">Actions</div>
          </div>
        </div>

        <div class="table-body">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="table-row"
          >
            <div class="table-cell image-cell">
              <img :src="getProductImage(product.img)" :alt="product.name" class="product-thumb" />
            </div>
            <div class="table-cell name-cell">
              <strong>{{ product.name }}</strong>
            </div>
            <div class="table-cell">
              {{ product.brand }}
            </div>
            <div class="table-cell">
              {{ formatPrice(product.price) }}
            </div>
            <div class="table-cell">
              <span class="category-badge">{{ getCategoryName(product.category) }}</span>
            </div>
            <div class="table-cell actions-cell">
              <button @click="editProduct(product)" class="btn-edit">
                ✏️ Modifier
              </button>
              <button @click="deleteProduct(product.id)" class="btn-delete">
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si aucun produit -->
      <div v-if="filteredProducts.length === 0" class="empty-state">
        <p>Aucun produit trouvé</p>
      </div>
    </div>

    <!-- Modal d'édition/ajout -->

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Modifier le produit' : 'Ajouter un produit' }}</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>

        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nom du produit *</label>
              <input 
                id="name"
                v-model="form.name" 
                type="text" 
                required 
                placeholder="Ex: T-shirt Noir Classique"
              />
            </div>

<!--             <div class="form-group">
              <label for="brand">Marque *</label>
              <input 
                id="brand"
                v-model="form.brand" 
                type="text" 
                required 
                placeholder="Ex: Nike"
              />
            </div>
 -->
            <div class="form-group">
              <label for="price">Prix (€) *</label>
              <input 
                id="price"
                v-model="form.price" 
                type="number" 
                step="0.01" 
                min="0" 
                required 
                placeholder="Ex: 29.99"
              />
            </div>

            <div class="form-group">
              <label for="categoryId">Catégorie *</label>
              <select id="categoryId" v-model="form.categoryId" required>
                <option value="">Sélectionnez une catégorie</option>
                <option value="1">Homme</option>
                <option value="2">Femme</option>
                <option value="3">Enfant</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="image">Image</label>
              <select id="image" v-model="form.img">
                <option value="">Sélectionnez une image</option>
                <option value="noir.png">T-shirt Noir</option>
                <option value="blanc.png">T-shirt Blanc</option>
                <option value="gris.png">T-shirt Gris</option>
                <option value="rosefemme.png">T-shirt Rose Femme</option>
                <option value="blancfemme.png">T-shirt Blanc Femme</option>
                <option value="noirfemme.png">T-shirt Noir Femme</option>
                <option value="enfantbleu.png">T-shirt Bleu Enfant</option>
                <option value="enfantrouge.png">T-shirt Rouge Enfant</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="description">Description</label>
              <textarea 
                id="description"
                v-model="form.description" 
                rows="4" 
                placeholder="Description du produit..."
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">
              Annuler
            </button>
            <button type="submit" class="btn-save" :disabled="loading">
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!--  MODEL CREATINO PRODUIT  -->

    <div v-if="showAddForm" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Modifier le produit' : 'Ajouter un produit' }}</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>

        <form @submit.prevent="createProduct" class="product-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nom du produit *</label>
              <input 
                id="name"
                v-model="form.name" 
                type="text" 
                required 
                placeholder="Ex: T-shirt Noir Classique"
              />
            </div>

<!--             <div class="form-group">
              <label for="brand">Marque *</label>
              <input 
                id="brand"
                v-model="form.brand" 
                type="text" 
                required 
                placeholder="Ex: Nike"
              />
            </div>
 -->
            <div class="form-group">
              <label for="price">Prix (€) *</label>
              <input 
                id="price"
                v-model="form.price" 
                type="number" 
                step="0.01" 
                min="0" 
                required 
                placeholder="Ex: 29.99"
              />
            </div>
            <div class="form-group">
              <label for="price">Quantity  *</label>
              <input 
                id="quantity"
                v-model="form.quantity" 
                type="number" 
                step="1" 
                min="1" 
                required 
                placeholder="Ex: 1"
              />
            </div>
            <div class="form-group">
              <label for="categoryId">Catégorie *</label>
              <select id="categoryId" v-model="form.category" required>
                <option value="">Sélectionnez une catégorie</option>
                <option value="1">Homme</option>
                <option value="2">Femme</option>
                <option value="3">Enfant</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="image">Image</label>
              <select id="image" v-model="form.img">
                <option value="">Sélectionnez une image</option>
                <option value="noir.png">T-shirt Noir</option>
                <option value="blanc.png">T-shirt Blanc</option>
                <option value="gris.png">T-shirt Gris</option>
                <option value="rosefemme.png">T-shirt Rose Femme</option>
                <option value="blancfemme.png">T-shirt Blanc Femme</option>
                <option value="noirfemme.png">T-shirt Noir Femme</option>
                <option value="enfantbleu.png">T-shirt Bleu Enfant</option>
                <option value="enfantrouge.png">T-shirt Rouge Enfant</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="description">Description</label>
              <textarea 
                id="description"
                v-model="form.description" 
                rows="4" 
                placeholder="Description du produit..."
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">
              Annuler
            </button>
            <button type="submit" class="btn-save" :disabled="loading">
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>


    <!-- Notifications -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
// Import des images
import noir from '../assets/noir.png'
import blanc from '../assets/blanc.png'
import rosefemme from '../assets/rosefemme.png'
import blancfemme from '../assets/blancfemme.png'
import noirfemme from '../assets/noirfemme.png'
import enfantbleu from '../assets/enfantbleu.png'
import enfantrouge from '../assets/enfantrouge.png'
import gris from '../assets/gris.png'
import api from '../api.js'


export default {
  name: 'AdminProducts',
  props: ['user', 'setUser'],
  data() {
    return {
      products: [],
      searchQuery: '',
      showModal: false,
      showAddForm: false,
      editingProduct: null,
      loading: false,
      form: {
        id:'',
        name: '',
        /* brand: '', */
        price: 0,
        category: '',
        img: '',
        description: ''
      },
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
      }
    }
  },
  computed: {
    filteredProducts() {
      if (!this.searchQuery) return this.products;
      
      const query = this.searchQuery.toLowerCase();
      return this.products.filter(product => 
        product.name.toLowerCase().includes(query)
      );
    }
  },
  async mounted() {
    await this.loadProducts();
  },
  methods: {
    async loadProducts() {
      try {
            console.log("[Admin]============");

            const token = localStorage.getItem("token");
            if (token == '') {
            console.log("[Admin] : no token found");
            return;
              }

            console.log("[Admin] token found :", token)
            // console.log("[APP] user found :", this.user)

            const res = await api.get(`http://localhost:3000/admin`, {
            headers: { Authorization: `Bearer ${token}` }
            });

            const product =res.data;  
          //  console.log("[Admin] PRODUCT : ",JSON.stringify(product))
            this.setProduct(product);
      } catch (error) {
        console.error('❌ Erreur chargement produits:', error);
        this.showNotification('Erreur lors du chargement des produits', 'error');
      }
    },
    setProduct(product){
      try {
        
            if(!product)
              return
            this.products = product
    
      } catch (error) {
        
      }
    },

    getSampleProducts() {
      return [
        { id: 101, name: "T-shirt Noir Classique", brand: "Nike", price: 20, categoryId: 1, img: 'noir.png', description: "T-shirt en coton 100% biologique" },
        { id: 102, name: "T-shirt Blanc Sport", brand: "Adidas", price: 25, categoryId: 1, img: 'blanc.png', description: "T-shirt technique en matière respirante" },
        { id: 103, name: "T-shirt Gris Urban", brand: "Puma", price: 23, categoryId: 1, img: 'gris.png', description: "T-shirt streetwear en coton premium" },
        { id: 201, name: "T-shirt Rose Élégant", brand: "Zara", price: 22, categoryId: 2, img: 'rosefemme.png', description: "T-shirt féminin en coton stretch" },
        { id: 202, name: "T-shirt Blanc Femme", brand: "H&M", price: 18, categoryId: 2, img: 'blancfemme.png', description: "T-shirt basique femme, coupe standard" },
        { id: 203, name: "T-shirt Noir Femme", brand: "Mango", price: 21, categoryId: 2, img: 'noirfemme.png', description: "T-shirt femme en coton bio" },
        { id: 301, name: "T-shirt Bleu Enfant", brand: "Disney", price: 15, categoryId: 3, img: 'enfantbleu.png', description: "T-shirt pour enfant avec motif Disney" },
        { id: 302, name: "T-shirt Rouge Super-héros", brand: "Marvel", price: 16, categoryId: 3, img: 'enfantrouge.png', description: "T-shirt enfant avec impression Marvel" }
      ];
    },

    async editProduct(product) {
      try {
            console.log('[Adminproduct] editProduct : ',JSON.stringify(product) );
            const productToSend = JSON.stringify(product)
            this.showModal = true;
            this.editingProduct = true;
            this.form = { ...product };

           //await this.saveProduct()

        } catch (err) {
          console.error("Update error:", err.response?.data || err.message);
        }
    },

    async saveProduct() {
      // Validation
      
      if (!this.validateForm()) return;

      this.loading = true;

      try {
        if (this.editingProduct) {
          // Mise à jour du produit
         // await this.editProduct(this.editingProduct)
          await this.updateProduct(this.form);
          this.showNotification('Produit mis à jour avec succès', 'success');
          this.editingProduct = false;

        } else {
          // Création d'un nouveau produit
          await this.createProduct(this.form);
          this.showNotification('Produit créé avec succès', 'success');
        }
         const res = await api.put(`/product/update/${ this.form.id}`, this.form);;
          console.log("Updated: product ", res.data);

        await this.loadProducts();
        this.closeModal();
      } catch (error) {
        console.error('❌ Erreur sauvegarde produit:', error);
        this.showNotification('Erreur lors de la sauvegarde', 'error');
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(productData) {
      // Simulation d'appel API - À remplacer par PUT /api/products/:id
      console.log('🔄 Mise à jour produit:', productData);
      
      const index = this.products.findIndex(p => p.id === productData.id);
      if (index !== -1) {
        this.products[index] = productData;
      }
      

    },
    openCreateModal(){
      this.showAddForm = true;
      this.editingProduct = true;
    },
    async createProduct(productData) {
     
      // Simulation d'appel API - À remplacer par POST /api/products
      console.log('🆕 Création produit:', productData);
      console.log('🆕 produit:', this.form);
      const payload = JSON.parse(JSON.stringify(this.form))
      console.log('🆕 produit:', payload);

      const res = await api.post('/product/addAdmin',{
         product : payload
        });
      console.log("Updated: product ", res.data);

        await this.loadProducts();
        this.closeModal();

/*       
      const newProduct = {
        ...productData,
        id: this.generateProductId()
      };
      
      this.products.push(newProduct);
      this.saveToLocalStorage();
 */

    },

    async deleteProduct(productId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

      try {
        // Simulation d'appel API - À remplacer par DELETE /api/products/:id
        console.log('🗑️ Suppression produit:', productId);
        const res = await api.delete(`/product/deleteProduct`,
          {
            data : {productId:productId}
          }
        );
        console.log("[DELETEPRODCT] res ",res )
        this.products = this.products.filter(p => p.id !== productId);
        this.saveToLocalStorage();
        
        this.showNotification('Produit supprimé avec succès', 'success');
      } catch (error) {
        console.error('❌ Erreur suppression produit:', error);
        this.showNotification('Erreur lors de la suppression', 'error');
      }
    },

    validateForm() {
      if (!this.form.name.trim()) {
        this.showNotification('Le nom du produit est obligatoire', 'error');
        return false;
      }
    /*   if (!this.form.brand.trim()) {
        this.showNotification('La marque est obligatoire', 'error');
        return false;
      } */
      if (this.form.price <= 0) {
        this.showNotification('Le prix doit être positif', 'error');
        return false;
      }
      if (!this.form.category && !this.form.categoryId) {
        this.showNotification('La catégorie est obligatoire', 'error');
        return false;
      }
      return true;
    },

    generateProductId() {
      // Génère un ID unique basé sur la catégorie
      const categoryId = parseInt(this.form.categoryId);
      const productsInCategory = this.products.filter(p => 
        Math.floor(p.id / 100) === categoryId
      );
      return categoryId * 100 + productsInCategory.length + 1;
    },

    saveToLocalStorage() {
      localStorage.setItem('admin_products', JSON.stringify(this.products));
    },

    closeModal() {
      this.showModal = false;
      this.showAddForm = false;

      this.editingProduct = null;
      this.form = {
        name: '',
       /*  brand: '', */
        price: 0,
        categoryId: '',
        img: '',
        description: ''
      };
    },

    getProductImage(imgName) {
      if (!imgName) return '';
      return this.imageMap[imgName] || '';
    },

    getCategoryName(categoryId) {
      const categories = {
        1: 'Homme',
        2: 'Femme',
        3: 'Enfant'
      };
      return categories[categoryId] || 'Inconnue';
    },

    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
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

    logout() {
      if (this.setUser) {
        this.setUser(null);
      }
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f8fafc;
}

.admin-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #1f2937;
  text-align: center;
}

/* Barre d'actions */
.admin-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #2563eb;
}

.search-bar {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

/* Table des produits */
.products-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.table-header {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 100px 120px 200px;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.5rem;
}

.header-row {
  font-weight: 600;
  color: #374151;
}

.table-cell {
  display: flex;
  align-items: center;
}

.table-body .table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
}

.table-body .table-row:hover {
  background: #f9fafb;
}

.table-body .table-row:last-child {
  border-bottom: none;
}

/* Cellules spécifiques */
.image-cell {
  justify-content: center;
}

.product-thumb {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 6px;
  background: #f9fafb;
}

.name-cell {
  font-weight: 500;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  padding: 0.5rem 1rem;
  background: #fbbf24;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-edit:hover {
  background: #f59e0b;
}

.btn-delete {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-delete:hover {
  background: #dc2626;
}

/* Modal */
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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

/* Formulaire */
.product-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group.full-width {
  grid-column: 1 / -1;
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
  transition: background 0.3s ease;
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
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-save:hover:not(:disabled) {
  background: #059669;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Navigation (identique aux autres pages) */
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

.nav-login {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-message {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.9rem;
}

.logout-button {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-content {
    padding: 1rem;
  }
  
  .admin-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .table-cell {
    justify-content: flex-start;
  }
  
  .actions-cell {
    justify-content: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .user-menu {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>