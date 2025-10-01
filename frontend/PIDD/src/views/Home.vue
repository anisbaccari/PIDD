
<template>
  <Index />
  <Catalogue/>  
</template>

<script>
import Catalogue from '../components/Catalogue.vue';
import Index from '../components/index.vue'

export default {
  components: {Catalogue,Index},
  name : "home",
  props : ['user']

};
</script>