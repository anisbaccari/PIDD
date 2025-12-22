// controllers/orderController.js
import  {  Order}  from '../models/Order.js';
import  {   OrderItem }  from '../models/OrderItem.js';
import  {  Product }  from '../models/Product.js';
import   {  User } from '../models/User.js';
import { sequelize } from '../database/mysql.js';
import { Op } from 'sequelize';


 //* 🔹 POST /api/orders/confirm
 //* Transforme le panier (Order pending) en commande confirmée
// * Body: { paymentMethod, shippingAddress }
 //*/
export async function confirmCartOrder(request, reply) {
  const transaction = await sequelize.transaction()
  
  try {
    console.log('======================== [confirmCartOrder] ========================')
    
    const userId = request.user?.id
    if (!userId) {
      await transaction.rollback()
      return reply.code(401).send({ 
        success: false,
        error: 'Non autorisé' 
      })
    }

    const { paymentMethod, shippingAddress } = request.body

    // Validation des données
    if (!paymentMethod) {
      await transaction.rollback()
      return reply.code(400).send({ 
        success: false,
        error: 'Méthode de paiement requise' 
      })
    }

    if (!shippingAddress) {
      await transaction.rollback()
      return reply.code(400).send({ 
        success: false,
        error: 'Adresse de livraison requise' 
      })
    }

    // 1️⃣ Récupérer la commande pending
    const order = await Order.findOne({
      where: { 
        userId, 
        status: 'pending' 
      },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }],
      transaction
    })

    if (!order) {
      await transaction.rollback()
      return reply.code(404).send({ 
        success: false,
        error: 'Aucun panier trouvé' 
      })
    }

    if (!order.items || order.items.length === 0) {
      await transaction.rollback()
      return reply.code(400).send({ 
        success: false,
        error: 'Le panier est vide' 
      })
    }

    console.log(`📦 [confirmCartOrder] Commande #${order.id} trouvée avec ${order.items.length} articles`)

    // 2️⃣ Vérifier le stock et diminuer les quantités
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId, { transaction })
      
      if (!product) {
        await transaction.rollback()
        return reply.code(404).send({ 
          success: false,
          error: `Produit ${item.productId} non trouvé` 
        })
      }

      // Vérifier le stock disponible
      if (product.quantity < item.quantity) {
        await transaction.rollback()
        return reply.code(400).send({ 
          success: false,
          error: `Stock insuffisant pour ${product.name}. Disponible: ${product.quantity}, demandé: ${item.quantity}` 
        })
      }

      // Diminuer le stock
      console.log(`📉 [confirmCartOrder] ${product.name}: ${product.quantity} → ${product.quantity - item.quantity}`)
      product.quantity -= item.quantity
      await product.save({ transaction })
    }

    // 3️⃣ Mettre à jour la commande
    order.status = 'paid'
    order.paymentMethod = paymentMethod
    
    // Si shippingAddress est un objet, le convertir en JSON string
    if (typeof shippingAddress === 'object') {
      order.shippingAddress = JSON.stringify(shippingAddress)
    } else {
      order.shippingAddress = shippingAddress
    }
    
    await order.save({ transaction })

    await transaction.commit()

    console.log(`✅ [confirmCartOrder] Commande #${order.id} confirmée avec succès`)

    // 4️⃣ Récupérer la commande complète pour la réponse
    const confirmedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price', 'img']
          }]
        }
      ]
    })

    reply.send({
      success: true,
      message: 'Commande confirmée avec succès',
      order: confirmedOrder
    })

  } catch (error) {
    await transaction.rollback()
    console.error('❌ [confirmCartOrder] Erreur:', error)
    reply.code(500).send({ 
      success: false,
      error: 'Erreur serveur lors de la confirmation de la commande',
      details: error.message
    })
  }
}

// POST /api/orders/create - Créer une commande
export async function createOrder(request, reply) {
  const transaction = await Order.sequelize.transaction();
  
  try {
    console.log('======================== [createOrder] ========================');
    
    const userId = request.user?.id;
    if (!userId) {
      await transaction.rollback();
      return reply.code(401).send({ error: 'Non autorisé' });
    }

    const {
      items,
      totalPrice,
      paymentMethod,
      shippingAddress,
      shippingMethod,
      notes
    } = request.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return reply.code(400).send({ error: 'Le panier est vide' });
    }

    if (!totalPrice || totalPrice <= 0) {
      await transaction.rollback();
      return reply.code(400).send({ error: 'Prix total invalide' });
    }

    if (!paymentMethod) {
      await transaction.rollback();
      return reply.code(400).send({ error: 'Méthode de paiement requise' });
    }

    if (!shippingAddress) {
      await transaction.rollback();
      return reply.code(400).send({ error: 'Adresse de livraison requise' });
    }

    // Vérifier le stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return reply.code(404).send({ 
          error: `Produit ${item.productId} non trouvé` 
        });
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return reply.code(400).send({ 
          error: `Stock insuffisant pour ${product.name}` 
        });
      }
    }

    // Créer la commande
    const order = await Order.create({
      userId,
      totalPrice: parseFloat(totalPrice),
      status: 'confirmed',
      paymentMethod,
      paymentStatus: 'paid',
      shippingAddress,
      shippingMethod: shippingMethod || 'Standard',
      notes: notes || null
    }, { transaction });

    console.log('✅ Commande créée:', order.id);

    // Créer les items et diminuer le stock
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice || item.price || 0)
      }, { transaction });

      const product = await Product.findByPk(item.productId, { transaction });
      product.stock -= item.quantity;
      await product.save({ transaction });
    }

    await transaction.commit();

    // Récupérer la commande complète
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'img']
            }
          ]
        }
      ]
    });

    reply.send({
      success: true,
      message: 'Commande créée avec succès',
      order: completeOrder
    });

  } catch (error) {
    await transaction.rollback();
    console.error('[createOrder] Erreur:', error);
    reply.code(500).send({ 
      error: 'Erreur serveur'
    });
  }
}

// GET /api/orders/user - Commandes de l'utilisateur
export async function getUserOrders(request, reply) {
  try {
    console.log('======================== [getUserOrders] ========================');
    
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: 'Non autorisé' });
    }

    const { page = 1, limit = 10, status } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'img']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    reply.send({
      success: true,
      orders: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('[getUserOrders] Erreur:', error);
    reply.code(500).send({ error: 'Erreur serveur' });
  }
}


// GET /api/orders/:orderId - Détails d'une commande
export async function getOrderById(request, reply) {
  try {
    console.log('======================== [getOrderById] ========================');
    
    const userId = request.user?.id;
    const { orderId } = request.params;

    if (!userId) {
      return reply.code(401).send({ error: 'Non autorisé' });
    }

    const order = await Order.findOne({
      where: { 
        id: orderId,
        userId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'name', 'lastName']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    if (!order) {
      return reply.code(404).send({ error: 'Commande non trouvée' });
    }

    reply.send({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('[getOrderById] Erreur:', error);
    reply.code(500).send({ error: 'Erreur serveur' });
  }
}

// PUT /api/orders/:orderId/cancel - Annuler une commande
export async function cancelOrder(request, reply) {
  const transaction = await Order.sequelize.transaction();
  
  try {
    console.log('======================== [cancelOrder] ========================');
    
    const userId = request.user?.id;
    const { orderId } = request.params;

    if (!userId) {
      await transaction.rollback();
      return reply.code(401).send({ error: 'Non autorisé' });
    }

    const order = await Order.findOne({
      where: {
        id: orderId,
        userId,
        status: { [Op.in]: ['pending', 'confirmed', 'processing'] }
      },
      include: [{
        model: OrderItem,
        as: 'items'
      }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return reply.code(404).send({ 
        error: 'Commande non trouvée ou ne peut pas être annulée' 
      });
    }

    // Restaurer le stock
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (product) {
        product.stock += item.quantity;
        await product.save({ transaction });
      }
    }

    // Annuler la commande
    order.status = 'cancelled';
    await order.save({ transaction });

    await transaction.commit();

    reply.send({
      success: true,
      message: 'Commande annulée avec succès',
      order: order
    });

  } catch (error) {
    await transaction.rollback();
    console.error('[cancelOrder] Erreur:', error);
    reply.code(500).send({ error: 'Erreur serveur' });
  }
}

// GET /api/orders/stats - Statistiques
export async function getOrderStats(request, reply) {
  try {
    console.log('======================== [getOrderStats] ========================');
    
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: 'Non autorisé' });
    }

    const stats = await Order.findOne({
      where: { userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
        [
          sequelize.fn('SUM', 
            sequelize.literal("CASE WHEN status != 'cancelled' THEN totalPrice ELSE 0 END")
          ), 
          'totalSpent'
        ]
      ],
      raw: true
    });

    const recentOrders = await Order.findAll({
      where: { userId },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'img']
        }]
      }]
    });

    reply.send({
      success: true,
      stats: {
        totalOrders: parseInt(stats.totalOrders) || 0,
        totalSpent: parseFloat(stats.totalSpent) || 0,
        recentOrders: recentOrders
      }
    });

  } catch (error) {
    console.error('[getOrderStats] Erreur:', error);
    reply.code(500).send({ error: 'Erreur serveur' });
  }
}

// GET /api/orders/tracking/:orderNumber - Suivi
export async function trackOrder(request, reply) {
  try {
    console.log('======================== [trackOrder] ========================');
    
    const { orderNumber } = request.params;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).send({ error: 'Non autorisé' });
    }

    const order = await Order.findOne({
      where: {
        id: orderNumber,
        userId
      },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'img']
        }]
      }]
    });

    if (!order) {
      return reply.code(404).send({ 
        error: 'Commande non trouvée' 
      });
    }

    reply.send({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('[trackOrder] Erreur:', error);
    reply.code(500).send({ error: 'Erreur serveur' });
  }
}


export async function updateOrder(orderId)
{
  try {
    console.log('\x1b[31m%s\x1b[0m',"======================== [updateOrder] ========================");

    const order = await Order.findByPk(orderId);

    if(!order)
    {
      console.log('\x1b[31m%s\x1b[0m',' ORDER empty')
      return null
    }

    order.status = 'paid'
    order.save()
    console.log(" [updateOrder] order ",order);

    console.log(" [updateOrder] succed ");

    return order;
    
  } catch (error) {
    console.log(" [getOrderById] error :",error);
    
  }
}

/*  ADMIN  */

export async function getAllOrder()
{

  try {
    console.log('\x1b[31m%s\x1b[0m',"======================== [getAllOrder] ========================");
    const order = await Order.findAll({ // Panier (Commandes)
      include: [
        {
          model: User,
          as: "user"
        },
        {
          model: OrderItem,//Produits commandees 
          as: "items",
          include: [
            {
              model: Product,
              as: "product"
            }
          ]
        }
      ]
})
    if(!order)
      {
        console.log('\x1b[31m%s\x1b[0m',' ORDER empty')
        return null
      }
    console.log('\x1b[31m%s\x1b[0m',' [getAllOrder] order',order)

    const orderArray = getDataOrder(order)
    console.log('\x1b[31m%s\x1b[0m',' [getAllOrder] orderArray',orderArray)

    return orderArray

  } catch (error) {
    console.log(" [getAllOrder] error :",error);
    
  }
}


export async function deleteOrder(orderId){
  
  try {
    console.log('\x1b[31m%s\x1b[0m',"======================== [getAllOrder] ========================");
    console.log(" [getAllOrder] orderId :",orderId);
    
    await Order.destroy({
      where: { id: orderId }
    })
    console.log('\x1b[31m%s\x1b[0m',' [DeleteOrder] deleted')


  } catch (error) {
    console.log(" [getAllOrder] error :",error);
    
  }
}

// GET /api/orders/:orderId/items - Items d'une commande
export async function getOrderItems(request, reply) {
  try {
    const userId = request.user?.id;
    const { orderId } = request.params;

    if (!userId) {
      return reply.code(401).send({ error: 'Non autorisé' });
    }

    // Vérifier que l'utilisateur a accès à cette commande
    const order = await Order.findOne({
      where: { id: orderId, userId }
    });

    if (!order) {
      return reply.code(404).send({ error: 'Commande non trouvée' });
    }

    const items = await OrderItem.findAll({
      where: { orderId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'img']
      }],
      order: [['createdAt', 'ASC']]
    });

    reply.send({
      success: true,
      items: items
    });

  } catch (error) {
    console.error('[getOrderItems] Erreur:', error);
    reply.code(500).send({ error: 'Erreur serveur' });
  }
}