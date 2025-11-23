import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';

export async function getPanier(request, reply) {
  try {

      console.log("======================== [getPanier] ========================");
      let id = request.user.id; 
      const idByToken = request.user?.id;
      console.log(" [getPanier] idByToken :",idByToken);
      const panier =  await getOrder(idByToken)

      reply.send(panier);
  } catch (err) {
    console.log(" [getPanier] err :",err);
    reply.status(500).send({ error: err.message });
  }
}

export async function getOrder(id)
{
  try {
    
        console.log("======================== [getOrder] ========================");
        const idByToken = id;

       const order = await Order.findAll({ // Panier (Commandes)
                where: { userId:idByToken },
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
          });

          const panier = getDataOrder(order);
          console.log(" [getOrder] orderList (panier) :", panier);
          console.log(" [getOrder] orderItem (Produits Commandees) :", panier.map( o => o.orderItem));
          console.log(" [getOrder] productList  :",  panier.map( o => o.productList));
          return  panier ;


  } catch (error) {
    console.log(" [getOrder] error :",error);
   
    
  }
}

function getDataOrder(order)
{
    try {
          console.log("========================  [getDataOrder] ========================");

          const ordersPlain = order.map(o => o.get({ plain: true }));
          const userArray = ordersPlain.map(o => o.user);
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
                              }));
          
         
          return panier 
    } catch (error) {
    console.log(" [getDataOrder] error :",error);
      
    }

}