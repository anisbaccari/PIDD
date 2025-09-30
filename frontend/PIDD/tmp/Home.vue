<template>
  <div>
    <h1>Catégories</h1>
    <div v-if="categories.length">
      <div v-for="cat in categories" :key="cat.id" class="category">
        <router-link :to="'/category/' + cat.id">
          <img :src="cat.image" :alt="cat.name" width="120" />
          <p>{{ cat.name }}</p>
        </router-link>
      </div>
    </div>
    <p v-else>Aucune catégorie disponible</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categories: [
        { id: 1, name: "T-shirts Homme", image: "/img/homme.png" },
        { id: 2, name: "T-shirts Femme", image: "/img/femme.png" },
        { id: 3, name: "T-shirts Enfants", image: "/img/enfant.png" }
      ]
    }
  }
}
</script>