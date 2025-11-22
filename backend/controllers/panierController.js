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
        const res = await Order.findAll({where : {userId:idByToken}});
        
        if(res[0] == null  )
        {
        console.log(" [getPanier] panier  empty ",res);
        return;
        }
        
        const tosend = res.map(o => o.get({ plain: true }));
        console.log(" [getPanier] panier :",tosend);
        /*  ============ */
      getOrder(idByToken)
        reply.send(res);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
}

export async function getOrder(id)
{
  try {
    
        console.log("======================== [getOrder] ========================");
        const idByToken = id;
        console.log(" [getOrder] idByToken :",idByToken);

       const order = await Order.findAll({
                where: { userId:idByToken },
                include: [
                  {
                    model: User,
                    as: "user"
                  },
                  {
                    model: OrderItem,
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
          console.log(JSON.stringify(order, null, 2));
          const userArray = order.map( o => o.user);
          const itemsArray = order.map( o => o.items);
          const orderArray = itemsArray.map(o => o);
          console.log('\x1b[31m%s\x1b[0m'," ================ [userArray ] ==============")
          console.log(" [getOrder] userArray :",userArray);
          console.log('\x1b[31m%s\x1b[0m'," ================ [itemsArray ] ==============")
          console.log(" [getOrder] itemsArray :",itemsArray);
          console.log('\x1b[31m%s\x1b[0m'," ================ [orderArray ] ==============")
          console.log(" [getOrder] orderArray :",orderArray);

          console.log("======================== END [getOrder] ========================");
/*           const productList = items.map(o => o.product);
          const product = productList.map(o => o.get({ plain: true }));
          const resItems = items.map(o => o.get({ plain: true }));
          console.log(" [getOrder] product :",product);

          const data = {user,product,resItems};
 */



  } catch (error) {
    console.log(" [getOrder] error :",error);
   
    
  }
}
