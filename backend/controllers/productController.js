import { sequelize } from '../database/mysql.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
//import { getCart} from './cartController.js';

export async function getAllProducts(request, reply) {
  try {
    console.log("========== [getAllProducts] ==========");
       
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']]
    });

    if (!products || products.length === 0) {
      console.log("[getAllProducts] Aucun produit trouvé");
      return reply.send({ 
        success: true, 
        data: [],
        message: "Aucun produit trouvé" 
      });
    }
    
    console.log(`[getAllProducts] ${products.length} produits trouvés`);
    
    // CORRECTION: Utilisez reply.send() au lieu de return
    reply.send({ 
      success: true, 
      data: products 
    });
    
  } catch (err) {
    console.error("[getAllProducts] err:", err);
    reply.status(500).send({ 
      success: false,
      error: err.message 
    });
  }
}

// Example for finding one product by ID
export async function getProductById(request, reply) {
  try {
    
    const { productId } = request.body;
    const product = await Product.findByPk(productId);
    console.log(" [getProductById] productId :",productId);
    if (!product) {
    console.log(" [getProductById] Product not found :");
      return reply.status(404).send({ error: 'Product not found' });
    }
    reply.send(product);
  } catch (err) {
    console.log(" [getProductById] err :",err);
    reply.status(500).send({ error: err.message });
  }
}
export async function getProductByCategory(request, reply) {
  try {
    console.log("========== [getProductByCategory] ==========");
    console.log("[getProductByCategory] params:", request.params);
    
    const { id } = request.params; // ID de catégorie numérique (1, 2, 3)
    
    if (!id) {
      console.log("[getProductByCategory] Pas d'ID fourni");
      return reply.send({ 
        success: true, 
        data: [] 
      });
    }

    const categoryId = parseInt(id);
    
    // Validation
    if (![1, 2, 3].includes(categoryId)) {
      console.log("[getProductByCategory] Catégorie invalide:", categoryId);
      return reply.status(400).send({ 
        success: false,
        error: "Catégorie invalide (1, 2 ou 3 seulement)" 
      });
    }

    console.log(`[getProductByCategory] Recherche produits catégorie ${categoryId}`);
    
    // ✅ CORRECTION: Recherche par ID numérique, pas par nom
    const products = await Product.findAll({ 
      where: { category: categoryId }, // category est un nombre dans la BD
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`[getProductByCategory] ${products.length} produits trouvés`);
    
    // Debug: affichez les produits trouvés
    if (products.length > 0) {
      console.log("📦 Produits trouvés:", products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price
      })));
    }
    
    reply.send({
      success: true,
      data: products
    });

  } catch (error) {
    console.error("[getProductByCategory] error:", error);
    reply.status(500).send({ 
      success: false,
      error: "Erreur serveur" 
    });
  }
}
/* ============= MODIF DE PRODUCT ================ */

export async function addProductByAdmin(request, reply) {
  try {
    console.log("========== [addProductByAdmin] ==========");
    console.log("[addProductByAdmin] request.body:", request.body);
    
    // CORRECTION: Le produit est direct dans request.body, pas dans un objet product
    const productData = request.body;
    console.log("[addProductByAdmin] productData:", productData);

    // Validation
    if (!productData.name || !productData.category || productData.price < 0 || productData.quantity < 0) {
      console.log("[addProductByAdmin] Validation failed:", productData);
      return reply.status(400).send({ 
        success: false,
        error: 'Données produit invalides' 
      });
    }

    // Création du produit
    const createdProduct = await Product.create({
      name: productData.name, 
      category: productData.category,
      price: productData.price,
      quantity: productData.quantity,
      description: productData.description || '',
      img: productData.img || 'default.png'
    });
    
    console.log("[addProductByAdmin] Produit créé:", createdProduct.id);

    // CORRECTION: Répondre avec le produit créé
    reply.status(201).send({ 
      success: true, 
      data: createdProduct,
      message: "Produit créé avec succès" 
    });
    
  } catch (error) {
    // CORRECTION: Utilisez 'error' au lieu de 'err'
    console.error("[addProductByAdmin] error:", error);
    reply.status(500).send({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

export async function addProductToOrder(request, reply) {
  try {
     
  console.log("========================  [addProductToOrder] ========================");

  const { userId, productId, quantity = 1 } = request.body;

  if (!userId || !productId) {
    return reply.status(400).send({ error: 'userId and productId are required' });
  }
  console.log(" [addProductToOrder]  userId, productId, quantity :", userId, productId, quantity);

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty <= 0) {
    return reply.status(400).send({ error: 'quantity must be a positive integer' });
  }

    // Validate existence of user and product (outside transaction is OK for simple cases)
    const user = await User.findByPk(userId);
    if (!user) return reply.status(404).send({ error: 'User not found' });

    const product = await Product.findByPk(productId);
    if (!product) return reply.status(404).send({ error: 'Product not found' });

    // simple stock check
    if (product.quantity < qty) {
      return reply.status(400).send({ error: 'Not enough product stock' });
    }

    // Managed transaction
    const result = await sequelize.transaction(async (t) => {
      // find or create a pending order for this user
      let order = await Order.findOne({
        where: { userId: userId, status: 'pending' },
        transaction: t,
      });

      if (!order) {
        order = await Order.create(
          { userId: userId, totalPrice: 0.00, status: 'pending' },
          { transaction: t }
        );
      }

      // create the order item using product price snapshot
      const unitPrice = product.price; // DECIMAL stored as string usually, keep it as-is
      const orderItem = await OrderItem.create(
        {
          orderId: order.id,
          productId: product.id,
          quantity: qty,
          unitPrice: unitPrice,
        },
        { transaction: t }
      );

      // decrement product stock (simple)
      product.quantity = product.quantity - qty;
      console.log('\x1b[31m%s\x1b[0m', '=================');

      console.log('[addProductToOrder] ADDED product : ',product);

      await product.save({ transaction: t });

      // update order totalPrice (add qty * unitPrice)
      // convert to number for arithmetic, then format as string/decimal if desired
      const currentTotal = parseFloat(order.totalPrice || 0);
      const add = parseFloat(unitPrice) * qty;
      const newTotal = (currentTotal + add).toFixed(2);
      await order.update({ totalPrice: newTotal }, { transaction: t });
      
      // return the fresh order id or the created item
      return { orderId: order.id, orderItemId: orderItem.id };
    });

    // load the up-to-date order with items and product info (no txn)
    const populatedOrder = await Order.findByPk(result.orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });
      console.log(" [getDataOrder] populatedOrder : ",populatedOrder);

    return reply.status(201).send({ order: populatedOrder });
  } catch (err) {
    console.log(" [getDataOrder] err : ",err);
    request.log.error(err);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}


/* ================== NOT THE ROMVE ONE  */
/* export async function deleteFromCart(request, reply) {
  try {
    

        console.log("========================  [deleteFromCart] ========================");
       
        const { userId, productId } = request.body;
        console.log("[removeItem] userId, productId ",userId, productId)

        if (!userId || !productId) {
          console.log("[removeItem]Missing userId or productId ")
          return reply.code(400).send({ error: "Missing userId or productId" });
        }

        // Find the pending order of this user
        const order = await Order.findOne({
          where: { userId, status: "pending" }
        });

        if (!order) {
          console.log("[removeItem] No active order found for user ")
          return reply.code(404).send({ error: "No active order found for user" });
        }
        console.log("[removeItem]order ",order)

        // Find the matching order item
        const item = await OrderItem.findOne({
          where: {
            orderId: order.id,
            productId
          }
        });

        if (!item) {
          console.log("[removeItem]OrderItem not found in cart")
          
          return reply.code(404).send({ error: "Product not found in cart" });
        }

        // Delete the order item
        await item.destroy();

        // Check if order is now empty
        const remaining = await OrderItem.count({
          where: { orderId: order.id }
        });
          console.log("[removeItem] order.id : ",order.id)

        // If no items left, remove the order too
      if (remaining === 0) {
        await order.destroy();
        return reply.send({
          success: true,
          message: "Product removed and empty order deleted"
        });
      }

      // Otherwise update order price
      order.totalPrice = await OrderItem.sum("unitPrice", {
        where: { orderId: order.id }
      });

      await order.save();

      //const panier = getOrder(userId)
   //   console.log("[removeItem] panier : ",panier)

     //console.log("======================== END  [deleteFromCart] ========================");
     // reply.send(panier);
     console.log("======================== END  [deleteFromCart] ========================");
reply.send({
  success: true,
  message: "Produit supprimé du panier",
  orderId: order.id
});


  } catch (err) {
    console.log(err);
    reply.code(500).send({ error: "Server error" });
  }
}
  */

/// DELETE A PRODUCT (ADMIN)

  export async function updateProduct(request, reply) {
  try {
    console.log("========== [updateProduct] ==========");
    console.log("[updateProduct] params:", request.params);
    console.log("[updateProduct] body:", request.body);

    const { id } = request.params;
    const payload = request.body;

    console.log("[updateProduct] id:", id);
    console.log("[updateProduct] payload:", payload);

    // Vérifier que l'ID existe
    if (!id) {
      return reply.status(400).send({ 
        success: false,
        error: "ID manquant dans les paramètres" 
      });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      console.log("[updateProduct] Produit non trouvé, id:", id);
      return reply.status(404).send({ 
        success: false,
        error: "Product not found" 
      });
    }

    // Validation des données
    if (payload.price !== undefined && payload.price < 0) {
      return reply.status(400).send({
        success: false,
        error: "Le prix ne peut pas être négatif"
      });
    }

    if (payload.quantity !== undefined && payload.quantity < 0) {
      return reply.status(400).send({
        success: false,
        error: "La quantité ne peut pas être négative"
      });
    }

    // Mettre à jour le produit
    const updatedProduct = await product.update(payload);
    
    console.log("[updateProduct] SUCCÈS - Produit mis à jour:", updatedProduct.id);

    // Répondre avec le produit mis à jour
    reply.send({ 
      success: true,
      data: updatedProduct,
      message: "Product updated successfully" 
    });

  } catch (error) {
    console.error("[updateProduct] error:", error);
    reply.status(500).send({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
}

export async function deleteProduct(request, reply) {
  try {
    console.log("========== [deleteProduct] ==========");
    console.log("[deleteProduct] body:", request.body);

    const { productId } = request.body;
    
    // Validation
    if (!productId) {
      return reply.status(400).send({ 
        success: false,
        error: "ID manquant (productId requis)" 
      });
    }

    console.log("[deleteProduct] Suppression du produit ID:", productId);

    // Vérifier d'abord si le produit existe
    const product = await Product.findByPk(productId);
    
    if (!product) {
      console.log("[deleteProduct] Produit non trouvé, id:", productId);
      return reply.status(404).send({ 
        success: false,
        error: "Product not found" 
      });
    }

    // Supprimer le produit
    await product.destroy();
    
    console.log("[deleteProduct] SUCCÈS - Produit supprimé, id:", productId);
    
    // Répondre avec succès
    reply.send({ 
      success: true, 
      message: "Product deleted successfully",
      deletedId: productId
    });
    
  } catch (error) {
    console.error("[deleteProduct] error:", error);
    reply.status(500).send({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
}