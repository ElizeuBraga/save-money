<template>
  <ion-page id="ionPage">
    
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-row>
          <ion-col>
            <ion-title>Home</ion-title>
          </ion-col>
          <ion-col
            size="6"
            style="background: #e2f9fa; border-radius: 15px; margin-right: 15px"
          >
          <ion-title class="ion-text-right" color="success">
            {{
              formatMoney(
                user.monthlyIncome - user.amountExpense
              )
            }}
          </ion-title>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->


    <ion-content :fullscreen="true">
      
      
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Home</ion-title>
        </ion-toolbar>
      </ion-header>


      <ion-row>
        <!--Resume card-->
        <ion-col size="12">
          <ion-card>
            <ion-progress-bar v-if="!loaded" type="indeterminate"></ion-progress-bar>
            <ion-card-title color="primary" class="ion-text-center">
              Resumo
            </ion-card-title>
            <ion-card-content>
              <ion-row>
                <!--<ion-col class="ion-text-left">
                  <ion-label class="label-italic">
                      <b>{{getInformation('qtdDays', 0)}} dias</b> para fecharmos o mês.
                  </ion-label><br>
                </ion-col>-->
                <ion-progress-bar
                  :color="((user.amountExpense * 100)/ user.monthlyIncome)/100 > 0.5 ? 'danger' : 'success'"
                  :value="((user.amountExpense * 100)/ user.monthlyIncome)/100"
                  class="ion-progress-bar-infopercentage"
                ></ion-progress-bar>

                <ion-col style="padding-bottom: 0;" class="ion-text-left">
                  <ion-label @click="openModalUpdateMonthlyIncome()" class="label-italic">Salário:<b>{{formatMoney(user.monthlyIncome)}}</b></ion-label>
                </ion-col>
                <ion-col style="padding-bottom: 0;" class="ion-text-right">
                  <ion-label class="label-italic">Gasto:<b>{{formatMoney(user.amountExpense)}}</b></ion-label>
                </ion-col>
              </ion-row>

              <ion-item-divider style="margin-bottom: 20px"></ion-item-divider>

              <ion-row>
                <ion-progress-bar
                  :color="(user.emergencyReserveReached * 100) / user.emergencyReserveGoal > 0.5 ? 'success' : 'danger'"
                  :value="((user.emergencyReserveReached * 100) / user.emergencyReserveGoal)/100"
                  class="ion-progress-bar-infopercentage"
                ></ion-progress-bar>

                <ion-col style="padding-bottom: 0;" class="ion-text-left">
                  <ion-label class="label-italic" @click="openModalUpdateEmergencyReserveGoal()">Meta:<b>{{formatMoney(user.emergencyReserveGoal)}}</b></ion-label>
                </ion-col>
                <ion-col style="padding-bottom: 0;" class="ion-text-right">
                  <ion-label class="label-italic" @click="openModalUpdateEmergencyReserveReached()">Conquista:<b>{{formatMoney(user.emergencyReserveReached)}}</b></ion-label>
                </ion-col>
              </ion-row>
            </ion-card-content>

            <ion-row>
              <ion-col size="12" v-if="!formVisible">
                <ion-button expand="block" shape="round" @click="showForm()">Inserir novo gasto</ion-button>
              </ion-col>
            </ion-row>

            <!-- Form-->
            <ion-card id="form" v-if="formVisible">
              <ion-row>
                <ion-col size="1"></ion-col>
                <ion-col size="10">
                  <ion-item>
                    <ion-label position="floating">Descrição</ion-label>
                    <ion-input v-model="user.expense.name"></ion-input>
                  </ion-item>
                </ion-col>
                <ion-col size="1"></ion-col>
                <ion-col size="1"></ion-col>
                <ion-col size="10">
                  <ion-item>
                    <ion-label position="floating">Valor</ion-label>
                    <ion-input v-model="user.expense.price"></ion-input>
                  </ion-item>
                </ion-col>
                <ion-col size="1"></ion-col>
                <ion-col size="1"></ion-col>
                <ion-col size="10">
                  <ion-item>
                    <ion-label>Repetir mensalmete</ion-label>
                    <ion-toggle v-model="user.expense.repeat" color="secondary"></ion-toggle><br>
                  </ion-item>
                </ion-col>
                <ion-col size="1"></ion-col>
                <ion-row v-if="!validaForm && !isUpdating">
                  <ion-col>
                    <ion-button expand="block" shape="round" @click="saveExpense()">Salvar</ion-button>
                  </ion-col>
                  <ion-col>
                    <ion-button expand="block" shape="round" @click="showForm()" color="danger">Cancelar</ion-button>
                  </ion-col>
                </ion-row>
                <ion-row v-if="!validaForm && isUpdating">
                  <ion-col>
                    <ion-button v-if="!validaForm && isUpdating" shape="round" class="label-italic" @click="updateExpense()">Atualizar</ion-button>
                  </ion-col>
                  <ion-col>
                    <ion-button shape="round" @click="removeExpense(expense)" class="label-italic" color="danger">Remover</ion-button>
                  </ion-col>
                </ion-row>
              </ion-row>
            </ion-card>
            <!-- Form-->
          </ion-card>
        </ion-col>
        <!--Resume card-->

        <ion-col>
            <ion-card>
              <ion-card-title color="primary" class="ion-text-center">Inseridos recentes</ion-card-title>
              <ion-button @click="openModalNewExpense()">Novo gasto</ion-button>
              <ion-card-content align="center">
                <ion-item>
                  <ion-label class="head-list ion-text-left"
                    >Descrição</ion-label
                  >
                  <ion-label class="head-list ion-text-right">Valor</ion-label>
                </ion-item>
                <ion-list v-for="e in user.expenses" :key="e.id">
                  <ion-item @click="editExpense(e)">
                    <ion-label class="ion-text-left">{{e.description}}</ion-label>
                    <ion-label class="ion-text-right">{{"R$ " + parseFloat(e.price).toFixed(2).replace(".", ",")}}<br><p class="label-italic">{{formatDate(e.createdAt)}}</p></ion-label>
                  </ion-item>
                </ion-list>
                <ion-row>
                  <ion-col class="ion-text-left">
                    <b><ion-label>Total</ion-label></b>
                  </ion-col>
                  <ion-col class="ion-text-right">
                    <b><ion-label>{{formatMoney(user.amountExpense)}}</ion-label></b>
                  </ion-col>
                </ion-row>
              </ion-card-content>
              <!-- List of Text Items -->
            </ion-card>
          </ion-col>
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script>
import { alertController, IonList } from "@ionic/vue";
import eventBus from '../eventBus'
import { getDatabase, ref, set} from "firebase/database";
import { getFirestore, doc, updateDoc, onSnapshot, arrayUnion, arrayRemove} from "firebase/firestore";

// import WonderPush from '@ionic-native/wonderpush';

const db = getFirestore();

export default {
  name: "Tab1",
  components:{ IonList },
  data: () => {
    return {
      // WonderPush: WonderPush,
      formVisible: false,
      expense:{
        name: '',
        price: '',
        repeat: true
      },

      loaded: false,


      // Resume card
      expenses: [],
      monthlyIncome: 0,
      amountExpense: 0,
      emergencyReserveGoal: 0,
      emergencyReserveReached: 0,

      isUpdating: false,


      productsInformationsModal:'',

      user:{
        emergencyReserveGoal: 0,
        emergencyReserveReached: 0,
        monthlyIncome: 0,
        amountExpense: 0,
        expenses:[]
      }
    };
  },

  async mounted() {
    await this.loadExpenses()

    eventBus().emitter.on("tabChanged", () => {
        this.loaded = false
        setTimeout(async()=>{
          await this.loadExpenses()
        }, 3000)
    });
  },
  methods: {
    sumExpenses(){
      this.user.amountExpense = 0
      this.user.expenses.forEach((e)=>{
        this.user.amountExpense += e.price
      })
    },

    showForm(){
      if(this.formVisible){
        this.isUpdating = false
        this.expense = {
          name: '',
          price: '',
          repeat: false
        }
      }
      this.formVisible = !this.formVisible
    },

    async loadExpenses(){
      const uid = await this.getUid()
      await onSnapshot(doc(db, "users", uid), (doc) => {
        const data = doc.data()
        this.user = data

        this.sumExpenses()
        setTimeout(()=>{
          this.loaded = true
          if(this.user.emergencyReserveGoal === 0){
            this.openModalUpdateEmergencyReserveGoal()
          }

          if(this.user.monthlyIncome === 0){
            this.openModalUpdateMonthlyIncome()
          }
        }, 300)
      });
    },

    editExpense(e){
      this.expense = e
      this.openModalNewExpense(true)
    },

    removeExpense(expense){
      const userId = '1634579233901' 
      const db = getDatabase();
      const id = expense.id
      set(ref(db,`users/${userId}/expenses/${id}`), null);
      this.showForm()
    },

    updateExpense(){
      const userId = '1634579233901' 
      const db = getDatabase();
      const id = this.expense.id

      this.expense.updatedAt = Date.now()
      set(ref(db,`users/${userId}/expenses/${id}`), this.expense);
      this.showForm()
    },

    async updateEmergencyReserveReached(emergencyReserveReached){
      const uid = await this.getUid()
      const userRef = doc(db, "users", uid);

      await updateDoc(userRef, {
        emergencyReserveReached : emergencyReserveReached
      });
    },

    saveExpense(){
      const userId = '1634579233901' 
      const db = getDatabase();
      const id = Date.now()

      this.expense.id = id
      this.expense.createdAt = Date.now()
      this.expense.updatedAt = Date.now()
      set(ref(db,`users/${userId}/expenses/${id}`), this.expense);
      this.showForm()
      this.expense = {
        name: '',
        price: '',
        repeat: false
      }
    },

    async openModalUpdateMonthlyIncome() {
        const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: 'Alterar renda mensal',
          inputs: [
            {
              name: 'monthlyincome',
              id: 'monthlyincome',
              value: this.user.monthlyIncome,
              placeholder: 'Digite o novo valor',
            }
          ],
          buttons: ['OK'],
        })
      
      await alert.present();

      const { data } = await alert.onDidDismiss();

      const uid = await this.getUid()
      const userRef = doc(db, "users", uid);

      await updateDoc(userRef, {
        monthlyIncome : parseFloat(data.values.monthlyincome)
      })
    },

    async openModalNewExpense(update = false) {
      console.log(this.user)
        const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: 'Novo gasto',
          inputs: [
            {
              name: 'description',
              id: 'description',
              type: 'text',
              value: this.expense.description,
              placeholder: 'Descrição do gasto',
            },
            {
              name: 'price',
              id: 'price',
              type: 'text',
              value: this.expense.price,
              placeholder: 'Valor do gasto',
            }
          ],
          buttons: ['OK'],
        })
      
      await alert.present();

      const { data } = await alert.onDidDismiss();

      console.log(data.values)
      const uid = await this.getUid()
      const userRef = doc(db, "users", uid);

      if(update){
        await updateDoc(userRef, {
          expenses : arrayRemove(this.expense)
        })
      }
      
      await updateDoc(userRef, {
        expenses : arrayUnion({
          description: data.values.description, price: parseFloat(data.values.price)
        })
      })
    },

    async openModalUpdateEmergencyReserveGoal() {
        const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: 'Alterar meta',
          inputs: [
            {
              name: 'emergencyReserveGoal',
              id: 'emergencyReserveGoal',
              value: this.user.emergencyReserveGoal,
              placeholder: 'Digite o novo valor',
            }
          ],
          buttons: ['OK'],
        })
      
      await alert.present();

      const { data } = await alert.onDidDismiss();

      const uid = await this.getUid()
      const userRef = doc(db, "users", uid);

      await updateDoc(userRef, {
        emergencyReserveGoal : parseFloat(data.values.emergencyReserveGoal)
      })
    },

    async openModalUpdateEmergencyReserveReached() {
        const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: 'Alterar conquista',
          inputs: [
            {
              name: 'emergencyReserveReached',
              id: 'emergencyReserveReached',
              value: this.user.emergencyReserveReached,
              placeholder: 'Digite o novo valor',
            }
          ],
          buttons: ['OK'],
        })
      
      await alert.present();

      const { data } = await alert.onDidDismiss();

      const uid = await this.getUid()
      const userRef = doc(db, "users", uid);

      await updateDoc(userRef, {
        emergencyReserveReached : parseFloat(data.values.emergencyReserveReached)
      })
    },

    closeModal() {
        this.productsInformationsModal.dismiss().then(() => {
        this.productsInformationsModal = null;
      });
    },
    getInformation(type, amount){
        const date = new Date();
        const today = date.getDate();
        const daysInMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        const qtdDays = daysInMonth - today;
      if(type == 'qtdDays'){
        return parseInt(qtdDays);
      }

      if(type == 'qtdSpandInDay'){
        return (amount / parseInt(qtdDays)).toFixed(2);
      }
    },

    calcPercentage(value) {
      if(value && value > 0){
        return ((value * 100) / this.monthlyIncome);
      }
      return (0).toFixed(2);
    },

    async shhowAlertsInformation(message) {
      const alert = await alertController.create({
        cssClass: "my-custom-class",
        header: "Atenção!",
        message: message,
        buttons: ["OK"],
      });
      await alert.present();

      const { role } = await alert.onDidDismiss();
      console.log("onDidDismiss resolved with role", role);
    }
  },

  computed:{
    validaForm(){
      return this.expense.name === '' || this.expense.price === ''
    }
  }
};
</script>
<style scoped>
.ion-progress-bar-infopercentage {
  height: 30px !important;
  /* margin: 5px !important; */
  border-radius: 15px !important;
}

ion-col{
  --padding-bottom: 0px
}

.progress-buffer-bar {
  margin: 5px !important;
}

ion-card {
  padding: 20px;
  --ion-background-color: white;
  border-radius: 9px;
  padding-bottom: 40px;
}

.head-list {
  font-family: "HeadTableFont" !important;
}

ion-content {
  --ion-background-color: #e9eff0;
}
</style>