<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-buttons slot="start">
        <ion-back-button default-href="tabs/tab1" @click="close()"></ion-back-button>
      </ion-buttons>
      <ion-title>Produtos em {{title}}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <!-- List of Text Items -->
        <ion-row>
          <ion-col>
            <ion-card>
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
                    <ion-label class="ion-text-right">{{formatMoney(e.amount)}}<br><p class="label-italic">{{formatDate(e.created_at)}}</p></ion-label>
                  </ion-item>
                </ion-list>
              </ion-card-content>
              <!-- List of Text Items -->
            </ion-card>
          </ion-col>
        </ion-row>
      <!-- </ion-grid> -->
  </ion-content>
</template>

<script>
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonLabel, IonRow, IonCol, IonItem, IonList} from '@ionic/vue';
import { defineComponent } from 'vue';
import axios from "axios";
import eventBus from '../eventBus'

export default defineComponent({
  name: 'Modal',
  props: ['titleProp', 'sectionProp', 'dataProp', 'close'],
  data() {
    return {
      content: 'Content',
      expenses:[],
      title: this.titleProp,
      section: this.sectionProp,
      data: this.dataProp
    }
  },
  components: { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonLabel, IonRow, IonCol, IonItem, IonList  },

  async mounted(){
    // this.alterProps();
    await this.loadExpenses();
  },
  
  methods:{
    alterProps(){
      this.expense.id = this.expenseProp.id;
      this.expense.description = this.expenseProp.description;
      this.expense.payment = this.expenseProp.payment;
      this.expense.amount = this.expenseProp.amount;
      this.expense.role = String(this.expenseProp.role);
      this.expense.categoryId = String(this.expenseProp.categoryId);
    },

    updateExpense() {
      // this.openModal(object);

      console.log('Teste')
    },

    async saveExpense() {
      if (this.validateForm()) {
        axios
          .post(process.env.VUE_APP_API_URL + "/expenses", this.expense)
          .then((response) => {
            if (response.status == 201) {
              this.showToast("success", "Salvo com sucesso!");
              this.clearForm();
              this.close();
            }
          });
      }
    },

    clearForm() {
      this.expense.description = "";
      this.expense.amount = "";
      this.expense.role = "";
      this.expense.id = "";
      this.expense.month = String(new Date().getMonth() + 2);

      eventBus().emitter.emit("modalClosed");
      this.close();
    },

    async loadExpenses() {
      await axios
        .get(process.env.VUE_APP_API_URL + "/expenses", {
          params: { roleToGet: 'expensesWhere', where: {section: this.section, data: this.data}},
        })
        .then((response) => {
          // console.log(response.data)
          this.expenses = response.data;
        });
    },
  }
});
</script>