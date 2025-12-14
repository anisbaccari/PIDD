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
                        paid
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
    .item-btn {
  margin-top: 6px;
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  background: #222;
  color: #fff;
  cursor: pointer;
}

.item-btn:hover {
  background: #000;
}

    .admin-orders {
      max-width: 900px;
      margin: auto;
      padding: 20px;
    }
    
    .reload {
      margin-bottom: 15px;
    }
    
    .order-card {
      background: #fff;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 6px rgba(0,0,0,.08);
    }
    
    .order-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
    }
    
    .status {
      text-transform: capitalize;
    }
    
    .status.paid { color: green; }
    .status.pending { color: orange; }
    .status.cancelled { color: red; }
    
    .order-item {
      display: grid;
      grid-template-columns: 60px 1fr auto;
      gap: 10px;
      margin-top: 10px;
    }
    
    .order-item img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
    }
    
    .empty {
      text-align: center;
      color: #777;
    }
    </style>
    