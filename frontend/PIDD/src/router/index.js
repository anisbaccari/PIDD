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
import Adminview from '../views/Adminview.vue'
import AdminStat from '../views/AdminStat.vue'



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
    name: 'Adminview', 
    component: Adminview,
    props: true
  },
  { 
    path: '/adminStatView', 
    name: 'AdminStat', 
    component: AdminStat,
    props: true
  },
  { 
    path: '/adminProductView', 
    name: 'AdminProducts', 
    component: AdminProducts,
    props: true
  },
  { 
    path: '/adminOrderView', 
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
router.beforeEach((to, from, next) => {
// Define routes that require authentication
const requiresAuth = [
'/admin',
'/adminStatView',
'/adminProductView',
'/adminOrderView',
'/profilview',
'/checkout'
];

// Check if current route requires auth
const routeRequiresAuth = requiresAuth.some(route => to.path.startsWith(route));

// Check if user is logged in (adjust based on your auth method)
const isLoggedIn = localStorage.getItem('token') !== null;

if (routeRequiresAuth && !isLoggedIn) {
// Redirect to login if trying to access protected route without auth
next('/login');
} else if (to.path === '/login' && isLoggedIn) {
// Redirect to home if already logged in and trying to access login
next('/');
} else {
// Allow navigation
next();
}
});

export default router