<template>
  <div>
    <h1>Produits de {{ categoryName }}</h1>
    <div v-if="products.length">
      <div v-for="p in products" :key="p.id" class="product">
        <router-link :to="'/product/' + p.id">
          <img :src="p.image" :alt="p.name" width="120" />
          <p>{{ p.name }}</p>
        </router-link>
      </div>
    </div>
    <p v-else>Aucun produit dans cette catégorie</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      products: [],
      categoryName: ""
    }
  },
  mounted() {
    const categoryId = this.$route.params.id
    if (categoryId == 1) {
      this.categoryName = "T-shirts Homme"
      this.products = [
        { id: 101, name: "T-shirt Noir", image: "/img/noir.png" },
        { id: 102, name: "T-shirt Blanc", image: "/img/blanc.png" }
      ]
    } else if (categoryId == 2) {
      this.categoryName = "T-shirts Femme"
      this.products = [
        { id: 201, name: "T-shirt Rose", image: "/img/rose.png" }
      ]
    } else {
      this.categoryName = "Inconnue"
      this.products = []
    }
  }
}
</script>