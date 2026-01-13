import axios from 'axios';
import api from '../api.js';
const API_URL = 'http://localhost:3000/product';

export const productService = {
  async getAll() {
    try {
      console.log('🔄 productService.getAll() appelé');
      
      // UTILISEZ /allproduct (minuscules) comme défini dans vos routes
      //const res = await axios.get(`${API_URL}/allproduct`);
        const res = await api.get(`http://localhost:3000/product/allproduct`/* , {
        headers: { Authorization: `Bearer ${token}` }
      } */);
      console.log('📊 Réponse getAll:', res.data);
      
      // Votre contrôleur corrigé retourne { success: true, data: [...] }
      if (res.data && res.data.success === true) {
        console.log(`✅ ${res.data.data?.length || 0} produits récupérés`);
        return res.data.data || [];
      } else {
        console.warn('⚠️ Réponse sans succès:', res.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des produits:', error);
      
      // Debug détaillé
      if (error.response) {
        console.error('📊 Détails erreur:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url
        });
      }
      
      throw error;
    }
  },

  async getByCategory(categoryId) {
    try {
      console.log(`🔄 productService.getByCategory(${categoryId}) appelé`);
      
      // Utilisez /all avec query param 'id' selon votre contrôleur
      const res = await axios.get(`${API_URL}/category/${categoryId}`);
      
      console.log(`📊 Réponse catégorie ${categoryId}:`, res.data);
      
      if (res.data && res.data.success === true) {
        return res.data.data || [];
      }
      return [];
    } catch (error) {
      console.error(`❌ Erreur catégorie ${categoryId}:`, error);
      throw error;
    }
  },

  async getById(id) {
    try {
      console.log(`🔄 productService.getById(${id}) appelé`);
      
      // Votre contrôleur utilise POST /getProduct avec body {productId}
      const res = await axios.post(`${API_URL}/getProduct`, {
        productId: id
      });
      
      console.log('📊 Réponse getById:', res.data);
      
      if (res.data && res.data.success === true) {
        return res.data.data;
      } else {
        throw new Error(res.data?.error || 'Produit non trouvé');
      }
    } catch (error) {
      console.error(`❌ Erreur produit ${id}:`, error);
      
      // Fallback: chercher dans la liste complète
      try {
        console.log('🔄 Fallback: recherche dans getAll()...');
        const allProducts = await this.getAll();
        const product = allProducts.find(p => p.id == id);
        
        if (product) {
          console.log(`✅ Produit ${id} trouvé via fallback`);
          return product;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback a aussi échoué:', fallbackError);
      }
      
      throw error;
    }
  },

  async create(product) {
    try {
      console.log('🔄 productService.create() appelé:', product);
      
      // Utilisez /addAdmin avec les données directement (pas d'objet 'product' wrapper)
      const res = await axios.post(`${API_URL}/addAdmin`, product);
      
      console.log('📊 Réponse création:', res.data);
      
      if (res.data && res.data.success === true) {
        return res.data.data || res.data;
      } else {
        throw new Error(res.data?.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('❌ Erreur création produit:', error);
      throw error;
    }
  },

  async update(id, product) {
    try {
      console.log(`🔄 productService.update(${id}) appelé:`, product);
      
      // Utilisez /update/:id selon vos routes
      const res = await axios.put(`${API_URL}/update/${id}`, product);
      
      console.log('📊 Réponse mise à jour:', res.data);
      
      if (res.data && res.data.success === true) {
        return res.data.data || res.data;
      } else {
        throw new Error(res.data?.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error(`❌ Erreur mise à jour produit ${id}:`, error);
      throw error;
    }
  },

  async remove(id) {
    try {
      console.log(`🔄 productService.remove(${id}) appelé`);
      
      // Utilisez /deleteProduct avec body {productId}
      const res = await axios.delete(`${API_URL}/deleteProduct`, {
        data: { productId: id }
      });
      
      console.log('📊 Réponse suppression:', res.data);
      
      if (res.data && res.data.success === true) {
        return res.data;
      } else {
        throw new Error(res.data?.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error(`❌ Erreur suppression produit ${id}:`, error);
      throw error;
    }
  }
};