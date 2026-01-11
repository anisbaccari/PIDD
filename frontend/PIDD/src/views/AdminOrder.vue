<template>
    <div class="admin-orders">
      <h2>📦 Toutes les commandes</h2>
  
      <button class="reload" @click="loadOrders" :disabled="loading">
        {{ loading ? 'Chargement…' : 'Recharger' }}
      </button>
  
      <div v-if="!orders.length && !loading" class="empty">
        Aucune commande trouvée
      </div>
  <!-- COMMANDE/USER -->
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span>#{{ order.id }}</span>
          <span class="status" :class="order.status">{{ order.status }}</span>
        </div>
  
        <div class="order-body">
          <p><strong>Total :</strong> {{ formatPrice(order.totalPrice) }}</p>
          <p><strong>Utilisateur :</strong> {{ order.user?.email || '—' }}</p>
        </div>
  
        <div class="order-items">
          <div
            v-for="item in order.orderItem"
            :key="item.id"
            class="order-item"
          >
            <img
              :src="getImage(item.product?.img)"
              alt=""
            />
            <div>
                    <p>{{ item.product?.name }}</p>
                    <small>x{{ item.quantity }}</small>

                    </div>

                    <span>
                    {{ formatPrice(item.unitPrice * item.quantity) }}
                    </span>
                </div>
                
                    <!-- NEW BUTTON -->
                    <button
                        class="item-btn"
                        @click="deleteOrder(order.id)"
                    >
                        Cancel
                    </button>
                      <!-- NEW BUTTON -->
                      <button
                        class="item-btn"
                        @click="paidOrder(order.id)"
                    >
                        confirm
                    </button>
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
import api from '../api.js'


export default {
  name: 'AdminOrder',
  props: ['user', 'setUser'],
  data() {
    return {
      orders: [],
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
  computed:{
  },
  async mounted(){
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      try {
        this.loading = true
        console.log("======[loadOrders - Admin ORDER] ")


        const token = localStorage.getItem('token')
        if (!token){
            console.log(" no TOKEN found ")
            return
        } 
        console.log("[loadOrders - Admin ORDER] token found")

        const res = await api.get('/admin/getOrder', {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log("[loadOrders - Admin ORDER]resdata ",res.data.order)

        this.orders = res.data.order || []
      } catch (err) {
        console.error('[Admin] loadOrders error:', err)
      } finally {
        this.loading = false
      }
    },

    formatPrice(value) {
      return Number(value || 0).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      })
    },

    getImage(img) {
      if (!img) return this.imageMap['gris.png']
      const name = img.split('/').pop()
      return this.imageMap[name] || img
    },
    async deleteOrder(orderId) {

        try {
        console.log("[deleteOrder]====== " )
        console.log("[deleteOrder] orderID ",orderId )


        const res = await api.delete(`/admin/deleteOrder`,
        {
          data :
             {
            orderId:orderId
          }}
        );
        console.log("[deleteOrder] res ",res )
        } catch (error) {
        console.log("[deleteOrder] error ",error )
            
        }

    },
    async paidOrder(orderId) {

        try {
        console.log("[paidOrder]====== " )
        console.log("[paidOrder] orderID ",orderId )


        const res = await api.post(`/admin/paidOrder`,
        {
            orderId:orderId
        }
        );
        console.log("[paidOrder] res ",res )
        } catch (error) {
        console.log("[paidOrder] error ",error )
            
        }

        }
  }
}
</script>
<style scoped>
  .admin-orders {
    max-width: 1000px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: 'Arial', sans-serif;
  }
  
  .admin-orders h2 {
    font-size: 28px;
    margin-bottom: 20px;
    text-align: center;
    font-weight: bold;
    color: #333;
  }
  
  .reload {
    display: block;
    margin: 0 auto 25px;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    background: #2575fc;
    color: #fff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
  }
  
  .reload:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
  
  .reload:hover:not(:disabled) {
    background: #6a11cb;
    transform: translateY(-2px);
  }
  
  .empty {
    text-align: center;
    color: #777;
    font-size: 16px;
    margin-top: 30px;
  }
  
  /* ORDER CARD */
  .order-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 6px 15px rgba(0,0,0,0.08);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .order-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 25px rgba(0,0,0,0.15);
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    font-weight: bold;
  }
  
  .status {
    text-transform: capitalize;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 14px;
    color: #fff;
  }
  
  .status.pending {
    background: #f7971e;
  }
  
  .status.paid {
    background: #43cea2;
  }
  
  .status.cancelled {
    background: #ff6b6b;
  }
  
  .status.fulfilled {
    background: #2575fc;
  }
  
  .order-body p {
    margin: 5px 0;
  }
  
  .order-items {
    margin-top: 15px;
  }
  
  .order-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f9f9f9;
    border-radius: 12px;
    padding: 10px;
    margin-bottom: 10px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .order-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  }
  
  .order-item img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 10px;
  }
  
  .order-item div {
    flex: 1;
    text-align: left;
  }
  
  .order-item p {
    margin: 0;
    font-weight: 500;
  }
  
  .order-item small {
    color: #555;
  }
  
  .order-item span {
    font-weight: bold;
    color: #111;
  }
  
  .item-btn {
    margin-left: 10px;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
  }
  
  .item-btn:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
  
  .item-btn:first-of-type {
    background: #ff6b6b;
    color: #fff;
  }
  
  .item-btn:last-of-type {
    background: #43cea2;
    color: #fff;
  }
  
  /* Responsive */
  @media(max-width: 600px) {
    .order-header,
    .order-body {
      flex-direction: column;
      align-items: flex-start;
    }
    .order-item {
      flex-direction: column;
      align-items: flex-start;
    }
    .item-btn {
      margin: 5px 0 0 0;
    }
  }
  </style>