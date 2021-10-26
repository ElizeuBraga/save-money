<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Inserir dados</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Dados</ion-title>
        </ion-toolbar>
      </ion-header>

        <!-- List of Text Items -->
        <ion-row>
          <ion-col>
            <ion-card>
              <ion-card-title color="primary" class="ion-text-center"
                >Inseridos recentes</ion-card-title
              >
              <ion-card-content align="center">
                <ion-item>
                  <ion-label class="head-list ion-text-left"
                    >Descrição</ion-label
                  >
                  <ion-label class="head-list ion-text-right">Valor</ion-label>
                </ion-item>
                <ion-list v-for="e in expenses" :key="e.id">
                  <ion-item @click="updateExpense(e)">
                    <ion-label class="ion-text-left">{{e.description}}<br><p class="label-italic">{{e.category}}</p></ion-label>
                    <ion-label class="ion-text-right">{{"R$ " + parseFloat(e.amount).toFixed(2).replace(".", ",")}}<br><p class="label-italic">{{formatDate(e.created_at)}}</p></ion-label>
                  </ion-item>
                </ion-list>
              </ion-card-content>
              <!-- List of Text Items -->
            </ion-card>
          </ion-col>
        </ion-row>
      <!-- </ion-grid> -->

      <ion-fab slot="fixed" style="margin-top:158%; margin-left:80%">
        <ion-fab-button @click="updateExpense({})">+</ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,IonHeader,IonToolbar,IonTitle,IonContent,modalController,IonFab, IonFabButton,IonCard,IonCardTitle,IonLabel,IonItem,IonCardContent, IonList, IonCol, IonRow
} from "@ionic/vue";
import axios from "axios";
import Modal from '../components/EditProductModal.vue'
import eventBus  from '../eventBus'

export default {
  name: "Tab2",
  components: {IonHeader,IonToolbar,IonTitle,IonContent,IonPage,IonFab, IonFabButton,IonCard,IonCardTitle, IonLabel, IonItem,IonCardContent, IonList, IonCol, IonRow},
  data: () => {
    return {
      modal: '',
      expenses: [],
      categories:[]
    };
  },
  async mounted() {
    eventBus().emitter.on("modalClosed", () => {
        this.loadExpenses()
    });

    axios.create({
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
    });

    await this.loadExpenses();
  },
  methods: {
    async openModal(expense) {
        this.modal = await modalController
        .create({
          component: Modal,
          cssClass: 'my-custom-class',
          componentProps: {
            title: expense.description,
            expenseProp: expense,
            categoriesProp: this.categories,
            close: () => this.closeModal()
          },
        })
      return this.modal.present();
    },

    closeModal() {
        this.modal.dismiss().then(() => {
        this.modal = null;
      });
    },

    formatDate(date){
      const day = new Date(date).getDate();
      let dateFormated = "dia " + day;
      const today = new Date().getDate();
      if(today == day){
        dateFormated = "Hoje";
      }
      if((today-1) == day){
        dateFormated = "Ontem";
      }
      return dateFormated;
    },

    async saveExpense() {
      if (this.validateForm()) {
        axios
          .post(process.env.VUE_APP_API_URL + "/expenses", this.expense)
          .then((response) => {
            if (response.status == 201) {
              this.showToast("success", "Salvo com sucesso!");
              this.clearForm();
              this.loadExpenses();
            }
          });
      }
    },

    updateExpense(object) {
      this.openModal(object);
    },

    validateForm() {
      if (this.expense.description == "") {
        this.showToast("danger", "Preencha a descrição.");
        return false;
      }

      if (this.expense.amount == "") {
        this.showToast("danger", "Informe o valor.");
        return false;
      }

      if (this.expense.payment == "") {
        this.showToast("danger", "Qual a forma de pagamento?");
        return false;
      }

      if (this.expense.role == "") {
        this.showToast("danger", "Qual a regra?");
        return false;
      }

      if (this.expense.month == "") {
        this.showToast("danger", "Informe o mês de referencia.");
        return false;
      }

      if (this.expense.categoryId == "" || this.expense.categoryId == "null") {
        this.showToast("danger", "Informe a categoria");
        return false;
      }

      return true;
    },

    clearForm() {
      this.expense.description = "";
      this.expense.amount = "";
      this.expense.role = "";
      this.expense.id = "";
      this.expense.month = String(new Date().getMonth() + 2);
    },

    async loadExpenses() {
      await axios
        .get(process.env.VUE_APP_API_URL + "/expenses", {
          params: { roleToGet: "getExpenses" },
        })
        .then((response) => {
          this.expenses = response.data;
        });

        await axios
        .get(process.env.VUE_APP_API_URL + "/categories")
        .then((response) => {
          this.categories = response.data;
        });
    },
  },
};
</script>

<style scoped>
ion-content {
  --ion-background-color: #e9eff0;
}

ion-item {
  /* font-size: 12px!important; */
  --ion-background-color: white;
}

ion-card {
  padding: 20px;
  --ion-background-color: white;
  border-radius: 9px;
  padding-bottom: 40px;
}

ion-label {
  font-family: "LabelInputsFont" !important;
}

.head-list {
  font-family: "HeadTableFont" !important;
}
</style>