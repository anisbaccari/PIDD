
<template>
  <Index  :user="user" :setUser="setUser" :getUser="getUser" />
  <Catalogue/>  
</template>

<script>
import Catalogue from '../components/Catalogue.vue';
import Index from '../components/index.vue'

export default {
  components: {Catalogue,Index},
  name : "home",
  props : ['user','getUser','setUser']

};
</script>