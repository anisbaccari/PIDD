import { sequelize } from "../database/mysql.js";
import { Product } from "../models/Product.js";

export async function getAllCategorie(request, reply) {
    try {
        const products = await Product.findAll();
        
        if (products.length === 0) {
            console.log('[getAllCategorie] : aucun produit trouvé');
            reply.send([]);
            return;
        }
                
        console.log('[getAllCategorie] : produits trouvés : ', products.length);
        reply.send(products);

    } catch (error) {
        console.log("[getAllCategorie] : error : ", error);
        reply.status(500).send({ error: error.message });
    }
}



export async function getCategorieById(request, reply) {
    try {
        const categoryId = request.params.id; // ✅ Récupérer l'ID de l'URL
        console.log("[getCategorieById] : categoryId", categoryId);
        
        // ✅ Convertir l'ID en nom de catégorie
        const categoryNames = {
            '1': 'Homme',
            '2': 'Femme', 
            '3': 'Enfant'
        };
        
        const categoryName = categoryNames[categoryId];
        
        if (!categoryName) {
            console.log('[getCategorie] : category ID invalide');
            reply.code(404).send({ error: 'Catégorie non trouvée' });
            return;
        }
        
        // ✅ Filtrer par le nom de catégorie
        const products = await Product.findAll({ 
            where: { category: categoryName } 
        });
        
        if (products.length === 0) {
            console.log('[getCategorieById] : aucun produit trouvé');
            reply.send([]); // ✅ Renvoyer un tableau vide au lieu de 401
            return;
        }
                
        console.log('[getCategorieById] : produits trouvés : ', products.length);
        reply.send(products);

    } catch (error) {
        console.log("[getCategorie] : error : ", error);
        reply.status(500).send({ error: error.message });
    }

}