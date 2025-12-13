<!-- ======= PANIER PAGE ===== -->
<template>
  <div class="cart-page">
    <h1 class="title">Mon Panier</h1>
    
    <div v-if="this.cartItems" class="maincontent">
      <!-- Panier vide -->
      <div v-if="this.cartItems.length == 0 || !this.cartItems[0]" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Votre panier est vide</h2>
        <p>Découvrez nos produits et ajoutez-les à votre panier</p>
        <router-link to="/categories" class="cta-button">Découvrir les collections</router-link>
      </div>
      
      <!-- Panier avec articles -->
      <div v-else class="cart-with-items">
        <div class="cart-layout">
          <!-- Liste des articles -->
          <div class="cart-items-section">
            <div class="section-header">
              <button @click="clearCart" class="clear-cart-btn" v-if="this.cartItems.length > 0">
                <span>🗑 Vider le panier</span>
              </button>
            </div>
            
            <div class="cart-items">
              <div 
                v-for="order in this.cartItems" 
                :key="order.id" 
                class="cart-item"
              >
                <div class="item-image">
                  <img :src="getProductImage(order.orderItem[0].product.img)" 
                      :alt="order.orderItem[0].product.name" />
                </div>

                <div class="item-details">
                  <h3 class="product-name">{{ order.orderItem[0].product.name }}</h3>
                  <p class="product-brand">{{ order.orderItem[0].product.brand }}</p>
                  <p class="product-quantity">Quantité: {{ order.orderItem[0].quantity }}</p>
                  <p class="product-total">{{ formatPrice(order.orderItem[0].unitPrice * order.orderItem[0].quantity) }}</p>
                </div>

                <div class="item-actions">
                  <button 
                    @click="updateQuantity(order.orderItem[0].id, order.orderItem[0].quantity - 1)"
                    v-if="order.orderItem[0].quantity > 1"
                    class="quantity-btn"
                  >−</button>
                  
                  <button 
                    @click="removeItem(order.orderItem[0].product.id)"
                    class="remove-btn"
                    title="Supprimer"
                  >×</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Résumé de commande -->
          <div class="order-summary">
            <div class="summary-card">
              <h3>Résumé de la commande</h3>
              
              <div class="summary-line">
                <span>Sous-total</span>
                <span>{{ formatPrice(this.getTotal()) }}</span>
              </div>
              
              <div class="summary-line">
                <span>Frais de livraison</span>
                <span>Gratuit</span>
              </div>
              
              <div class="summary-divider"></div>
              
              <div class="summary-total">
                <span>Total</span>
                <span class="total-price">{{ formatPrice(this.getTotal()) }}</span>
              </div>
              
              <!-- MODAL DE PAIEMENT STRIPE -->
              <div v-if="showStripeModal" class="stripe-modal-overlay">
                <div class="stripe-modal">
                  <div class="modal-header">
                    <h3>Paiement sécurisé</h3>
                    <button @click="showStripeModal = false" class="close-modal">&times;</button>
                  </div>
                  
                  <div class="modal-body">
                    <!-- Informations client -->
                    <div class="customer-info" v-if="!paymentCompleted">
                      <div class="form-group">
                        <label for="email">Email *</label>
                        <input 
                          type="email" 
                          id="email"
                          v-model="customerEmail"
                          placeholder="votre@email.com"
                          required
                        />
                      </div>
                      
                      <div class="form-group">
                        <label for="name">Nom complet *</label>
                        <input 
                          type="text" 
                          id="name"
                          v-model="customerName"
                          placeholder="Jean Dupont"
                          required
                        />
                      </div>
                    </div>
                    
                    <!-- Formulaire de carte Stripe -->
                    <div v-if="!paymentCompleted" class="stripe-form">
                      <div class="form-group">
                        <label>Informations de carte</label>
                        <div id="card-element" ref="cardElement"></div>
                        <div id="card-errors" class="error-message" role="alert"></div>
                      </div>
                      
                      <button 
                        @click="processPayment"
                        :disabled="processingPayment || !customerEmail || !customerName"
                        class="pay-now-btn"
                      >
                        <span v-if="processingPayment">
                          <span class="spinner"></span> Traitement en cours...
                        </span>
                        <span v-else>
                          Payer {{ formatPrice(this.getTotal()) }}
                        </span>
                      </button>
                      
                      <div class="test-card-info">
                        <p><strong>💳 Carte de test Stripe :</strong></p>
                        <p><code>4242 4242 4242 4242</code> - 12/34 - CVC: 123</p>
                      </div>
                    </div>
                    
                    <!-- Message de succès -->
                    <div v-if="paymentCompleted" class="success-message">
                      <div class="success-icon">✓</div>
                      <h3>Paiement réussi !</h3>
                      <p>Merci pour votre achat. Un email de confirmation vous a été envoyé à {{ customerEmail }}.</p>
                      <p>Référence : {{ paymentIntentId }}</p>
                      <button @click="closeModalAndReset" class="return-btn">
                        Retour à la boutique
                      </button>
                    </div>
                    
                    <!-- Message d'erreur -->
                    <div v-if="errorMessage" class="error-message">
                      <p>❌ {{ errorMessage }}</p>
                      <button @click="retryPayment" class="retry-btn">Réessayer</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Bouton principal pour ouvrir le modal -->
              <button class="checkout-btn" @click="initiateStripePayment">
                Procéder au paiement
              </button>
              
              <router-link to="/categories" class="continue-shopping">
                ← Continuer mes achats
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js';
import api from '../api';
import blanc from '../assets/blanc.png';
import blancfemme from '../assets/blancfemme.png';
import enfantbleu from '../assets/enfantbleu.png';
import enfantrouge from '../assets/enfantrouge.png';
import gris from '../assets/gris.png';
import noir from '../assets/noir.png';
import noirfemme from '../assets/noirfemme.png';
import rosefemme from '../assets/rosefemme.png';

export default {
  name: 'CartPage',
  props: [
    'user', 
    'setUser',
    'getUser',
    'setPanier',
    'getFirstPanier',
    'tempCart'
  ],
  data() {
    return {
      dataUser: this?.getUser() || { id:"", username: "", password: "" },
      deliveryPrice: 0,
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
      cartItems: [],
      total: 0,
      
      // Nouvelles données pour Stripe
      stripe: null,
      card: null,
      showStripeModal: false,
      customerEmail: '',
      customerName: '',
      processingPayment: false,
      paymentCompleted: false,
      paymentIntentId: '',
      errorMessage: '',
      stripePublishableKey: ''
    }
  },
  async mounted() {
    if(this.dataUser.id) {
      await this.getPanier();
    } else { 
      this.cartItems = this.formatPanier(this.tempCart);
    }
  },
  methods: {
    formatPanier(products) {
      return products.map((product, index) => ({
        id: index,
        status: "pending",
        totalPrice: (product.quantity || 1) * (product.unitPrice || 0),
        orderItem: [
          {
            id: index,
            product: product,
            quantity: product.quantity || 1,
            unitPrice: product.unitPrice || 0
          }
        ]
      }));
    },

    
    async getPanier() {
      try {
        console.log("[getPanier]============");
        const token = localStorage.getItem("token");
        
        if (token) {
          const res = await api.get(`http://localhost:3000/panier`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const order = res.data;  
          console.log("[Panier] order : ", JSON.stringify(order));
          this.setCart(order);
          this.getTotal();
          this.getUser();
          console.log("[getPanier] user found :", this.user);
        } else {
          console.log("[getPanier] : no token found");
          this.tempCart = this.getFirstPanier();
          console.log("[getPanier] : this.tempCart", this.tempCart);
        }
      } catch (error) {
        console.log("[Panier] error : ", error);
      }
    },
    
    setCart(order) {
      this.cartItems = order;
    },
    
    getTotal() {
      try {
        if(!this.cartItems || this.cartItems[0] == null) return 0;
        
        let total = this.cartItems
          .filter(order => order.status === "pending")
          .reduce((sum, order) => sum + Number(order.totalPrice), 0);
        
        console.log("TOTAL PENDING =", total);
        return total;
      } catch (error) {
        console.log("[Panier] error : ", error);
        return 0;
      }
    },
    
    async removeItem(productId) {
      try {
        console.log("[removeItem] productId : ", productId);
        console.log("[removeItem] this.user.id : ", this.user.id);

        if (productId) {
          await api.delete("http://localhost:3000/product/removeFromCart", {
            data: {
              userId: this.user.id,
              productId: productId
            }
          });
        }
        await this.getPanier();
      } catch (error) {
        console.log("[removeItem] error : ", error);
      }
    },
    
    clearCart() {
      if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
        // Implémentez la logique pour vider le panier
        console.log('Panier vidé');
      }
    },
    
    // NOUVELLES MÉTHODES STRIPE
    async initiateStripePayment() {
      if (!this.cartItems || this.cartItems.length === 0) {
        alert('Votre panier est vide');
        return;
      }
      
      this.showStripeModal = true;
      
      // Initialiser Stripe après que le modal soit affiché
      this.$nextTick(async () => {
        await this.initializeStripe();
      });
    },
    
    async initializeStripe() {
      try {
        // Récupérer la clé publique depuis votre backend
        // Vous pouvez aussi la mettre directement si elle est statique
        const response = await api.get('http://localhost:3001/api/config');
        this.stripePublishableKey = response.data.publishableKey;
        
        // Initialiser Stripe
        this.stripe = await loadStripe(this.stripePublishableKey);
        
        // Créer les éléments de carte
        const elements = this.stripe.elements();
        this.card = elements.create('card', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '16px',
              '::placeholder': {
                color: '#aab7c4'
              }
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a'
            }
          }
        });
        
        // Monter l'élément de carte
        this.card.mount(this.$refs.cardElement);
        
        // Gérer les erreurs de carte
        this.card.on('change', (event) => {
          const displayError = document.getElementById('card-errors');
          if (event.error) {
            displayError.textContent = event.error.message;
          } else {
            displayError.textContent = '';
          }
        });
        
      } catch (error) {
        console.error('Erreur initialisation Stripe:', error);
        this.errorMessage = 'Erreur lors de l\'initialisation du paiement';
      }
    },
    
    async processPayment() {
      this.processingPayment = true;
      this.errorMessage = '';
      
      try {
        // 1. Créer un PaymentIntent sur votre backend
        const totalAmount = this.getTotal();
        const items = this.cartItems
          .filter(order => order.status === "pending")
          .flatMap(order => 
            order.orderItem.map(item => ({
              id: item.id,
              name: item.product.name,
              quantity: item.quantity,
              price: item.unitPrice,
              total: item.unitPrice * item.quantity
            }))
          );
        
        const paymentData = {
          amount: totalAmount,
          currency: 'eur',
          customer_email: this.customerEmail,
          customer_name: this.customerName,
          items: items,
          userId: this.user?.id || null
        };
        
        const response = await api.post(
          'http://localhost:3001/api/create-payment-intent',
          paymentData
        );
        
        const { clientSecret, paymentIntentId } = response.data;
        
        // 2. Confirmer le paiement avec Stripe
        const { error, paymentIntent } = await this.stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: this.card,
              billing_details: {
                name: this.customerName,
                email: this.customerEmail,
                address: {
                  // Vous pouvez ajouter l'adresse si nécessaire
                }
              }
            }
          }
        );
        
        if (error) {
          this.errorMessage = error.message;
          this.processingPayment = false;
        } else if (paymentIntent.status === 'succeeded') {
          // 3. Paiement réussi
          this.paymentIntentId = paymentIntentId;
          this.paymentCompleted = true;
          
          // Mettre à jour le statut de la commande dans votre backend
          await this.updateOrderStatus(paymentIntentId);
          
          // Vider le panier local
          this.cartItems = [];
        }
        
      } catch (error) {
        console.error('Erreur de paiement:', error);
        this.errorMessage = error.response?.data?.error || 'Une erreur est survenue lors du paiement';
        this.processingPayment = false;
      }
    },
    
    async updateOrderStatus(paymentIntentId) {
      try {
        // Appeler votre backend pour mettre à jour le statut de la commande
        const response = await api.post('http://localhost:3000/api/orders/update-status', {
          paymentIntentId: paymentIntentId,
          status: 'paid',
          userId: this.user?.id || null
        });
        
        console.log('Commande mise à jour:', response.data);
        
      } catch (error) {
        console.error('Erreur mise à jour commande:', error);
      }
    },
    
    closeModalAndReset() {
      this.showStripeModal = false;
      this.resetPaymentData();
      // Rediriger vers la page d'accueil ou de confirmation
      this.$router.push('/');
    },
    
    resetPaymentData() {
      this.customerEmail = '';
      this.customerName = '';
      this.processingPayment = false;
      this.paymentCompleted = false;
      this.paymentIntentId = '';
      this.errorMessage = '';
      if (this.card) {
        this.card.destroy();
        this.card = null;
      }
    },
    
    retryPayment() {
      this.errorMessage = '';
      this.processingPayment = false;
    },
    
    getProductImage(imgName) {
      if (!imgName) return '';
      return this.imageMap[imgName] || '';
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    },
    
    showSuccess(message) {
      alert(`✅ ${message}`);
    },
    
    showError(message) {
      alert(`❌ ${message}`);
    }
  },
  
  // Nettoyage
  beforeUnmount() {
    if (this.card) {
      this.card.destroy();
    }
  }
}
</script>

<style scoped>
/* Styles existants... */

/* Styles du modal Stripe */
.stripe-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.stripe-modal {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-modal {
  background: none;
  border: none;
  font-size: 28px;
  color: #666;
  cursor: pointer;
  line-height: 1;
}

.close-modal:hover {
  color: #000;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #6772e5;
  box-shadow: 0 0 0 3px rgba(103, 114, 229, 0.1);
}

#card-element {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.pay-now-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #6772e5, #5469d4);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
}

.pay-now-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5469d4, #4350c9);
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.pay-now-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.test-card-info {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6772e5;
  font-size: 14px;
}

.test-card-info p {
  margin: 5px 0;
}

.test-card-info code {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.success-message {
  text-align: center;
  padding: 30px 20px;
}

.success-icon {
  font-size: 60px;
  color: #42b983;
  margin-bottom: 20px;
  animation: successPop 0.5s ease;
}

@keyframes successPop {
  0% { transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.success-message h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.success-message p {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
}

.return-btn {
  margin-top: 20px;
  padding: 12px 30px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.return-btn:hover {
  background: #3aa876;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
  border-left: 4px solid #c62828;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #b71c1c;
}

/* Adaptation du bouton checkout */
.checkout-btn {
  width: 100%;
  background: #2c3e50;
  color: #fff;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  transition: all 0.3s;
}

.checkout-btn:hover {
  background: #1a252f;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .stripe-modal {
    width: 95%;
    margin: 10px;
  }
  
  .modal-header {
    padding: 15px;
  }
  
  .modal-body {
    padding: 15px;
  }
}

/* Animation de chargement */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

.cart-page {
  padding: 30px 15px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #f7f8fa;
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 25px;
  color: #2c3e50;
}

/* ===== Panier vide ===== */
.empty-cart {
  text-align: center;
  padding: 50px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #6772e5;
}

.cta-button {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 25px;
  background: #6772e5;
  color: white;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
}

.cta-button:hover {
  background: #5469d4;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* ===== Cart Layout ===== */
.cart-layout {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

/* Liste des articles */
.cart-items-section {
  flex: 1 1 60%;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s;
}

.cart-item:hover {
  transform: translateY(-2px);
}

.item-details h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.item-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
}

.item-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.quantity-btn, .remove-btn {
  border: none;
  background: #eee;
  color: #555;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 5px;
  transition: all 0.2s;
}

.quantity-btn:hover, .remove-btn:hover {
  background: #6772e5;
  color: white;
}

/* ===== Order Summary ===== */
.order-summary {
  flex: 1 1 35%;
}

.summary-card {
  background: white;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  position: sticky;
  top: 20px;
}

.summary-card h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 1rem;
}

.summary-divider {
  border-top: 1px solid #eee;
  margin: 15px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1.2rem;
}

.total-price {
  color: #6772e5;
}

/* ===== Boutons ===== */
.checkout-btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: #6772e5;
  color: white;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.checkout-btn:hover {
  background: #5469d4;
  transform: translateY(-2px);
}

/* ===== Stripe Modal ===== */
.stripe-modal-overlay {
  position: fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.stripe-modal {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  animation: modalSlideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  color: #2c3e50;
}

.close-modal {
  font-size: 24px;
  color: #888;
  border: none;
  background: none;
  cursor: pointer;
}

.close-modal:hover {
  color: #333;
}

#card-element {
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f9f9f9;
}

/* Bouton payer */
.pay-now-btn {
  width: 100%;
  padding: 16px;
  background: #6772e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.pay-now-btn:hover:not(:disabled) {
  background: #5469d4;
  transform: translateY(-2px);
}

.pay-now-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Message de succès */
.success-message {
  text-align: center;
  padding: 30px 20px;
}

.success-icon {
  font-size: 60px;
  color: #42b983;
  margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .cart-layout {
    flex-direction: column;
  }

  .order-summary {
    flex: 1 1 100%;
    margin-top: 20px;
  }
}

/* Bouton Vider le panier */
.clear-cart-btn {
  padding: 10px 18px;
  background: #e74c3c;
  color: white;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 15px;
}

.clear-cart-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0,0,0,0.15);
}

/* Liste des articles */
.cart-item {
  display: flex;
  gap: 15px;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.05);
  transition: transform 0.3s;
}

.cart-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}

.item-image img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.product-brand {
  font-size: 0.9rem;
  color: #777;
}

.product-quantity,
.product-total {
  font-size: 0.95rem;
  color: #555;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quantity-btn, .remove-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  background: #f0f0f0;
  color: #555;
}

.quantity-btn:hover, .remove-btn:hover {
  background: #6772e5;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-actions {
    flex-direction: row;
    gap: 10px;
    margin-top: 10px;
  }

  .item-image img {
    width: 80px;
    height: 80px;
  }
}

</style>