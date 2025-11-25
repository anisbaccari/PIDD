import {} from '../controllers/productController.js'
import {} from '../controllers/panierController.js'
import {} from '../controllers/categorieController.js'

export  const getAdmin= async (request, reply) => {
  try {
     const res = await getAllProducts(request,reply);
     console.log("[getAdmin] res",res)

  } catch (error) {
    console.log(" [getAdmin] error :",error);
    
  }

};
