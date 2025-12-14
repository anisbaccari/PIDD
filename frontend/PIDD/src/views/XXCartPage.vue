<!-- ======= PANIER PAGE ===== -->
<template>
  <div class="cart-page">
    <h1 class="title">Mon Panier</h1>

    <!-- PAID ITEMS -->
    <section v-if="paidItems && paidItems.length" class="paid-section">
      <h2 class="section-title">Articles déjà payés</h2>

      <div class="paid-list">
        <div
          v-for="order in paidItems"
          :key="order.id"
          class="paid-card"
        >
          <p class="paid-label">Commande payée</p>
          <span class="paid-id">#{{ order.id }}</span>
        </div>
      </div>
    </section>

    <!-- CART -->
    <div class="maincontent">
      <!-- EMPTY CART -->
      <div
        v-if="!cartItems || cartItems.length === 0"
        class="empty-cart"
      >
        <div class="empty-icon">🛒</div>
        <h2>Votre panier est vide</h2>
        <p>Découvrez nos produits et ajoutez-les à votre panier</p>
        <router-link to="/categories" class="cta-button">
          Découvrir les collections
        </router-link>
      </div>

      <!-- CART WITH ITEMS -->
      <div v-else class="cart-with-items">
        <div class="cart-layout">

          <!-- LEFT: ITEMS -->
          <div class="cart-items-section">
            <div class="section-header">
              <button
                v-if="cartItems.length"
                @click="clearCart"
                class="clear-cart-btn"
              >
                Vider le panier
              </button>
            </div>

            <div class="cart-items">
              <div
                v-for="order in cartItems"
                :key="order.id"
                class="order-block"
              >
                <h3 class="order-title">Commande</h3>

                <div
                  v-for="item in order.orderItem"
                  :key="item.id"
                  class="cart-row"
                >
                  <div class="item-details">
                    <h4 class="product-name">{{ item.product.name }}</h4>
                    <p class="product-brand">{{ item.product.brand }}</p>
                  </div>

                  <div class="item-qty">x{{ item.quantity }}</div>

                  <div class="item-total">
                    {{ formatPrice(item.unitPrice * item.quantity) }}
                  </div>

                  <div class="item-image">
                    <img
                      :src="getProductImage(item.product.img)"
                      :alt="item.product.name"
                    />
                  </div>

                  <button
                    v-if="item.quantity > 1"
                    @click="updateQuantity(item.id, item.quantity - 1)"
                    class="quantity-btn"
                  >
                    −
                  </button>

                  <button
                    @click="removeItem(item.product.id)"
                    class="remove-btn"
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: SUMMARY -->
          <aside class="order-summary">
            <div class="summary-card">
              <h3>Résumé de la commande</h3>

              <div class="summary-line">
                <span>Total</span>
                <span>{{ formatPrice(getTotal()) }}</span>
              </div>

              <div class="summary-line">
                <span>Frais de livraison</span>
                <span>Gratuit</span>
              </div>

              <div class="summary-divider"></div>

              <button
                class="checkout-btn"
                @click="proceedToCheckout"
              >
                Procéder au paiement
              </button>

              <router-link
                to="/categories"
                class="continue-shopping"
              >
                ← Continuer mes achats
              </router-link>
            </div>
          </aside>

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
    'setPanier',
    'getFirstPanier',
    'tempCart'

    
/*     'addToCartGlobal', 
    'updateCartQuantity', 
    'removeFromCart', 
    'getCartTotal', 
    'getTotalItems' */
  ],
  data() {
    return {
      dataUser:  this?.getUser() || { id:"", username: "", password : ""},
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
      cartItems : {},
      paidItems : {},
      total : 0
    }
  },
 async mounted(){
    if(this.dataUser.id)
    {
    await this.getPanier()
      
      console.log(" cartiem :",this.getPanier())
    }else { 
      this.cartItems =this.formatPanier( this.tempCart)
      console.log("[mounted] :  this.tempCart", this.tempCart);

      console.log("[mounted] : this.cartItems",this.cartItems);
      console.log("[mounted] : this.cartItems",this.cartItems[0]);
      console.log("[mounted] : this.cartItems length ",this.cartItems.length);

      
    }
  },
  computed: {
    // ✅ SUPPRIMEZ ces computed properties redondantes
    // totalItems() et subtotal() sont déjà dans App.vue
  },
  methods: {
    formatPanier(order)
    {

      // to make orderiten id 
      let producIndex = 0 
      const productOrderItems  = order.map( o => ({
          id :producIndex++,
          product : o
      }))

      let orderItemIndex = 0 
      const orderItemList = productOrderItems.map( o => ({
        id :orderItemIndex++,
        itemList : o
      }))

      let  productOrderIndex = 0 
      const productOrder = orderItemList.map( o =>( {
        id :productOrderIndex++,
        orderItem:o
      }))

      let  orderListIndex = 0 
      const orderList = productOrder.map( o =>( {
        id :orderListIndex++,
        order: productOrder
      }))

      return orderList
    },
  async  getPanier(){
          try {

                
                  console.log("[getPanier]============");

                  const token = localStorage.getItem("token");
                  if (token) {
                  const res = await api.get(`http://localhost:3000/panier`, {
                  headers: { Authorization: `Bearer ${token}` }
                  });

                  console.log("[Panier] pendingOrder : ",res.data.pendingOrder[0])

                  const pendingOrder =res.data.pendingOrder;  
                  const paidOrder =res.data.paidOrder;  

                  console.log("[Panier] pendingOrder : ",JSON.stringify(pendingOrder))
                  console.log("[Panier] paidOrder : ",JSON.stringify(paidOrder))

                  this.setCart(pendingOrder);
                  this.setPaidItem(paidOrder);


                  this.getTotal()     
                  this.getUser()

                  } else {
                    console.log("[getPanier] : no token found");
                    this.tempCart = this.getFirstPanier()
                    console.log("[getPanier] : this.tempCart",this.tempCart);
                  }
          
              } catch (error) {
                console.log("[Panier] error : ",error)
          }
      },
    setTotal(){
        try {
          this.total = this.getTotal()
        } catch (error) {
            console.log("[setTotal] error : ",error)
          
        }
    },
    setCart(order){
        this.cartItems = order;
        // console.log("[Panier] (setCart) panier : ",JSON.stringify(this.cartItems ))
    },
    setPaidItem(order){
        this.paidItems = order;
        // console.log("[Panier] (setCart) panier : ",JSON.stringify(this.cartItems ))
    },
    getTotal(){

      try {
            
            console.log("[Panier] (getTotal) panier : ",JSON.stringify(this.cartItems ))

                if(this.cartItems[0] == null)
                  return 0;

            let total =  this.cartItems.filter(order => order.status === "pending")
            .reduce((sum, order) => sum + Number(order.totalPrice), 0);

            console.log("TOTAL PENDING =", total);
            return total;

      } catch (error) {
         console.log("[Panier] error : ",error)
        
      }



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
            await api.delete("http://localhost:3000/product/removeFromCart", {
                    data: {
                      userId: this.user.id,
                      productId: productId
                    }
                });
              }
            await this.getPanier()
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

<style scoped>.cart-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

/* ---------- PAID ITEMS ---------- */
.paid-section {
  width: 100%;
  max-width: 1200px;
  margin-bottom: 30px;
}

.section-title {
  margin-bottom: 15px;
  font-size: 22px;
}

.paid-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.paid-card {
  background: #f5f7fa;
  padding: 15px 20px;
  border-radius: 10px;
  min-width: 200px;
}

.paid-label {
  font-weight: bold;
  color: #2a7a2a;
}

.paid-id {
  font-size: 14px;
  color: #555;
}

/* ---------- CART ---------- */
.cart-with-items {
  width: 100%;
  max-width: 1200px;
}

.cart-layout {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

/* LEFT */
.cart-items-section {
  flex: 3;
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.order-block {
  margin-bottom: 25px;
}

.order-title {
  margin-bottom: 10px;
  font-size: 18px;
}

.cart-row {
  display: grid;
  grid-template-columns: 2fr auto auto auto auto auto;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.item-image img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
}

.quantity-btn {
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 22px;
  color: #c00;
  cursor: pointer;
}

/* RIGHT */
.order-summary {
  flex: 1.2;
}

.summary-card {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  position: sticky;
  top: 20px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.summary-divider {
  height: 1px;
  background: #ddd;
  margin: 12px 0;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.continue-shopping {
  display: block;
  margin-top: 12px;
  text-align: center;
  color: #555;
}

/* ---------- EMPTY CART ---------- */
.empty-cart {
  text-align: center;
  margin-top: 80px;
}

/* ---------- RESPONSIVE ---------- */
@media (max-width: 900px) {
  .cart-layout {
    flex-direction: column;
  }
}


</style>