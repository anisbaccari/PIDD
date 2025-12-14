import { createRouter, createWebHistory } from 'vue-router'

// Import des vues principales
import Home from '../views/Home.vue'
import CategoryPage from '../views/CategoryPage.vue'
import ProductPage from '../views/ProductPage.vue'
import Profilview from '../views/Profilview.vue'
import AllCategories from '../views/AllCategories.vue'
import CartPage from '../views/CartPage.vue'
import CheckoutPage from '../views/CheckoutPage.vue'
// Import des composants d'authentification
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'
import AdminProducts from '../views/AdminProducts.vue'
import AdminOrder from '../views/AdminOrder.vue'

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: Home,
    props: true
  },
  { 
    path: '/Checkout', 
    name: 'CheckoutPage', 
    component: CheckoutPage,
    props: true
  },
  { 
    path: '/succes', 
    name: 'succesPage', 
    component: CheckoutPage,
    props: true
  },
  { 
    path: '/admin', 
    name: 'AdminProducts', 
    component: AdminProducts,
    props: true
  },
  { 
    path: '/adminOrder', 
    name: 'AdminOrder', 
    component: AdminOrder,
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
    path: '/profilview', 
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
  // Redirection par défaut
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/' 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // ✅ Optionnel: Comportement de scroll
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router