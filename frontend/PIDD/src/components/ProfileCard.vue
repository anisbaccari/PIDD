<template>
    <div class="profilCard">
        <div class="profilInfo">
            <p>name : {{ DataUser.username }} id: {{ DataUser.id }}</p>
        </div>
    </div>


</template>



<script>
import api from '../api';

export default {
    props : ["user","getUser","setUser"],
    name : 'Profil',
    data(){
         return {
           DataUser  : this.getUser() || { id:'', username : "", password :""},
           token : ""
         }   
    },
    methods :{
      async  getProfil(){
        try {
                this.token = localStorage.getItem('token'); 
                if(this.token == "")
                {
                    console.log("[Profil] : no token found ");
                    return;
                }
                if(!this.DataUser.id)
                    return;
                console.log("[Profil] : token found : ",this.token);
                console.log("[Profil] : Data id : ",this.DataUser.id);
                const res =   await api.get(`http://localhost:3000/profil/:${this.DataUser.id}`);
                console.log("[Profil] response  : ", res);
               // this.DataUser.username = res.data.user.username;

            } catch (error) {
                console.error("[Profil] Error : ",error);
            }
        }
    },
    mounted(){
        this.getProfil();
    }
}

</script>