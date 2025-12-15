import { sequelize } from '../database/mysql.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { getOrder} from './panierController.js';

export async function getAllProducts(request, reply) {
  try {
        console.log("========================  [getAllProducts] ========================");
       
        const products =  await Product.findAll()

        if (!products) {
        console.log(" [getAllProducts] product empty :");

          return reply.status(404).send({ error: 'Product not found' });
        }
        //  console.log("[getAllProducts] product : ",products)
        const productList = products.map(o => o.get({ plain: true }));
        return productList
         
  } catch (err) {
    console.log(" [getAllProducts] err :",err);

    reply.status(500).send({ error: err.message });
  }
}

// Example for finding one product by ID
export async function getProductById(request, reply) {
  try {
    const { id } = request.params;
    const product = await Product.findOne({ where: { id } });
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

export async function getProductByCategory(request, reply)
{
    try {
          // id = 1 home, id = 2 femme , id = 3 kid
          console.log("========================  [getProductByCategory] ========================");
          console.log("  [getProductByCategory] id ",request.query?.id);
          
          const id  = request.query?.id
          console.log("  [getProductByCategory] id ",id);
          const products = await Product.findAll({ where: { category : id } });
          
          if (!products) {
              console.log(" [getProductByCategory] empty ");
              return reply.status(404).send({ error: 'Product not found' });
            }
          const productList = products.map(o => o.get({ plain: true }));
          return productList

    } catch (error) {
        console.log(" [getProductByCategory] err :",error);
        reply.status(500).send({ error: err.message });

    }
}

function getDataProduct(order)
{
    try {
          console.log("========================  [getDataOrder] ========================");

          const ordersPlain = order.map(o => o.get({ plain: true }));
         /*  const userArray = ordersPlain.map(o => o.user);
          const itemsArray = ordersPlain.map(o => o.items); // Produits Commandees 
          const productList =  ordersPlain.flatMap(o => o.items).map( i => i.product);
          
          const panier = ordersPlain.map(o => ({
                                id: o.id,
                                totalPrice: o.totalPrice,
                                status: o.status,
                                createdAt: o.createdAt,
                                orderItem: o.items || [],
                                productList: (o.items || []).map(i => i.product)
                                // add any order fields you want
                              })); */
          
         
          return ordersPlain; 
    } catch (error) {
    console.log(" [getDataProduct] error :",error);
      
    }

}

/* ============= MODIF DE PRODUCT ================ */

export async function addProductByAdmin(request,reply){

  try {
        console.log("========================  [addProductByAdmin] ========================");
        const {product} = request.body 
        console.log(" [addProductByAdmin]  product :", product);

        if(!product.name || !product.category || product.price < 0 || product.quantity < 0 )
        {
          if(!product.name)
            console.log("!product.name",product.name)
          if(!product.category)
            console.log("!product.category",product.category)
          if(product.price < 0)
            console.log(" product.price", product.price)
          if(product.quantity < 0)
            console.log("product.quantity",product.quantity)

          console.log(" [addProductByAdmin] err : product attribut missing  ",product);

        }


        const createdProduct = Product.create({name : product.name, category: product.category,
          price:product.price,quantity:product.quantity,description:product.description,img:product.img})
          console.log(" [addProductByAdmin] created ",product);

  
  } catch (error) {
    console.log(" [addProductByAdmin] err : ",err);
    request.log.error(err);
    return reply.status(500).send({ error: 'Internal server error' });
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
export async function deleteFromCart(request, reply) {
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

      const panier = getOrder(userId)
      console.log("[removeItem] panier : ",panier)

      console.log("======================== END  [deleteFromCart] ========================");
      reply.send(panier);

  } catch (err) {
    console.log(err);
    reply.code(500).send({ error: "Server error" });
  }
}


/// DELETE A PRODUCT (ADMIN)

  export async function deleteProduct(request,reply){
    
      console.log("========== [deleteProduct] ==========");
      console.log("params:", request.body);
      const { productId } = request.body;
      const id = productId
      try {
        const deleted = await Product.destroy({
          where: { id }
        });

        if (!deleted) {
        console.log(" [updateProduct]  Product not found");

          return reply.code(404).send({ error: "Product not found" });
        }
      console.log(" [updateProduct]  SUCCCED");

        return reply.send({ success: true, message: "Product deleted" });
      } catch (err) {
        console.error(err);
        return reply.code(500).send({ error: "Internal server error" });
      }
  }
export async function updateProduct(request, reply) {
  
  try {
          console.log("========== [updateProduct] ==========");
          console.log("params:", request.params);
          console.log("body:", request.body);

          const id = request.params.id;
          const payload = request.body;

          console.log("[updateProduct] id:", id);
          console.log("[updateProduct] payload:", payload);

          const product = await Product.findByPk(id);

          if (!product) {
          console.log("========== [updateProduct]no product ");
            
            return reply.status(404).send({ error: "Product not found" });
          }

          const res = await product.update(payload);
          console.log("========== [updateProduct] SUCCES VUPDATE  ",res);

          reply.send({ message: "Product updated", product });


  } catch (error) {
          console.log("  [getProductByCategory] error ",error);
    
  }
}


// Example Fastify route registration (e.g., in routes.js)
/* export default async function (fastify) {
  fastify.post('/orders/add-item', addProductToOrder);
} */
