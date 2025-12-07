import { createRouter, createWebHistory } from 'vue-router'

// Import des vues principales
import Home from '../views/Home.vue'
import CategoryPage from '../views/CategoryPage.vue'
import ProductPage from '../views/ProductPage.vue'
import Profilview from '../views/Profilview.vue'
import AllCategories from '../views/AllCategories.vue'
import AdminProducts from '../views/AdminProducts.vue'
import CartPage from '../views/CartPage.vue'

// Import des nouvelles vues de paiement
import CheckoutPage from '../views/CheckoutPage.vue'
import PaymentSuccess from '../views/PaymentSuccess.vue'

// Import des composants d'authentification
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: Home,
    props: true
  },
  { 
    path: '/category/:id', 
    name: 'Category', 
    component: CategoryPage, 
    props: true 
  },
  { 
    path: '/product/:id', 
    name: 'Product', 
    component: ProductPage, 
    props: true 
  },
  { 
    path: '/admin/products', 
    name: 'AdminProducts', 
    component: AdminProducts,
    props: true 
  },
  { 
    path: '/profil', 
    name: 'Profilview', 
    component: Profilview,
    props: true
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: LoginForm,
    props: true
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: RegisterForm,
    props: true
  },
  {
    path: '/categories',
    name: 'AllCategories',
    component: AllCategories,
    props: true
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartPage,
    props: true
  },
  // Dans router/index.js
{
  path: '/admin/orders',
  name: 'AdminOrders',
  component: () => import('../views/AdminOrders.vue'),
  meta: { 
    title: 'Gestion des commandes',
    requiresAuth: true,
    requiresAdmin: true
  }
},
{
  path: '/admin/analytics',
  name: 'AdminAnalytics',
  component: () => import('../views/AdminAnalytics.vue'),
  meta: { 
    title: 'Tableau de bord statistiques',
    requiresAuth: true,
    requiresAdmin: true
  }
},
  // 🆕 NOUVELLE ROUTE : Page de paiement/checkout
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutPage,
    props: true,
    meta: { 
      requiresAuth: true,
      title: 'Finaliser votre commande'
    }
  },
  // 🆕 NOUVELLE ROUTE : Confirmation de paiement
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: PaymentSuccess,
    props: (route) => ({ 
      orderId: route.query.orderId,
      amount: route.query.amount,
      method: route.query.method 
    }),
    meta: { 
      title: 'Commande confirmée'
    }
  },
  
  // Redirection par défaut
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/' 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // ✅ Optionnel: comportement de scroll
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 🛡️ Garde de navigation pour l'authentification
router.beforeEach((to, from, next) => {
  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    if (token && user) {
      // Utilisateur authentifié, autoriser l'accès
      next()
    } else {
      // Rediriger vers la page de login
      next({
        path: '/login',
        query: { redirect: to.fullPath } // Sauvegarder la destination originale
      })
    }
  } else {
    // Route publique, autoriser l'accès
    next()
  }
})

// 🏷️ Mettre à jour le titre de la page
router.afterEach((to) => {
  const baseTitle = 'MonShop'
  const pageTitle = to.meta.title || 'Boutique en ligne'
  
  document.title = `${pageTitle} - ${baseTitle}`
})

export default router