<template>
  <div>
    <h1>Détails du produit</h1>
    <div v-if="product">
      <img :src="product.image" width="150" />
      <p><strong>Nom :</strong> {{ product.name }}</p>
      <p><strong>Marque :</strong> {{ product.brand }}</p>
      <p><strong>Prix :</strong> {{ product.price }} €</p>
    </div>
    <p v-else>Produit introuvable</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      product: null
    }
  },
  mounted() {
    const productId = this.$route.params.id
    const allProducts = [
      { id: 101, name: "T-shirt Noir", brand: "Nike", price: 20, image: "/img/noir.png" },
      { id: 102, name: "T-shirt Blanc", brand: "Adidas", price: 25, image: "/img/blanc.png" },
      { id: 201, name: "T-shirt Rose", brand: "Puma", price: 22, image: "/img/rose.png" }
    ]
    this.product = allProducts.find(p => p.id == productId)
  }
}
</script>