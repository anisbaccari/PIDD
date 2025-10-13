<script>
import Footer from './components/Footer.vue';
import NavBar from './components/NavBar.vue';
import Home from './views/Home.vue';

export default {
  components: { NavBar,Home,Footer }
};
</script>

<template>
    <div>
      <NavBar />
      <Home />
      <Footer />
    </div>
    
</template>


<style scoped>

</style>
