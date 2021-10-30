<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Login</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-card style="height: 600px; border-radius: 9px">
          <ion-progress-bar v-if="authenticating" type="indeterminate"></ion-progress-bar>
          <ion-card-header style="">
            <ion-card-title style="text-align: center;">Faça seu login</ion-card-title>
          </ion-card-header>
          <!-- Valor -->
          <ion-card-content style="">
            <ion-row class="text-center">
              <ion-col size="1"></ion-col>
              <ion-col size="10">
                <ion-item>
                  <ion-label position="floating">Email</ion-label>
                  <ion-input v-model="email"></ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="10">
                <ion-item>
                  <ion-label position="floating">Senha</ion-label>
                  <ion-input
                    v-model="password"
                    type="password"
                  ></ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="1"></ion-col>
            </ion-row>
            <!-- Valor -->

            <!-- Salvar -->
            <ion-row>
              <ion-col size="1"></ion-col>
              <ion-col size="10">
                <ion-button expand="block" shape="round" @click="login" :disabled="formValidate || authenticating"
                  >Entrar</ion-button
                >
              </ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="10" style="text-align: center;">
                <ion-router-link href="/recoverPassword" class="underline">Recuperar minha senha</ion-router-link>
              </ion-col>
              <ion-col size="10" style="text-align: center;">
                <ion-router-link href="/register" class="underline">Cadastre-se</ion-router-link>
              </ion-col>
              <ion-col size="1"></ion-col>
            </ion-row>
            <!-- Salvar -->
          </ion-card-content>
        </ion-card>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>

/* eslint-disable */
import { signInWithEmailAndPassword,getAuth, signOut } from "firebase/auth";

export default {
  data: () => {
    return {
      email: '',
      password: '',
      authenticating: false
    };
  },
  mounted() {
    const auth = getAuth()
    signOut(auth)

    // for testes finality
    if(process.env.NODE_ENV === 'development'){
      this.email = 'elizeu@gmail.com'
      this.password = '123456'
    }
  },
  methods: {
    async login() {
      if (this.validateForm()) {
        this.authenticating = true
        signInWithEmailAndPassword(getAuth(), this.email, this.password).then(()=>{

          setTimeout(()=>{
            this.authenticating = false
            this.$router.push('/tabs/tab1')
          }, 2000)
        }).catch((error)=>{
          setTimeout(()=>{
            this.authenticating = false
            if(error.message.includes('wrong-password') || error.message.includes('user-not-found')){
              this.showToast('danger', 'Email ou senha inválidos')
            }else{
              this.showToast('danger', 'Erro ao fazer login')
            }
            console.log(error.message)
          }, 2000)
        })
      }
    },

    validateForm() {
      if (this.email == "") {
        this.showToast("danger", "Informe o usuario.");
        return false;
      }

      if (this.password == "") {
        this.showToast("danger", "Informe a senha.");
        return false;
      }

      return true;
    },

    clearForm() {
      this.monthlyIncome = {
        month: "",
        amount: "",
      };
    }
  },
  computed:{
    formValidate(){
      return this.email == '' || this.password == ''
    }
  }
};
</script>

<style scoped>
.ion-color-primary{
  --ion-color-base: white!important
}

ion-title{
  color: #3880ff;
}

ion-content {
  --ion-background-color: #3880ff;
}

ion-router-link{
  color: #F74FA8!important;
}

ion-item {
  /* font-size: 12px!important; */
  --ion-background-color: white;
}

ion-card {
  --ion-background-color: white;
}

ion-label {
  font-family: "LabelInputsFont" !important;
  /* font-size: 15px!important; */
  color: #F74FA8!important;
  font-weight: bold;
}

.head-list {
  font-family: "HeadTableFont" !important;
}

ion-card-header{
  padding: 60px;
}

@media screen and (min-width: 800px) {
  ion-card {
    width: 30%;
  }

  ion-grid{
    display: flex; 
    align-items: center; 
    justify-content: center;
  }
}
</style>