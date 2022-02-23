<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="dark">
        <tollbar-component :total="inWallet" :title="(getMonthName(monthToShow))"/>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->

    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-title class="ion-text-center">
          Por pagamento
        </ion-card-title>
        <ion-card-content>
          <ion-row  v-for="item in groupByPayment" :key="item" @click="showInfo(item)">
            <ion-col>
              <ion-label>{{item.payment}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-title class="ion-text-center">
          Por categoria
        </ion-card-title>
        <ion-card-content>
          <ion-row  v-for="item in groupByCategory" :key="item" @click="showInfo(item)">
            <ion-col>
              <ion-label>{{item.category ? item.category: '-'}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script>

import {getMonths, getActualMonthInt, getNextMonthIndex, userRef, formatInputReal, formatInputRealV3, dates} from '../Helper'
import {updateDoc, Timestamp, arrayUnion } from "firebase/firestore";
import { dataInMonthGroupByPayment, dataInMonthGroupByCategory, getDataByPayment, getDataByCategory} from '../models/expense'
import { alertController} from "@ionic/vue";
import TollbarComponent from '../components/TollbarComponent.vue'
import Swal from 'sweetalert2'

export default {
  components:{TollbarComponent},
  data: () => {
    return {
      groupByCategory: [],
      groupByPayment: [],
      monthYear: dates(null, 'yyyy-mm', 1),
      monthToShow: getActualMonthInt(),
      slideOpts:{
        initialSlide: getNextMonthIndex(),
        speed: 400
      },
      name: '',
      months: getMonths(),
      loaded: false,
      emergencyReserveGoal: 0,
      emergencyReserveReached: 0,
      expenses: [],
      toReceives:[],

      milliseconds: Timestamp.now().toMillis(),
      
      userRef: null,
      monthRef: null,
      expensesRef: null,

      allData: null,
      count: 0
    }
  },

  async mounted() {
    this.loadAllData()
  },
  methods: {
    async showInfo(item){
      let array = []
      if(item.payment){
        array = await getDataByPayment(this.monthYear, item.payment)
      }else{
        array = await getDataByCategory(this.monthYear, item.category)
      }
      let html = `
        <table id="tableExpenses" class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Descrção</th>
              <th scope="col">Venc.</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>`

          array.forEach(element => {
            html +=`
              <tr>
                <td style="display: none">${element._id}</td>
                <td>${element.description}</td>
                <td>${dates(element.expiration, 'dd/mm')}</td>
                <td>${this.formatMoney(element.price)}</td>
              </tr>
            `
          });

          html+=`</tbody>
        </table>
      `;
      Swal.fire({
        html: html,
        showCloseButton: true,
        showConfirmButton: false,
        didOpen:()=>{
          this.addRowHandlers()
        }
      })
    },

    getMonthName(month){
      const monthIndex = parseInt(month) - 1
      return getMonths(monthIndex)
    },

    async loadAllData(){
      this.groupByPayment = await dataInMonthGroupByPayment(this.yearMonth)
      this.groupByCategory = await dataInMonthGroupByCategory(this.yearMonth)
    },

    colorForBarEmergencyGoal(){
      if(this.emergencyReserveReached === 0 && this.emergencyReserveGoal === 0){
        return 'danger'
      }else if(this.emergencyReserveGoal === 0 && this.emergencyReserveReached > 0){
        return 'success'
      }else if(this.emergencyReserveReached === 0 && this.emergencyReserveGoal > 0){
        return 'danger'
      }else{
        const result = ((this.emergencyReserveReached * 100) / this.emergencyReserveGoal)
        if(result > 66.6){
          return 'success'
        }else if(result < 33.33){
          return 'danger' 
        }else{
          return 'warning'
        }
      }
    },

    async alertToReceiveFromThirdParties(){
      const alert = await alertController
        .create({
          header: 'Alterar renda mensal',
          inputs: [
            {
              name: 'name',
              id: 'name',
              value: '',
              placeholder: 'Nome do devedor',
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
              handler:(values)=>{
                this.newToReceiveFromThirdParties(values)
              }
            },
            {
              text: 'Cancelar'
            }
          ],
        })
      
      await alert.present()
    },

    newToReceiveFromThirdParties(values){
      updateDoc(this.monthRef, {
        toReceiveFromThirdParties : arrayUnion({name: values.name, price: parseFloat(values.price)})
      })

      this.showToast('success', this.formatMoney(parseFloat(values.price)) + ' para ' + values.name + ' inserido')
    },

    async alertUpdateEmergencyReserveGoal() {
        const alert = await alertController
        .create({
          header: 'Alterar meta',
          message: this.emergencyReserveGoal === 0 ? 'Informe uma meta para reserva de emergência' : 'Altere suma meta',
          inputs: [
            {
              name: 'price',
              id: 'price',
              value: formatInputRealV3(this.emergencyReserveGoal),
              placeholder: 'Digite o novo valor',
              type: 'number',
              step:".01"
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler:(values)=>{
                console.log(values.price)
                this.updateEmergencyReserveGoal(formatInputReal(values.price))
              }
            },
            {
              text: 'Cancelar'
            }
          ],
        })

      await alert.present()
      const price = document.getElementById('price')
      price.focus()
      price.addEventListener("keyup", function() {
        console.log(price.value)
        price.value = formatInputReal(price.value)
      });
    },

    updateEmergencyReserveGoal(price){
      updateDoc(userRef(), {
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
              value: formatInputRealV3(this.emergencyReserveReached),
              placeholder: 'Digite o novo valor',
              type: 'number'
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler: (values) => {
                this.updateEmergencyReserveReached(formatInputReal(values.price));
              },
            },
            {
              text: 'Cancelar'
            },
          ],
        })
      
      await alert.present();

      const price = document.getElementById('price')
      price.focus()
      price.addEventListener("keyup", function() {
        console.log(price.value)
        price.value = formatInputReal(price.value)
      });
    },

    async updateEmergencyReserveReached(price){
      await updateDoc(userRef(), {
        emergencyReserveReached : parseFloat(price)
      })

      this.showToast('success', 'Conquista alterada com sucesso!')
    },
  },

  computed:{
    emergencyGoalMissing(){
      return this.emergencyReserveGoal > this.emergencyReserveReached ? this.emergencyReserveGoal - this.emergencyReserveReached : 0
    },

    returnTotalFromThirdParties(){
      let total = 0
      this.toReceiveFromThirdParties.forEach(element => {
        total += element.price
      });

      return total;
    },

    amountExpense(){
      let total = 0
      this.expenses.forEach((e)=>{
        total += e.price
      })

      return total;
    },

    totalToreceive(){
      let total = 0
      this.toReceives.forEach((e)=>{
        total += e.price
      })

      return total;
    },

    inWallet(){
      return this.totalToreceive - this.amountExpense;
    },

    calcBarEmergencyGoal(){
      if(this.emergencyReserveReached === 0 && this.emergencyReserveGoal === 0){
        return 0
      }

      const result = ((this.emergencyReserveReached * 100) / this.emergencyReserveGoal)/100
      return result
    },

    allStratched(){
      if(this.expenses.findIndex(x => (!x.scratch)) > -1){
        return false
      }else{
        return true
      }
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

/* alerts */
.btn-cancel-alert{
  color: red!important;
}

.btn-save-alert{
  color: green!important;
}

.wallet{
  background: white;
  border-radius: 15px;
  padding: 3px 6px 3px 6px;
  font-size: 20px!important;
  font-weight: bold;
}

ion-item-divider{
  margin-top: 0px;
  min-height: 1px!important;
}

ion-content {
  --ion-background-color: #252525;
}
</style>