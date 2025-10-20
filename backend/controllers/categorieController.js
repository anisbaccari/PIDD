import { sequelize } from "../database/mysql.js";
import { Product } from "../models/Product.js";

export async function getAllCategorie(request ,reply) {
    try {
            console.log("[getAllCategories] : req.param",request.body);
            const category = "Homme";
            const products = await Product.findAll();
            if (products.length === 0) {
            console.log('[categories] : no rows found');
            reply.code(401).send();
            return;
            }
                
        console.log('[categories] : rows found : ', products.length);
        reply.send(products);

    } catch (error) {
        console.log("[Categorie] : get > error : ",error);
        reply.status(501).send({error:error.message})
    }
}



export async function getCategorie(request ,reply) {
    try {
            console.log("[getAllCategories] : req.param",request.body);
            const category = "Homme";
            const products = await Product.findAll({ where: { category: category } });
            if (products.length === 0) {
            console.log('[categories] : no rows found');
            reply.code(401).send();
            return;
            }
                
        console.log('[categories] : rows found : ', products.length);
        reply.send(products);

    } catch (error) {
        console.log("[Categorie] : get > error : ",error);
        reply.status(501).send({error:error.message})
    }
}