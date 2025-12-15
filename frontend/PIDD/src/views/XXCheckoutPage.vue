<template>

  <div class="cart-page">
    <h2>Votre Panier</h2>

    <!-- ====================== -->
    <!-- Loop orders            -->
    <!-- ====================== -->
    <div 
      v-for="order in cartItems" 
      :key="order.id"
      class="order-block"
    >
      
      <!-- Only pending orders -->
      <div v-if="order.status === 'pending'">

        <!-- ====================== -->
        <!-- Loop each Order Item   -->
        <!-- ====================== -->
        <div 
          v-for="item in order.orderItem"
          :key="item.id"
          class="cart-item"
        >

          <img 
            :src="getProductImage(item.product.img)" 
            class="product-image"
          />

          <div class="product-info">
            <h3>{{ item.product.name }}</h3>

            <p>Quantité : {{ item.quantity }}</p>

            <p>Prix unitaire :  
              {{ formatPrice(item.unitPrice) }}
            </p>

            <p>Sous-total :  
              {{ formatPrice(item.quantity * item.unitPrice) }}
            </p>
          </div>

          <button 
            @click="removeItem(item.product.id)"
            class="remove-btn"
          >
            ✖
          </button>
        </div>

      </div>
    </div>

    <!-- =============================== -->
    <!--        DELIVERY + TOTAL         -->
    <!-- =============================== -->

    <div class="checkout-summary">

      <h2>Résumé de la commande</h2>

      <!-- Total des articles -->
      <div class="summary-row">
        <span>Total des articles :</span>
        <span>{{ this.total }}</span>
      </div>

      <!-- Frais de livraison -->
      <div class="summary-row">
        <span>Frais de livraison :</span>
        <span>
          <span v-if="deliveryPrice === 0">Gratuit 🎁</span>
          <span v-else>{{this.deliveryPrice }}</span>
        </span>
      </div>

      <hr />

      <!-- Total final -->
      <div class="summary-total">
        <span>Total à payer :</span>
        <span class="total-price">
          {{ this.total + this.deliveryPrice}}
        </span>
      </div>
      <div id="card-element" class="card-box"></div>
      <div id="card-errors" class="error-text"></div>
      <button 
        class="checkout-btn" 
        @click="payWithStripe"
      >
        Procéder au paiement
      </button>

    </div>

  </div>

</template>





<script>
import noir from '../assets/noir.png'
import blanc from '../assets/blanc.png'
import rosefemme from '../assets/rosefemme.png'
import blancfemme from '../assets/blancfemme.png'
import noirfemme from '../assets/noirfemme.png'
import enfantbleu from '../assets/enfantbleu.png'
import enfantrouge from '../assets/enfantrouge.png'
import gris from '../assets/gris.png'
import api from '../api';
import { loadStripe } from '@stripe/stripe-js';

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
      total : 0,
      stripe: null,
      elements: null,
      cardElement: null
    }
  },
 async mounted(){
  this.stripe = await loadStripe(
      import.meta.env.VITE_STRIPE_PUBLIC_KEY 
     );
    if(this.dataUser.id)
    {
      this.cartItems = await this.getPanier()
      console.log(" cartiem :",this.getPanier())
    }else { 
      this.cartItems =this.formatPanier( this.tempCart)
      console.log("[mounted] :  this.tempCart", this.tempCart);

      console.log("[mounted] : this.cartItems",this.cartItems);
      console.log("[mounted] : this.cartItems",this.cartItems[0]);
      console.log("[mounted] : this.cartItems length ",this.cartItems.length);
      
      
    }
   // console.log("[mounted] :  import.meta.env.VITE_STRIPE_PUBLIC_KEY ", import.meta.env.VITE_STRIPE_PUBLIC_KEY);


    this.elements = this.stripe.elements();

    this.cardElement = this.elements.create('card');
    this.cardElement.mount('#card-element');
    console.log("Card number: 4242 4242 4242 4242 Expiry date: Any future date (12 / 34) CVC: Any 3 digits (123) ZIP: Any (12345)")
  },
  methods: {
    async payWithStripe() {
    try {

     // console.log("[payWithStripe] : this.cartItems id ",this.cartItems);

      // 1️⃣ Call backend
      const res = await api.post(
        'http://localhost:3000/stripe/create-payment-intent',
        {
          amount: 30,
          orderId :this.cartItems[0].id
        }
      );

      const clientSecret = res.data.clientSecret;

      // 2️⃣ Confirm card payment
      const result = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: this.user.username
            }
          }
        }
      );

      // 3️⃣ Handle result
      if (result.error) {
        document.getElementById('card-errors').textContent =
          result.error.message;
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          alert('✅ Paiement réussi');
          this.$router.push('/success');
        }
      }
    } catch (err) {
      console.error(err);
      alert('❌ Erreur paiement');
    }
  },
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

                const order =res.data.pendingOrder;  
                console.log("[Panier] order : ",JSON.stringify(order))
                this.setCart(order);

                this.setTotal()     
                this.getUser()
                console.log("[getPanier] user found :", this.user)

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


<style>
  /* ==============================
   GLOBAL CONTAINER
   ============================== */
.cart-page {
  max-width: 950px;
  margin: 40px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* ==============================
   ORDER BLOCK
   ============================== */
.order-block {
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid #e6e6e6;
}

.card-box {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 15px;
  background: white;
}

.error-text {
  color: red;
  margin-bottom: 10px;
}


/* ==============================
   CART ITEM
   ============================== */
.cart-item {
  display: flex;
  gap: 20px;
  padding: 15px 0;
  border-bottom: 1px solid #e1e1e1;
}

.cart-item:last-child {
  border-bottom: none;
}

/* ==============================
   PRODUCT IMAGE
   ============================== */
.product-image {
  width: 100px;
  height: auto;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* ==============================
   PRODUCT INFO
   ============================== */
.product-info {
  flex-grow: 1;
}

.product-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.product-info p {
  margin: 4px 0;
  color: #333;
}

/* ==============================
   REMOVE BUTTON
   ============================== */
.remove-btn {
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #c0392b;
  font-weight: bold;
  transition: 0.2s;
}

.remove-btn:hover {
  color: #e74c3c;
  transform: scale(1.2);
}

/* ==============================
   CHECKOUT SUMMARY
   ============================== */
.checkout-summary {
  margin-top: 40px;
  padding: 25px;
  background: #f6f6f6;
  border-radius: 12px;
  border: 1px solid #ddd;
}

.checkout-summary h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 22px;
}

/* Row styling */
.summary-row,
.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 16px;
}

.summary-total {
  font-weight: bold;
  font-size: 18px;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #000;
}

/* ==============================
   CHECKOUT BUTTON
   ============================== */
.checkout-btn {
  width: 100%;
  background: #000;
  color: #fff;
  padding: 15px;
  border: none;
  border-radius: 10px;
  margin-top: 20px;
  cursor: pointer;
  font-size: 18px;
  transition: 0.25s;
}

.checkout-btn:hover {
  background: #333;
  transform: translateY(-2px);
}

/* ==============================
   RESPONSIVE DESIGN
   ============================== */
@media (max-width: 600px) {
  .cart-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .product-image {
    width: 150px;
  }

  .remove-btn {
    margin-top: 10px;
  }
}

</style>