// backend/controllers/adminController.js
import { getAllProducts, addProduct, deleteProductById } from './productController.js';

// GET : récupérer tous les produits (dashboard admin)
export async function getAdminDashboard(request, reply) {  // ⬅️ Changé le nom
  try {
    const products = await getAllProducts();
    reply.send({ success: true, data: products });
  } catch (error) {
    console.error("[getAdminDashboard] error:", error);
    reply.status(500).send({ success: false, message: "Erreur serveur" });
  }
}

// POST : créer un produit
export async function createProduct(request, reply) {
  try {
    const newProduct = await addProduct(request.body);
    reply.status(201).send({ success: true, data: newProduct });
  } catch (error) {
    console.error("[createProduct] error:", error);
    reply.status(500).send({ success: false, message: "Erreur serveur" });
  }
}


// DELETE : supprimer un produit par ID
export async function deleteProduct(request, reply) {
    const productId = request.params.id;

    if (!productId) {
        return reply.status(400).send({ success: false, message: "ID du produit manquant." });
    }

    try {
        const isDeleted = await deleteProductById(productId);

        if (isDeleted) {
            reply.status(204).send();
        } else {
            reply.status(404).send({ success: false, message: `Produit avec l'ID ${productId} non trouvé.` });
        }
    } catch (error) {
        console.error("[deleteProduct] Erreur lors de la suppression :", error);
        reply.status(500).send({ success: false, message: "Erreur serveur interne lors de la suppression du produit." });
    }
}
    export async function updateProduct(request, reply) {
  try {
    const { id } = request.params;
    const updatedData = request.body;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return reply.status(404).send({ success: false, message: "Produit non trouvé" });
    }
    
    await product.update(updatedData);
    reply.send({ success: true, data: product, message: "Produit mis à jour" });
  } catch (error) {
    console.error("[updateProduct] error:", error);
    reply.status(500).send({ success: false, message: "Erreur serveur" });
  }
}
