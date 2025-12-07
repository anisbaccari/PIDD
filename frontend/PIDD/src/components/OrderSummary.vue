<template>
  <div class="order-summary">
    <h3 class="summary-title">Récapitulatif de commande</h3>
    
    <!-- Liste des produits -->
    <div class="products-list">
      <div 
        v-for="item in cartItems" 
        :key="item.id" 
        class="summary-product"
      >
        <div class="product-image">
          <img 
            :src="getProductImage(item.img)" 
            :alt="item.name"
            class="product-thumb"
          />
        </div>
        
        <div class="product-details">
          <h4 class="product-name">{{ item.name }}</h4>
          <p class="product-brand">{{ item.brand }}</p>
          <div class="product-quantity-price">
            <span class="quantity">Quantité: {{ item.quantity }}</span>
            <span class="price">{{ formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Détails des prix -->
    <div class="price-breakdown">
      <div class="price-line">
        <span>Sous-total</span>
        <span>{{ formatPrice(subtotal) }}</span>
      </div>
      
      <div class="price-line">
        <span>Livraison</span>
        <span>{{ deliveryPrice === 0 ? 'Gratuite' : formatPrice(deliveryPrice) }}</span>
      </div>
      
      <div v-if="discount > 0" class="price-line discount">
        <span>Réduction</span>
        <span>-{{ formatPrice(discount) }}</span>
      </div>
      
      <div class="price-line total">
        <span>Total TTC</span>
        <span class="total-amount">{{ formatPrice(orderTotal) }}</span>
      </div>
    </div>
    
    <!-- Code promo optionnel -->
    <div v-if="showPromoCode" class="promo-code-section">
      <div class="promo-input-group">
        <input 
          v-model="promoCode"
          type="text" 
          placeholder="Code promo"
          class="promo-input"
          @keyup.enter="applyPromoCode"
        />
        <button 
          @click="applyPromoCode"
          class="promo-button"
          :disabled="!promoCode.trim()"
        >
          Appliquer
        </button>
      </div>
      
      <div v-if="promoError" class="promo-error">
        {{ promoError }}
      </div>
      
      <div v-if="promoSuccess" class="promo-success">
        Code appliqué ! Réduction de {{ formatPrice(discount) }}
      </div>
    </div>
    
    <!-- Informations de livraison -->
    <div v-if="deliveryInfo" class="delivery-info">
      <h4>Livraison</h4>
      <p>{{ deliveryInfo.address }}</p>
      <p>{{ deliveryInfo.city }}, {{ deliveryInfo.postalCode }}</p>
      <p>{{ deliveryInfo.country }}</p>
      <p v-if="deliveryInfo.estimatedDate">
        Livraison estimée: {{ deliveryInfo.estimatedDate }}
      </p>
    </div>
  </div>
</template>

<script>
// Import des images (identique à votre CartPage)
import noir from '../assets/noir.png'
import blanc from '../assets/blanc.png'
import rosefemme from '../assets/rosefemme.png'
import blancfemme from '../assets/blancfemme.png'
import noirfemme from '../assets/noirfemme.png'
import enfantbleu from '../assets/enfantbleu.png'
import enfantrouge from '../assets/enfantrouge.png'
import gris from '../assets/gris.png'

export default {
  name: 'OrderSummary',
  props: {
    cartItems: {
      type: Array,
      required: true,
      default: () => []
    },
    deliveryPrice: {
      type: Number,
      default: 0
    },
    orderTotal: {
      type: Number,
      required: true
    },
    showPromoCode: {
      type: Boolean,
      default: false
    },
    deliveryInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      promoCode: '',
      promoError: '',
      promoSuccess: false,
      discount: 0,
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
    subtotal() {
      return this.cartItems.reduce((total, item) => 
        total + (item.price * item.quantity), 0)
    },
    finalTotal() {
      return this.orderTotal - this.discount
    }
  },
  methods: {
    getProductImage(imgName) {
      if (!imgName) return ''
      return this.imageMap[imgName] || ''
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    
    async applyPromoCode() {
      if (!this.promoCode.trim()) return
      
      this.promoError = ''
      this.promoSuccess = false
      
      try {
        // Simulation d'appel API
        console.log('🎟️ Validation code promo:', this.promoCode)
        
        // Exemple de logique de réduction
        if (this.promoCode.toUpperCase() === 'MONSHOP10') {
          this.discount = this.subtotal * 0.1 // 10% de réduction
          this.promoSuccess = true
          this.$emit('discount-applied', this.discount)
        } else if (this.promoCode.toUpperCase() === 'LIVRAISON') {
          this.discount = this.deliveryPrice // Livraison gratuite
          this.promoSuccess = true
          this.$emit('discount-applied', this.discount)
        } else {
          this.promoError = 'Code promo invalide ou expiré'
        }
      } catch (error) {
        this.promoError = 'Erreur lors de l\'application du code'
        console.error('❌ Erreur code promo:', error)
      }
    },
    
    removePromoCode() {
      this.promoCode = ''
      this.discount = 0
      this.promoSuccess = false
      this.$emit('discount-removed')
    }
  }
}
</script>

<style scoped>
.order-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-title {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
}

/* Liste des produits */
.products-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.summary-product {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-product:last-child {
  border-bottom: none;
}

.product-image {
  flex-shrink: 0;
}

.product-thumb {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 6px;
  background: #f9fafb;
}

.product-details {
  flex-grow: 1;
}

.product-name {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.product-brand {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.product-quantity-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity {
  font-size: 0.85rem;
  color: #6b7280;
}

.price {
  font-weight: 600;
  color: #1f2937;
}

/* Détails des prix */
.price-breakdown {
  margin: 1.5rem 0;
}

.price-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #6b7280;
  font-size: 0.95rem;
}

.price-line.discount {
  color: #10b981;
}

.price-line.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.total-amount {
  color: #3b82f6;
  font-size: 1.2rem;
}

/* Code promo */
.promo-code-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.promo-input-group {
  display: flex;
  gap: 0.5rem;
}

.promo-input {
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.promo-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.promo-button {
  padding: 0.75rem 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.promo-button:hover:not(:disabled) {
  background: #2563eb;
}

.promo-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.promo-error {
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.85rem;
}

.promo-success {
  margin-top: 0.5rem;
  color: #10b981;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Informations livraison */
.delivery-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.delivery-info h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.delivery-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #4b5563;
}

/* Responsive */
@media (max-width: 768px) {
  .order-summary {
    padding: 1rem;
  }
  
  .summary-product {
    gap: 0.75rem;
    padding: 0.75rem 0;
  }
  
  .product-thumb {
    width: 50px;
    height: 50px;
  }
}
</style>