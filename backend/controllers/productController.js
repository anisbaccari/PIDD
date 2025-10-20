// controllers/profileController.js
import { Product } from '../models/Product.js';

export async function getAllProducts(request, reply) {
  try {
    const products = await Product.findAll();
    reply.send(products);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
}

// Example for finding one product by ID
export async function getProductById(request, reply) {
  const { id } = request.params;
  try {
    const product = await Product.findOne({ where: { id } });
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }
    reply.send(product);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
}