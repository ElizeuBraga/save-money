<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Recuperar senha</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Recuperar senha</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-card style="height: 600px; border-radius: 9px">
          <ion-card-header style="">
            <ion-card-title style="text-align: center;">Recupere sua senha</ion-card-title>
          </ion-card-header>
          <!-- Valor -->
          <ion-card-content style="">
            <ion-row class="text-center">
              <ion-col size="1"></ion-col>
              <ion-col size="10">
                <ion-item>
                  <ion-label position="floating">Email ou Telefone</ion-label>
                  <ion-input v-model="user.user"></ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="1"></ion-col>
            </ion-row>
            <!-- Valor -->

            <!-- Salvar -->
            <ion-row>
              <ion-col size="1"></ion-col>
              <ion-col size="10">
                <ion-button expand="block" shape="round" @click="send"
                  >Enviar</ion-button
                >
              </ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="10" style="text-align: center;">
                <ion-router-link href="/login" class="underline">Retornar para tela de login</ion-router-link>
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
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
} from "@ionic/vue";
import axios from "axios";

export default {
  name: "Tab2",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonInput,
  },
  data: () => {
    return {
      user: {
        user: "",
        password: "",
      },
      monthlyIncomes: [],
    };
  },
  mounted() {
    axios.create({
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
    });
    const user = JSON.parse(localStorage.getItem("user"));

    // this.user.user = user.email ? user.email : user.phone;
    // this.loadExpenses()
  },
  methods: {
    async send() {
      if (this.validateForm()) {
        this.showToast('warning', 'Em construção')
        // axios
        //   .post(process.env.VUE_APP_API_URL + "/auth/login", this.user)
        //   .then((response) => {
        //     if (response.data) {
        //       localStorage.setItem("user", JSON.stringify(response.data));
        //       this.$router.push("/tabs/tab1");
        //     } else {
        //       this.showToast("danger", "Acesso negado!");
        //     }
        //   });
      }
    },

    validateForm() {
      if (this.user.user == "") {
        this.showToast("danger", "Informe seu email ou telefone.");
        return false;
      }

      return true;
    },

    clearForm() {
      this.monthlyIncome = {
        month: "",
        amount: "",
      };
    },

    loadExpenses() {
      axios
        .get(process.env.VUE_APP_API_URL + "/monthlyIncomes")
        .then((response) => {
          this.monthlyIncomes = response.data;
          console.log(this.monthlyIncomes);
          // console.log(response.data)
        });
    },
  },
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