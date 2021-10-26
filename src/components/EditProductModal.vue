<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{expense.description}}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-card>
          <!-- Descrição -->
          <ion-row>
            <ion-col>
              <ion-item>
                <ion-label position="floating" size="small"
                  >Descrição:</ion-label
                >
                <ion-input v-model="expense.description"></ion-input>
              </ion-item>
            </ion-col>
            <ion-col>
              <ion-item>
                <ion-label position="floating">Valor:</ion-label>
                <ion-input v-model="expense.amount"></ion-input>
              </ion-item>
            </ion-col>
          </ion-row>
          <!-- Descrição -->

          <!-- Formas de pagamento -->
          <ion-row>
            <ion-col>
              <ion-item>
                <ion-label position="floating">Forma de pagamento:</ion-label>
                <ion-select v-model="expense.payment" placeholder="Selecione">
                  <ion-select-option value="Dinheiro"
                    >Dinherio</ion-select-option
                  >
                  <ion-select-option value="Crédito">Crédito</ion-select-option>
                  <ion-select-option value="Refeição"
                    >Refeição</ion-select-option
                  >
                </ion-select>
              </ion-item>
            </ion-col>
            <ion-col>
              <ion-item>
                <ion-label position="floating">Regra:</ion-label>
                <ion-select v-model="expense.role" placeholder="Selecione">
                  <ion-select-option value="50">50</ion-select-option>
                  <ion-select-option value="30">30</ion-select-option>
                  <ion-select-option value="20">20</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-item>
                <ion-label position="floating">Mes:</ion-label>
                <ion-select v-model="expense.month" placeholder="Selecione">
                  <ion-select-option value="1">Janeiro</ion-select-option>
                  <ion-select-option value="2">Fevereiro</ion-select-option>
                  <ion-select-option value="3">Março</ion-select-option>
                  <ion-select-option value="4">Abril</ion-select-option>
                  <ion-select-option value="5">Maio</ion-select-option>
                  <ion-select-option value="6">Junho</ion-select-option>
                  <ion-select-option value="7">Julho</ion-select-option>
                  <ion-select-option value="8">Agosto</ion-select-option>
                  <ion-select-option value="9">Setembro</ion-select-option>
                  <ion-select-option value="10">Outubro</ion-select-option>
                  <ion-select-option value="11">Novembro</ion-select-option>
                  <ion-select-option value="12">Dezembro</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-col>
            <ion-col>
              <ion-item>
                <ion-label position="floating">Categoria:</ion-label>
                <ion-select v-model="expense.categoryId" placeholder="Selecione">
                  <ion-select-option v-for="c in categories" :key="c.id" :value="String(c.id)">{{c.description}}</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-col>
          </ion-row>
          <!-- Formas de pagamento -->

          <!-- Salvar -->
          <ion-row>
            <ion-col>
              <ion-button
                v-if="expense.id && expense.id != ''"
                shape="round"
                expand="block"
                @click="saveExpense"
                >Atualizar</ion-button
              >
              <ion-button
                v-else
                expand="block"
                shape="round"
                @click="saveExpense"
                >Salvar</ion-button
              >
            </ion-col>
            <ion-col>
              <ion-button
                expand="block"
                shape="round"
                color="danger"
                @click="clearForm"
                >Cancelar</ion-button
              >
            </ion-col>
          </ion-row>
          <!-- Salvar -->
        </ion-card>
  </ion-content>
</template>

<script>
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonSelect, IonCard} from '@ionic/vue';
import { defineComponent } from 'vue';
import axios from "axios";
import eventBus from '../eventBus'

export default defineComponent({
  name: 'Modal',
  props: ['expenseProp', 'categoriesProp', 'close'],
  data() {
    return {
      content: 'Content',
      expense: {
        id: "",
        description: "",
        payment: "",
        amount: "",
        role: "",
        categoryId:"",
        month: String(new Date().getMonth() + 2),
      },
      categories: this.categoriesProp
    }
  },
  components: { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonSelect},

  mounted(){
    this.alterProps();
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
  }
});
</script>