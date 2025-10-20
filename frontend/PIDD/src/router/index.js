import { createRouter, createWebHistory } from 'vue-router'

// Import des vues principales
import Home from '../views/Home.vue'
import Category from '../views/Category.vue'
import Product from '../views/Product.vue'
import Profilview from '../views/Profilview.vue'

// Import des composants de formulaire (si affichés comme pages indépendantes)
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'
import Profil from '../components/ProfilBtn.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/category/:id', name: 'Category', component: Category, props: true },
  { path: '/product/:id', name: 'Product', component: Product, props: true },
  { path: '/profil', name: 'Profil', component: Profil },
  { path: '/profilview', name: 'Profilview', component: Profilview },
  { path: '/login', name: 'Login', component: LoginForm },
  { path: '/register', name: 'Register', component: RegisterForm },
  // Redirection par défaut
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
