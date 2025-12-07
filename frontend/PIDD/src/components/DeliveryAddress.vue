<template>
  <div class="delivery-address">
    <h3 class="section-title">Adresse de livraison</h3>
    
    <!-- Adresse existante ou nouvelle -->
    <div v-if="savedAddresses.length > 0" class="address-selection">
      <h4>Choisir une adresse</h4>
      <div class="address-list">
        <div 
          v-for="address in savedAddresses"
          :key="address.id"
          :class="['address-card', { selected: selectedAddressId === address.id }]"
          @click="selectAddress(address)"
        >
          <div class="address-type">{{ address.type }}</div>
          <div class="address-details">
            <p><strong>{{ address.fullName }}</strong></p>
            <p>{{ address.street }}</p>
            <p>{{ address.city }}, {{ address.postalCode }}</p>
            <p>{{ address.country }}</p>
            <p>{{ address.phone }}</p>
          </div>
          <div v-if="selectedAddressId === address.id" class="address-check">
            ✓
          </div>
        </div>
        
        <!-- Nouvelle adresse -->
        <div 
          class="address-card new-address"
          :class="{ selected: !selectedAddressId }"
          @click="selectNewAddress"
        >
          <div class="new-address-icon">+</div>
          <p>Ajouter une nouvelle adresse</p>
        </div>
      </div>
    </div>
    
    <!-- Formulaire d'adresse -->
    <form v-if="showAddressForm" @submit.prevent="saveAddress" class="address-form">
      <div class="form-grid">
        <div class="form-group">
          <label for="fullName">Nom complet *</label>
          <input
            id="fullName"
            v-model="newAddress.fullName"
            type="text"
            required
            placeholder="Jean Dupont"
          />
        </div>
        
        <div class="form-group">
          <label for="phone">Téléphone *</label>
          <input
            id="phone"
            v-model="newAddress.phone"
            type="tel"
            required
            placeholder="06 12 34 56 78"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="street">Adresse *</label>
        <input
          id="street"
          v-model="newAddress.street"
          type="text"
          required
          placeholder="123 Rue de la Paix"
        />
      </div>
      
      <div class="form-group">
        <label for="additional">Complément d'adresse</label>
        <input
          id="additional"
          v-model="newAddress.additional"
          type="text"
          placeholder="Appartement, étage, etc."
        />
      </div>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="postalCode">Code postal *</label>
          <input
            id="postalCode"
            v-model="newAddress.postalCode"
            type="text"
            required
            placeholder="75000"
          />
        </div>
        
        <div class="form-group">
          <label for="city">Ville *</label>
          <input
            id="city"
            v-model="newAddress.city"
            type="text"
            required
            placeholder="Paris"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="country">Pays *</label>
        <select
          id="country"
          v-model="newAddress.country"
          required
        >
          <option value="">Sélectionner un pays</option>
          <option value="FR">France</option>
          <option value="BE">Belgique</option>
          <option value="CH">Suisse</option>
          <option value="LU">Luxembourg</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="addressType">Type d'adresse</label>
        <div class="address-type-options">
          <label class="radio-label">
            <input
              type="radio"
              v-model="newAddress.type"
              value="home"
            />
            <span>🏠 Domicile</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              v-model="newAddress.type"
              value="work"
            />
            <span>🏢 Travail</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              v-model="newAddress.type"
              value="other"
            />
            <span>📦 Autre</span>
          </label>
        </div>
      </div>
      
      <div class="form-checkbox">
        <input
          type="checkbox"
          id="saveAddress"
          v-model="newAddress.saveForLater"
        />
        <label for="saveAddress">Sauvegarder cette adresse pour mes prochaines commandes</label>
      </div>
      
      <div class="form-actions">
        <button 
          type="button" 
          class="btn-secondary"
          @click="cancelNewAddress"
          v-if="savedAddresses.length > 0"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          class="btn-primary"
          :disabled="!isAddressFormValid"
        >
          Utiliser cette adresse
        </button>
      </div>
    </form>
    
    <!-- Adresse sélectionnée (mode lecture seule) -->
    <div v-if="selectedAddress && !showAddressForm" class="selected-address-display">
      <div class="selected-address-header">
        <h4>Adresse sélectionnée</h4>
        <button 
          @click="editAddress"
          class="edit-address-btn"
        >
          Modifier
        </button>
      </div>
      <div class="selected-address-details">
        <p><strong>{{ selectedAddress.fullName }}</strong></p>
        <p>{{ selectedAddress.street }}</p>
        <p v-if="selectedAddress.additional">{{ selectedAddress.additional }}</p>
        <p>{{ selectedAddress.city }}, {{ selectedAddress.postalCode }}</p>
        <p>{{ getCountryName(selectedAddress.country) }}</p>
        <p>📞 {{ selectedAddress.phone }}</p>
      </div>
    </div>
    
    <!-- Livraison vs Facturation -->
    <div class="billing-section">
      <div class="form-checkbox">
        <input
          type="checkbox"
          id="sameBillingAddress"
          v-model="sameBillingAddress"
        />
        <label for="sameBillingAddress">
          L'adresse de facturation est la même que l'adresse de livraison
        </label>
      </div>
      
      <!-- Adresse de facturation si différente -->
      <div v-if="!sameBillingAddress" class="billing-address-form">
        <h4>Adresse de facturation</h4>
        <!-- Même formulaire que delivery, simplifié -->
      </div>
    </div>
    
    <!-- Options de livraison -->
    <div class="delivery-options">
      <h4>Options de livraison</h4>
      <div class="options-list">
        <div 
          v-for="option in deliveryOptions"
          :key="option.id"
          :class="['delivery-option', { selected: selectedDeliveryOption === option.id }]"
          @click="selectDeliveryOption(option)"
        >
          <div class="option-icon">{{ option.icon }}</div>
          <div class="option-details">
            <h5>{{ option.name }}</h5>
            <p>{{ option.description }}</p>
            <p class="option-price">{{ option.price === 0 ? 'Gratuit' : formatPrice(option.price) }}</p>
            <p class="option-delivery">Livraison: {{ option.deliveryTime }}</p>
          </div>
          <div v-if="selectedDeliveryOption === option.id" class="option-check">
            ✓
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeliveryAddress',
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      savedAddresses: [],
      selectedAddressId: null,
      selectedAddress: null,
      showAddressForm: false,
      sameBillingAddress: true,
      selectedDeliveryOption: 'standard',
      newAddress: {
        fullName: '',
        street: '',
        additional: '',
        city: '',
        postalCode: '',
        country: 'FR',
        phone: '',
        type: 'home',
        saveForLater: true
      },
      deliveryOptions: [
        {
          id: 'standard',
          name: 'Livraison standard',
          description: 'Colissimo - Suivi disponible',
          price: 5.99,
          deliveryTime: '3-5 jours ouvrables',
          icon: '📦'
        },
        {
          id: 'express',
          name: 'Livraison express',
          description: 'Chronopost - Livraison prioritaire',
          price: 12.99,
          deliveryTime: '24-48h',
          icon: '🚚'
        },
        {
          id: 'point_relais',
          name: 'Point relais',
          description: 'Retrait en magasin partenaire',
          price: 0,
          deliveryTime: '2-4 jours',
          icon: '🏪'
        }
      ]
    }
  },
  computed: {
    isAddressFormValid() {
      return (
        this.newAddress.fullName.trim() &&
        this.newAddress.street.trim() &&
        this.newAddress.city.trim() &&
        this.newAddress.postalCode.trim() &&
        this.newAddress.phone.trim() &&
        this.newAddress.country
      )
    }
  },
  mounted() {
    this.loadSavedAddresses()
    
    // Si user est connecté, pré-remplir avec ses infos
    if (this.user) {
      this.newAddress.fullName = `${this.user.prenom} ${this.user.nom}`.trim()
      this.newAddress.phone = this.user.telephone || ''
    }
  },
  methods: {
    async loadSavedAddresses() {
      try {
        // Simulation - charger depuis localStorage ou API
        const saved = localStorage.getItem('monShop_addresses')
        if (saved) {
          this.savedAddresses = JSON.parse(saved)
          
          // Sélectionner l'adresse par défaut si disponible
          const defaultAddress = this.savedAddresses.find(addr => addr.isDefault)
          if (defaultAddress) {
            this.selectAddress(defaultAddress)
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement adresses:', error)
      }
    },
    
    selectAddress(address) {
      this.selectedAddressId = address.id
      this.selectedAddress = { ...address }
      this.showAddressForm = false
      this.emitAddressSelected()
    },
    
    selectNewAddress() {
      this.selectedAddressId = null
      this.selectedAddress = null
      this.showAddressForm = true
      this.resetNewAddressForm()
    },
    
    editAddress() {
      this.showAddressForm = true
      // Pré-remplir le formulaire avec l'adresse sélectionnée
      this.newAddress = { ...this.selectedAddress, saveForLater: false }
    },
    
    resetNewAddressForm() {
      this.newAddress = {
        fullName: this.user ? `${this.user.prenom} ${this.user.nom}`.trim() : '',
        street: '',
        additional: '',
        city: '',
        postalCode: '',
        country: 'FR',
        phone: this.user?.telephone || '',
        type: 'home',
        saveForLater: true
      }
    },
    
    async saveAddress() {
      if (!this.isAddressFormValid) return
      
      try {
        const addressData = {
          ...this.newAddress,
          id: Date.now().toString(), // ID temporaire
          isDefault: this.savedAddresses.length === 0
        }
        
        // Ajouter aux adresses sauvegardées
        this.savedAddresses.push(addressData)
        
        // Sauvegarder dans localStorage
        localStorage.setItem('monShop_addresses', JSON.stringify(this.savedAddresses))
        
        // Sélectionner automatiquement
        this.selectAddress(addressData)
        
        // Notifier le parent
        this.emitAddressSelected()
        
      } catch (error) {
        console.error('❌ Erreur sauvegarde adresse:', error)
        alert('Erreur lors de la sauvegarde de l\'adresse')
      }
    },
    
    cancelNewAddress() {
      if (this.savedAddresses.length > 0) {
        // Revenir à l'adresse sélectionnée précédemment
        if (this.selectedAddress) {
          this.selectAddress(this.selectedAddress)
        } else {
          this.showAddressForm = false
        }
      }
    },
    
    selectDeliveryOption(option) {
      this.selectedDeliveryOption = option.id
      this.$emit('delivery-selected', option)
    },
    
    emitAddressSelected() {
      if (this.selectedAddress) {
        this.$emit('address-selected', {
          ...this.selectedAddress,
          deliveryOption: this.deliveryOptions.find(opt => opt.id === this.selectedDeliveryOption)
        })
      }
    },
    
    getCountryName(countryCode) {
      const countries = {
        'FR': 'France',
        'BE': 'Belgique',
        'CH': 'Suisse',
        'LU': 'Luxembourg'
      }
      return countries[countryCode] || countryCode
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }
  }
}
</script>

<style scoped>
.delivery-address {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.5rem;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 0.5rem;
}

/* Sélection d'adresse */
.address-selection h4 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.address-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.address-card:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.address-card.selected {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.address-type {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.address-details {
  flex-grow: 1;
}

.address-details p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.address-check {
  color: #10b981;
  font-weight: bold;
  font-size: 1.2rem;
}

.new-address {
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-style: dashed;
}

.new-address-icon {
  font-size: 2rem;
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.new-address p {
  margin: 0;
  color: #3b82f6;
  font-weight: 600;
}

/* Formulaire */
.address-form {
  margin: 2rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.address-type-options {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #4b5563;
}

.radio-label input[type="radio"] {
  width: auto;
  margin: 0;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  color: #4b5563;
  font-size: 0.9rem;
}

.form-checkbox input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  flex-grow: 1;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

/* Adresse sélectionnée */
.selected-address-display {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.selected-address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.selected-address-header h4 {
  margin: 0;
  color: #1f2937;
}

.edit-address-btn {
  background: none;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-address-btn:hover {
  background: #3b82f6;
  color: white;
}

.selected-address-details p {
  margin: 0.25rem 0;
  color: #4b5563;
}

/* Options de livraison */
.delivery-options {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.delivery-options h4 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.delivery-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delivery-option:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.delivery-option.selected {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.option-icon {
  font-size: 1.5rem;
}

.option-details {
  flex-grow: 1;
}

.option-details h5 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
}

.option-details p {
  margin: 0.25rem 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.option-price {
  font-weight: 600;
  color: #059669 !important;
}

.option-check {
  color: #10b981;
  font-weight: bold;
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .delivery-address {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .delivery-option {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>