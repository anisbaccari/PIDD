<template>
  <div class="home-page">
     <!-- Bouton Admin flottant (visible uniquement aux admins) -->
    <router-link 
      v-if="user && user.role === 'admin'"
      to="/admin/dashboard" 
      class="admin-float-btn"
      title="Dashboard Admin"
    >
      <span class="admin-icon">👑</span>
      <span class="admin-text">Admin</span>
    </router-link>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content">
          <h1 class="hero-title">Élégance & Confort</h1>
          <p class="hero-subtitle">Découvrez notre collection exclusive de t-shirts premium</p>
          <div class="hero-actions">
            <router-link to="/categories" class="hero-btn primary">
              Explorer la collection
              <span class="btn-icon">→</span>
            </router-link>
            <router-link to="/products" class="hero-btn secondary">
              Voir les promotions
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🚚</div>
            <h3>Livraison Rapide</h3>
            <p>Livraison gratuite en 48h</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💳</div>
            <h3>Paiement Sécurisé</h3>
            <p>Paiement 100% sécurisé</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>Retour Facile</h3>
            <p>30 jours pour changer d'avis</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👕</div>
            <h3>Qualité Premium</h3>
            <p>Matériaux de haute qualité</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Catégories -->
    <section class="categories-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Nos Collections</h2>
          <p class="section-subtitle">Des styles pour tous les goûts</p>
        </div>
        <div class="categories-grid">
          <router-link 
            v-for="category in categories" 
            :key="category.id"
            :to="`/category/${category.id}`" 
            class="category-card"
          >
            <div class="category-image">
              <img :src="category.image" :alt="category.name" />
              <div class="category-overlay">
                <span class="category-link">Voir la collection →</span>
              </div>
            </div>
            <div class="category-content">
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-count">{{ category.count }} produits</p>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Produits populaires -->
    <section class="products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Les Plus Populaires</h2>
          <p class="section-subtitle">Nos best-sellers</p>
        </div>
        <div class="products-grid">
          <div
            v-for="product in popularProducts" 
            :key="product.id"
            class="product-card"
          >
            <div class="product-badge" v-if="product.badge">
              {{ product.badge }}
            </div>
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-actions">
                <button @click="addToCart(product)" class="action-btn cart-btn" title="Ajouter au panier">
                  <span class="action-icon">🛒</span>
                </button>
                <router-link :to="`/product/${product.id}`" class="action-btn view-btn" title="Voir détails">
                  <span class="action-icon">👁️</span>
                </router-link>
              </div>
            </div>
            <div class="product-content">
              <div class="product-meta">
                <span class="product-category">{{ product.category }}</span>
                <span class="product-rating">
                  <span class="stars">★★★★☆</span>
                  <span class="rating-text">4.5</span>
                </span>
              </div>
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-brand">{{ product.brand }}</p>
              <div class="product-footer">
                <span class="product-price">{{ product.price }} €</span>
                <button @click="addToCart(product)" class="add-to-cart-btn">
                  <span class="btn-text">Ajouter</span>
                  <span class="btn-icon">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="section-footer">
          <router-link to="/products" class="view-all-btn">
            Voir tous les produits
            <span class="btn-arrow">→</span>
          </router-link>
        </div>
      </div>
    </section>

  

    <!-- Newsletter -->
    <section class="newsletter-section">
      <div class="container">
        <div class="newsletter-content">
          <div class="newsletter-text">
            <h2 class="newsletter-title">Restez informés</h2>
            <p class="newsletter-subtitle">Inscrivez-vous pour recevoir nos offres exclusives</p>
          </div>
          <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
            <input 
              type="email" 
              placeholder="Votre adresse email" 
              class="newsletter-input"
              required
            />
            <button type="submit" class="newsletter-btn">
              S'abonner
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// Import des images
import enfantImg from '../assets/enfant.png'
import femmeImg from '../assets/femme.png'
import hommeImg from '../assets/homme.png'
import blancImg from '../assets/blanc.png'
import blancfemmeImg from '../assets/blancfemme.png'
import enfantbleuImg from '../assets/enfantbleu.png'
import enfantrougeImg from '../assets/enfantrouge.png'
import grisImg from '../assets/gris.png'
import noirImg from '../assets/noir.png'
import noirfemmeImg from '../assets/noirfemme.png'
import rosefemmeImg from '../assets/rosefemme.png'

export default {
  name: 'HomePage',
  props: ['user', 'setUser', 'addToCartGlobal'],
  data() {
    return {
      categories: [
        { 
          id: 1, 
          name: "Collection Homme", 
          image: hommeImg,
          count: 15
        },
        { 
          id: 2, 
          name: "Collection Femme", 
          image: femmeImg,
          count: 12
        },
        { 
          id: 3, 
          name: "Collection Enfants", 
          image: enfantImg,
          count: 8
        }
      ],
      popularProducts: [
        { 
          id: 101, 
          name: "T-shirt Noir Premium", 
          price: 24.99, 
          image: noirImg,
          img: 'noir.png',
          brand: "Nike",
          category: "Homme",
          badge: "Nouveau"
        },
        { 
          id: 102, 
          name: "T-shirt Sport Blanc", 
          price: 22.50, 
          image: blancImg,
          img: 'blanc.png',
          brand: "Adidas",
          category: "Homme",
          badge: "-20%"
        },
        { 
          id: 103, 
          name: "T-shirt Urban Gris", 
          price: 19.99, 
          image: grisImg,
          img: 'gris.png',
          brand: "Puma",
          category: "Homme"
        },
        { 
          id: 201, 
          name: "T-shirt Rose Élégant", 
          price: 26.99, 
          image: rosefemmeImg,
          img: 'rosefemme.png',
          brand: "Zara",
          category: "Femme",
          badge: "Best-seller"
        },
        { 
          id: 202, 
          name: "T-shirt Blanc Femme", 
          price: 23.50, 
          image: blancfemmeImg,
          img: 'blancfemme.png',
          brand: "H&M",
          category: "Femme"
        },
        { 
          id: 301, 
          name: "T-shirt Marvel Enfant", 
          price: 16.99, 
          image: enfantbleuImg,
          img: 'enfantbleu.png',
          brand: "Marvel",
          category: "Enfants",
          badge: "Populaire"
        }
      ]
    }
  },
  methods: {
    addToCart(product) {
      const productToAdd = {
        ...product,
        quantity: 1
      }
      
      if (this.addToCartGlobal) {
        this.addToCartGlobal(productToAdd);
        this.showSuccessNotification(`${product.name} a été ajouté au panier !`);
      } else {
        this.addToCartLocal(productToAdd);
      }
    },
    
    addToCartLocal(product) {
      const existingCart = JSON.parse(localStorage.getItem('monShop_cart') || '[]');
      const existingItem = existingCart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        existingCart.push(product);
      }
      
      localStorage.setItem('monShop_cart', JSON.stringify(existingCart));
      this.showSuccessNotification(`${product.name} a été ajouté au panier !`);
    },
    
    showSuccessNotification(message) {
      // Créer une notification temporaire
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.innerHTML = `
        <div class="notification-content">
          <span class="notification-icon">✅</span>
          <span class="notification-text">${message}</span>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    },
    
    subscribeNewsletter() {
      // Simuler l'inscription à la newsletter
      this.showSuccessNotification('Merci pour votre inscription à notre newsletter !');
    }
  },
  mounted() {
    // Ajouter les styles pour la notification
    const style = document.createElement('style');
    style.textContent = `
      .success-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .success-notification.hide {
        animation: slideOut 0.3s ease forwards;
      }
      .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .notification-icon {
        font-size: 1.2rem;
      }
      .notification-text {
        font-weight: 500;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8fafc;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero-section {
  height: 90vh;
  min-height: 600px;
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
              url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.3), transparent 50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  text-align: center;
  color: white;
  padding: 0 2rem;
  max-width: 800px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 1s ease;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  animation: fadeInUp 1s ease 0.2s both;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  animation: fadeInUp 1s ease 0.4s both;
}

.hero-btn {
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hero-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.hero-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
}

.hero-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Features */
.features-section {
  padding: 4rem 0;
  background: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border-radius: 16px;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.feature-card p {
  color: #6b7280;
  font-size: 0.95rem;
}

/* Section Header */
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

/* Categories */
.categories-section {
  padding: 6rem 0;
  background: #f8fafc;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.category-card {
  text-decoration: none;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.category-image {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.category-card:hover .category-image img {
  transform: scale(1.05);
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  align-items: flex-end;
  padding: 2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.category-link {
  color: white;
  font-weight: 500;
  font-size: 1.1rem;
}

.category-content {
  padding: 1.5rem;
}

.category-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.category-count {
  color: #6b7280;
  font-size: 0.95rem;
}

/* Products */
.products-section {
  padding: 6rem 0;
  background: white;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.product-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 2;
}

.product-image {
  position: relative;
  height: 250px;
  overflow: hidden;
  background: #f8fafc;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2rem;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.3s ease;
}

.product-card:hover .product-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.action-btn.cart-btn {
  color: #10b981;
}

.action-btn.view-btn {
  color: #3b82f6;
}

.action-btn:hover {
  transform: scale(1.1);
}

.product-content {
  padding: 1.5rem;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.product-category {
  font-size: 0.85rem;
  color: #8b5cf6;
  background: #f5f3ff;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stars {
  color: #fbbf24;
  font-size: 0.9rem;
}

.rating-text {
  font-size: 0.85rem;
  color: #6b7280;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.product-brand {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

.add-to-cart-btn {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  transform: translateY(-2px);
}

/* Section Footer */
.section-footer {
  text-align: center;
  margin-top: 3rem;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.view-all-btn:hover .btn-arrow {
  transform: translateX(5px);
}

/* Promo Banner */
.promo-banner {
  padding: 5rem 0;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  position: relative;
  overflow: hidden;
}

.promo-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
}

.banner-content {
  text-align: center;
  color: white;
  position: relative;
  z-index: 1;
}

.banner-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.banner-subtitle {
  font-size: 1.25rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
}

.countdown {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0 3rem;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.countdown-number {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.countdown-label {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.promo-btn {
  display: inline-block;
  padding: 1rem 3rem;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.promo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
}

/* Newsletter */
.newsletter-section {
  padding: 5rem 0;
  background: #f8fafc;
}

.newsletter-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.newsletter-text {
  margin-bottom: 2rem;
}

.newsletter-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.newsletter-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
}

.newsletter-form {
  display: flex;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.newsletter-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.newsletter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.newsletter-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.newsletter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .countdown {
    gap: 1rem;
  }
  
  .countdown-number {
    font-size: 2rem;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
  
  .container {
    padding: 0 1rem;
  }
}
</style>