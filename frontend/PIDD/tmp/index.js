import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Category from '../views/Category.vue'
import ProductDetails from '../views/ProductDetails.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
 /* { path: '/category/:id', name: 'Category', component: Category } */,
  { path: '/product/:id', name: 'ProductDetails', component: ProductDetails }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router