<template>
<div class="delivery-card">
  <div class="delivery-header">
    <span class="icon">🚚</span>
    <h2>Livraison en cours</h2>
  </div>

  <p class="delivery-subtitle">
    Votre commande est en route vers 
    <span v-if="dataUser.address">
      {{ dataUser.address }}
    </span>
    <span v-else>
       votre addresse
    </span>
  </p>

  <div class="delivery-status">
    <div class="step done">
      <span>✔</span>
      <p>Commande confirmée</p>
    </div>

    <div class="step done">
      <span>✔</span>
      <p>Préparation</p>
    </div>

    <div class="step active">
      <span>⏳</span>
      <p>En livraison</p>
    </div>

    <div class="step">
      <span>📦</span>
      <p>Livrée</p>
    </div>
  </div>

  <p class="delivery-info">
    Livraison estimée : <strong>2–3 jours</strong>
  </p>
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

export default {
  name: 'deliveryPage',
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
   console.log('user',this.dataUser)
  },
  computed: {
    // ✅ SUPPRIMEZ ces computed properties redondantes
    // totalItems() et subtotal() sont déjà dans App.vue
  },
  methods: {
    formatPanier(products)
    {
      console.log("[formatPanier] : products", JSON.stringify(products));

      if (!products || products.length === 0) return [];

      // Create orderItems from products
      const orderItems = products.map((product, index) => ({
        id: index,
        quantity: 1, // Default quantity for temp cart
        unitPrice: parseFloat(product.price),
        product: product
      }));
      console.log("[formatPanier] : formatted orderItems", orderItems);

      // Calculate total price
      const totalPrice = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      console.log("[formatPanier] : formatted totalPrice", totalPrice);

      // Create a single pending order
      const order = {
        id: 0,
        status: "pending",
        totalPrice: totalPrice,
        orderItem: orderItems
      };

      console.log("[formatPanier] : formatted order", JSON.stringify([order]));

      return [order];
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


<style>
    .delivery-card {
  max-width: 420px;
  margin: 40px auto;
  padding: 24px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  text-align: center;
}

/* Header */
.delivery-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.delivery-header .icon {
  font-size: 26px;
}

.delivery-header h2 {
  font-size: 20px;
  margin: 0;
  font-weight: 700;
}

/* Subtitle */
.delivery-subtitle {
  margin: 10px 0 20px;
  font-size: 14px;
  color: #4b5563;
}

/* Steps */
.delivery-status {
  display: grid;
  gap: 14px;
  margin-bottom: 20px;
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f9fafb;
  font-size: 14px;
}

.step span {
  font-size: 18px;
}

/* Done */
.step.done {
  background: #ecfdf5;
  color: #065f46;
}

/* Active */
.step.active {
  background: #eff6ff;
  color: #1e40af;
}

/* Info */
.delivery-info {
  font-size: 14px;
  color: #374151;
}

</style>