<script>
import Footer from './components/Footer.vue';
import Header from './components/Header.vue';
import Home from './views/Home.vue';

export default {
  components: {Home,Footer,Header }
};
</script>

<template>
    <div>
      <Header />
      <Home />
      <Footer />
    </div>
    
</template>


<style scoped>

</style>
