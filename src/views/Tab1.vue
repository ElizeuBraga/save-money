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
          >
          <ion-title class="ion-text-right" style="color:#2dd36f" v-if="(user.monthlyIncome - user.amountExpense) > 0">
            {{formatMoney(user.monthlyIncome - user.amountExpense)}}
          </ion-title>
          <ion-title class="ion-text-right" style="color:#eb445a" v-else>
            {{formatMoney(user.monthlyIncome - user.amountExpense)}}
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
        <ion-grid>
          <ion-card>
            <ion-progress-bar v-if="!loaded" type="indeterminate"></ion-progress-bar>
            <ion-card-title class="ion-text-center">
              Resumo
            </ion-card-title>
            <ion-card-content>
              <ion-row>
                <ion-progress-bar
                  :color="colorForBarExpenses()"
                  :value="((user.amountExpense * 100)/ user.monthlyIncome)/100"
                  class="ion-progress-bar-infopercentage"
                ></ion-progress-bar>

                <ion-col style="padding-bottom: 0;" class="ion-text-left">
                  <ion-label @click="alertUpdateMonthlyIncome()" class="label-italic">Salário:<b>{{formatMoney(user.monthlyIncome)}}</b></ion-label>
                </ion-col>
                <ion-col style="padding-bottom: 0;" class="ion-text-right">
                  <ion-label class="label-italic">Gasto:<b>{{formatMoney(user.amountExpense)}}</b></ion-label>
                </ion-col>
              </ion-row>

              <ion-item-divider style="margin-bottom: 20px"></ion-item-divider>

              <ion-row>
                <ion-progress-bar
                  :color="colorForBarEmergencyGoal()"
                  :value="((user.emergencyReserveReached * 100) / user.emergencyReserveGoal)/100"
                  class="ion-progress-bar-infopercentage"
                ></ion-progress-bar>

                <ion-col style="padding-bottom: 0;" class="ion-text-left">
                  <ion-label class="label-italic" @click="alertUpdateEmergencyReserveGoal()">Meta:<b>{{formatMoney(user.emergencyReserveGoal)}}</b></ion-label>
                </ion-col>
                <ion-col style="padding-bottom: 0;" class="ion-text-right">
                  <ion-label class="label-italic" @click="alertUpdateEmergencyReserveReached()">Conquista:<b>{{formatMoney(user.emergencyReserveReached)}}</b></ion-label>
                </ion-col>
                <ion-col class="label-italic ion-text-center" size="12" v-if="user.amountToConquist > 0">
                  {{formatMoney(user.amountToConquist)}} para conquistar o {{colorForBarEmergencyGoal() == 'danger' ? 'vermelho' : colorForBarEmergencyGoal() == 'yellow' ? 'Amarelo' : 'verde'}}
                </ion-col>
                <ion-col class="label-italic ion-text-center" size="12" v-else>
                  Parabéns pela conquista {{user.name}}!
                </ion-col>
              </ion-row>
            </ion-card-content>
          </ion-card>
        </ion-grid>

        <!--Resume card-->
        <ion-col size="12">
          <ion-grid>
            <ion-card>
              <ion-list-header>
                <ion-select @ionChange="loadExpenses($event, 'year')" :value="year" ok-text="Mostrar" cancel-text="Cancelar">
                    <ion-select-option v-for="y in years" :key="y" :value="y">{{y}}</ion-select-option>
                </ion-select>
                <ion-select @ionChange="loadExpenses($event, 'month')" :value="month" ok-text="Mostrar" cancel-text="Cancelar">
                    <ion-select-option v-for="m in months" :key="m.number" :value="m.number">{{m.description}}</ion-select-option>
                </ion-select>
              </ion-list-header>

              <ion-card-content align="center">
                <ion-list v-for="e in user.expenses" :key="e.id">
                  <ion-item @click="presentActionSheet(e)">
                    <ion-img style="height: 30px; margin-right: 5px" :src="e.img"></ion-img>
                    <ion-label class="ion-text-left">{{e.description}}</ion-label>
                    <ion-label class="ion-text-right">{{"R$ " + parseFloat(e.price).toFixed(2).replace(".", ",")}}<br><p class="label-italic">{{formatDate(e.createdAt)}}</p></ion-label>
                  </ion-item>
                </ion-list>

                <ion-list v-if="user.expenses.length == 0">
                  <ion-item>
                    <ion-label class="ion-text-center label-italic" color="danger">Nenhum item encontrado</ion-label>
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
          </ion-grid>
        </ion-col>
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script>

import { alertController, IonList, IonListHeader, IonSelect, IonSelectOption, actionSheetController} from "@ionic/vue";
import eventBus from '../eventBus'
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, onSnapshot, addDoc, collection, setDoc, deleteDoc, Timestamp} from "firebase/firestore";

const milliseconds = Timestamp.now().toMillis();
const month = String(new Date(milliseconds).getMonth()+2)

export default {
  name: "Tab1",
  components:{ IonList, IonListHeader, IonSelect, IonSelectOption},
  data: () => {
    return {
      monthSelected: month,
      months: [
        {description: 'Janeiro', number: '1'}, 
        {description: 'Fevereiro', number: '2'}, 
        {description: 'Março', number: '3'}, 
        {description: 'Abril', number: '4'}, 
        {description: 'Maio', number: '5'}, 
        {description: 'Junho', number: '6'}, 
        {description: 'Julho', number: '7'}, 
        {description: 'Agosto', number: '8'}, 
        {description: 'Setembro', number: '9'}, 
        {description: 'Outubro', number: '10'}, 
        {description: 'Novembro', number: '11'}, 
        {description: 'Dezembro', number: '12'}
      ],

      years: ["2021", "2022"],

      loaded: false,

      user:{
        emergencyReserveGoal: 0,
        emergencyReserveReached: 0,
        monthlyIncome: 0,
        amountExpense: 0,
        expenses:[],
        amountToConquist: 0,
        years: []
      },

      milliseconds: Timestamp.now().toMillis(),
      year: String(new Date(Timestamp.now().toMillis()).getFullYear()),
      month: String(new Date(Timestamp.now().toMillis()).getMonth()+2),
      
      userRef: null,
      yearRef: null,
      monthRef: null,
      expensesRef: null
    }
  },

  async mounted() {
    this.mountReferences()

    setTimeout(() => {
      this.loadExpenses()
    }, 200);
    eventBus().emitter.on("tabChanged", () => {
        this.loaded = false
        setTimeout(async()=>{
          this.loadExpenses()
        }, 3000)
    });

    eventBus().emitter.on("openModalNewExpense", () => {
      this.alertNewExpense()
    });
  },
  methods: {
    async mountReferences(){
      this.userRef = doc(getFirestore(), "users", getAuth().currentUser.uid)
      this.yearRef = collection(this.userRef, this.year)
      this.monthRef = doc(this.userRef, this.year, this.month)
      this.expensesRef = collection(this.monthRef, 'expenses')
    },

    colorForBarExpenses(){
      const result = ((this.user.amountExpense * 100) / this.user.monthlyIncome) 
      if(result < 33){
        return 'success'
      }else if(result > 66){
        return 'danger' 
      }else{
        return 'warning'
      }
    },

    colorForBarEmergencyGoal(){
      const result = ((this.user.emergencyReserveReached * 100) / this.user.emergencyReserveGoal)
      const amountForColor = this.user.emergencyReserveGoal / 3;

      if(result < 33.333){
        const amountToConquistRed = amountForColor - this.user.emergencyReserveReached
        this.user.amountToConquist = amountToConquistRed
        return 'danger'
      }else if(result > 66.666){
        const amountToConquistRed = (amountForColor * 3) - this.user.emergencyReserveReached
        this.user.amountToConquist = amountToConquistRed
        return 'success' 
      }else{
        const amountToConquistRed = (amountForColor * 2) - this.user.emergencyReserveReached
        this.user.amountToConquist = amountToConquistRed
        return 'warning'
      }
    },

    sumExpenses(){
      this.user.amountExpense = 0
      this.user.expenses.forEach((e)=>{
        this.user.amountExpense += e.price
      })
    },

    async loadExpenses(event, type = false){
      onSnapshot(this.userRef, (userSnapshot) => {
        this.user.emergencyReserveGoal = userSnapshot.data().emergencyReserveGoal
        this.user.emergencyReserveReached = userSnapshot.data().emergencyReserveReached
        this.user.years = userSnapshot.data().years
      })

      if(type === 'year'){
        this.year = (event) ? event.detail.value : this.year
      }else if(type === 'month'){
        this.month = (event) ? event.detail.value : this.month
      }

      this.mountReferences()

      onSnapshot(this.monthRef, (monthSnapshot) => {
        this.user.monthlyIncome = 0
        if(monthSnapshot.data()){
          this.user.monthlyIncome = monthSnapshot.data().monthlyIncome
        }
      })

      onSnapshot(this.expensesRef, (expSnapshot) => {
        this.user.expenses = []
        expSnapshot.docs.forEach((doc)=>{
          const e = doc.data()
          e.id = doc.id
          this.user.expenses.push(e)
        })

        this.sumExpenses()
      })
      this.loaded = true
    },

    async alertUpdateMonthlyIncome() {
        const alert = await alertController
        .create({
          header: 'Alterar renda mensal',
          inputs: [
            {
              name: 'price',
              id: 'price',
              value: this.user.monthlyIncome,
              placeholder: 'Digite o novo valor',
              type: 'number'
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler:(values)=>{
                this.updateMonthlyIncome(values.price)
              }
            },
            {
              text: 'Cancelar'
            }
          ],
        })
      
      await alert.present()
    },

    updateMonthlyIncome(price){
      setDoc(this.monthRef, {
        monthlyIncome : parseFloat(price),
        number: parseInt(this.monthSelected)
      })

      this.showToast('success', 'Salário mensal atualizado!')
    },

    async alertUpdateEmergencyReserveGoal() {
        const alert = await alertController
        .create({
          header: 'Alterar meta',
          inputs: [
            {
              name: 'price',
              id: 'price',
              value: this.user.emergencyReserveGoal,
              placeholder: 'Digite o novo valor',
              type: 'number'
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler:(values)=>{
                this.updateEmergencyReserveGoal(values.price)
              }
            },
            {
              text: 'Cancelar'
            }
          ],
        })
      
      await alert.present()
    },

    updateEmergencyReserveGoal(price){
      updateDoc(this.userRef, {
        emergencyReserveGoal : parseFloat(price)
      })

      this.showToast('success', 'Meta alterada!')
    },

    async alertUpdateEmergencyReserveReached() {
        const alert = await alertController
        .create({
          header: 'Alterar conquista',
          inputs: [
            {
              name: 'price',
              id: 'price',
              value: this.user.emergencyReserveReached,
              placeholder: 'Digite o novo valor',
              type: 'number'
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler: (values) => {
                this.updateEmergencyReserveReached(values.price);
              },
            },
            {
              text: 'Cancelar'
            },
          ],
        })
      
      await alert.present();
    },

    async updateEmergencyReserveReached(price){
      await updateDoc(this.userRef, {
        emergencyReserveReached : parseFloat(price)
      })

      this.showToast('success', 'Conquista alterada com sucesso!')
    },

    async alertNewExpense(){
      const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: 'Novo item',
          inputs: [
            {
              name: 'description',
              id: 'description',
              value: '',
              placeholder: 'Digite uma descrição',
            },
            {
              name: 'price',
              id: 'price',
              value: '',
              placeholder: 'Digite o valor',
              type: 'number'
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler: (values) => {
                this.saveNewExpense(values);
              },
            },
            {
              text: 'Cancelar'
            }
          ],
        });
      return alert.present();
    },

    async saveNewExpense(expense){
      let img = '../img/imgs/'+expense.description.toLowerCase()+'.png'
  
      if(!await this.imageExists(img)){
        img = '../img/imgs/default.png'
      }

      addDoc(this.expensesRef, {description: expense.description, price: parseFloat(expense.price), img: img, createdAt: this.milliseconds})
      this.showToast('success', 'Novo item adicionado!')
    },

    async alertUpdateExpense(expense){
      const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: 'Editar item',
          inputs: [
            {
              name: 'id',
              id: 'id',
              value: expense.id,
              type: 'hidden'
            },
            {
              name: 'description',
              id: 'description',
              value: expense.description,
              placeholder: 'Digite uma descrição',
            },
            {
              name: 'price',
              id: 'price',
              value: expense.price,
              placeholder: 'Digite o valor',
              type: 'number'
            },
          ],
          buttons: [
            {
              text: 'Salvar',
              handler: (values) => {
                this.updateExpense(values);
              },
            },
            {
              text: 'Cancelar'
            }
          ],
        });
      return alert.present();
    },

    async updateExpense(expense){
      let img = '../img/imgs/'+expense.description.toLowerCase()+'.png'

      if(!await this.imageExists(img)){
        img = '../img/imgs/default.png'
      }
  
      updateDoc(doc(this.expensesRef, expense.id), {description: expense.description, price: parseFloat(expense.price), img: img, createdAt: this.milliseconds})

      this.showToast('success', 'Item editado com sucesso!')
    },

    async imageExists(imgUrl) {
      if (!imgUrl) {
          return false;
      }
      return new Promise(res => {
          const image = new Image();
          image.onload = () => res(true);
          image.onerror = () => res(false);
          image.src = imgUrl;
      });
    },

    deleteExpense(expense){
      deleteDoc(doc(this.expensesRef, expense.id));
      this.showToast('success', 'Item excluído!')
    },

    async presentActionSheet(expense) {
      const actionSheet = await actionSheetController
        .create({
          header: 'Opções',
          cssClass: 'my-custom-class',
          buttons: [
            {
              text: 'Editar',
              handler: () => {
                this.alertUpdateExpense(expense)
              },
            },
            {
              text: 'Excluir',
              handler: () => {
                this.deleteExpense(expense)
              },
            }
          ],
        });
      await actionSheet.present();
    },
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

@media screen and (min-width: 800px) {
  ion-card {
    width: 40%;
  }

  ion-grid{
    display: flex; 
    align-items: center; 
    justify-content: center;
  }
}

.ion-color-primary{
  --ion-color-base: white!important
}

ion-title{
  color: #3880ff;
}

ion-content {
  --ion-background-color: #3880ff;
}

/* alerts */
.btn-cancel-alert{
  color: red!important;
}

.btn-save-alert{
  color: green!important;
}
</style>