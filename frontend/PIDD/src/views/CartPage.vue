<!-- ======= PANIER PAGE ===== -->

<template>
  <div class="cart-page">




      <h1 class="title">Mon Panier</h1>

      <!-- Panier vide -->
      <div v-if="this.cartItems.length === 0" class="empty-cart">
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
              <!-- <h2>Articles ({{ getTotalItems() }})</h2> -->
              <button @click="clearCart" class="clear-cart-btn" v-if="this.cartItems.length > 0">
                Vider le panier
              </button>
            </div>
            
            <div class="cart-items">
              <div 
                v-for="order in this.cartItems" 
                :key="order.id" 
                class="cart-item"
              >

   
              <!-- PAR PANIER  -->
                  <div class="cart-orderItem">
                    <p>Commande </p>
                      <!-- PAR PRODUITS COMMANDEES  -->
                    <div class="itemList"
                      v-for = "itemList in order.orderItem"
                      :key=" order.orderItem.id" 
                    >
                      <div class="item-details">
                  <h3 class="product-name">{{ itemList.product.name }}</h3>
                  <p class="product-brand">{{ itemList.product.brand }}</p>
                <!--   <p class="product-price-unit">{{ formatPrice(item.price) }} l'unité</p> -->
                      </div>

                      <p> quantity  {{ itemList.quantity }}  </p>

                      <div class="item-total">
                         {{ formatPrice(itemList.unitPrice * itemList.quantity) }}
                     </div> 
                         <div class="item-image">
                           <img :src="getProductImage( itemList.product.img)" 
                           :alt=" itemList.product.name" />
                          </div>
                    <button 
                    @click="updateQuantity( itemList.id,  itemList.product.quantity - 1)"
                    :disabled="itemList.product.quantity <= 1"
                    class="quantity-btn"
                  >
                    −
                  </button>
                           <button 
                  @click="removeItem(itemList.product.id)"
                  class="remove-btn"
                  title="Supprimer"
                >
                  ×
                </button>
                    </br>
                    </div>   
                </div>
       
              </div>
            </div>
          </div>

          <!-- Résumé de commande -->
          <div class="order-summary">
            <div class="summary-card">
              <h3>Résumé de la commande</h3>
              
              <div class="summary-line">
<!--                 <span>Sous-total ({{ getTotalItems() }} articles)</span>
                <span>{{ formatPrice(getCartTotal()) }}</span> -->
              </div>
              
              <div class="summary-line">
                <span>Frais de livraison</span>
                <span>Gratuit</span>
              </div>
              
              <div class="summary-divider"></div>
              
              <div class="summary-total">
                <span>Total</span>
               <!--  <span class="total-price">{{ formatPrice(getCartTotal()) }}</span> -->
              </div>
              
              <button class="checkout-btn" @click="proceedToCheckout">
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
import api from '../api';

export default {
  name: 'CartPage',
  props: [
    'user', 
    'setUser', 
    'getUser', 
    'addToCartGlobal', 
    'updateCartQuantity', 
    'removeFromCart', 
    'getCartTotal', 
    'getTotalItems'
  ],
  data() {
    return {
      dataUser: this.getUser() || { id:"", username: "", passwprd : ""},
      deliveryPrice: 0, // Livraison gratuite
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
      cartItems : {}
    }
  },
 async mounted(){
    this.getPanier();

  },
  computed: {
    // ✅ SUPPRIMEZ ces computed properties redondantes
    // totalItems() et subtotal() sont déjà dans App.vue
  },
  methods: {
      async  getPanier(){
          try {
          
                    const token = localStorage.getItem("token");
                    if (token == '') {
                      console.log("[getPanier] : no token found");
                      return;
                    }

                  console.log("[getPanier] token found :", token)
                // console.log("[APP] user found :", this.user)

                  const res = await api.get(`http://localhost:3000/panier`, {
                  headers: { Authorization: `Bearer ${token}` }
                  });

                const order =res.data;  
                console.log("[Panier] order : ",JSON.stringify(order))
                this.setCart(order);
                  
          
              } catch (error) {
                console.log("[Panier] error : ",error)
            
          }
      },

    setCart(order){
        this.cartItems = order;
      
         console.log("[Panier] (setCart) panier : ",JSON.stringify(this.cartItems ))
    },
    getData(){

    },

    /* =================== */
    updateQuantity(productId, newQuantity) {
      if (this.updateCartQuantity) {
        this.updateCartQuantity(productId, newQuantity);
      }
    },
    
   async removeItem(productId) {
      try {
            console.log("[removeItem] productId : ",productId)
            console.log("[removeItem] this.user.id : ",this.user.id)

              if (productId) {
            await api.delete("http://localhost:3000/product/remove", {
                    data: {
                      userId: this.user.id,
                      productId: productId
                    }
                });
              }
      } catch (error) {
            console.log("[removeItem] error : ",error)
        
      }
    },
    
    clearCart() {
      if (this.clearCart && confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
        this.clearCart();
      }
    },
    
    proceedToCheckout() {
      if (this.cartItems.length === 0) {
        this.showError('Votre panier est vide');
        return;
      }
      
      this.$router.push('/checkout');
      console.log('🚀 Redirection vers paiement');
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
  }
}
</script>

<style scoped>
.cart-page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  box-sizing: border-box;
}

.cart-with-items {
  width: 100%;
  max-width: 1200px;
}

.cart-layout {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 30px;
}

/* LEFT SIDE – ITEMS */
.cart-items-section {
  flex: 3;
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.cart-items {
  margin-top: 20px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.item-details {
  flex: 2;
}

.product-name {
  font-size: 18px;
  font-weight: bold;
}

.product-brand {
  color: #666;
}

.item-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
}

/* Quantity & Remove */
.quantity-btn {
  padding: 6px 12px;
  background: #ddd;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.remove-btn {
  border: none;
  background: transparent;
  font-size: 24px;
  color: #c00;
  cursor: pointer;
}

/* RIGHT SIDE – SUMMARY */

.order-summary {
  flex: 1.2;
}

.summary-card {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  position: sticky;
  top: 20px; /* Stay fixed while scrolling */
}

.summary-card h3 {
  margin-bottom: 15px;
  font-size: 22px;
}

.summary-line,
.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.summary-divider {
  height: 1px;
  background: #ddd;
  margin: 10px 0;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
}

/* Checkout button */
.checkout-btn {
  width: 100%;
  background: #000;
  color: #fff;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
}

.continue-shopping {
  display: block;
  margin-top: 10px;
  text-align: center;
  color: #555;
  text-decoration: none;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .cart-layout {
    flex-direction: column;
  }
  
  .order-summary {
    width: 100%;
  }
}

</style>