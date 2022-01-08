<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="primary">
        <tollbar-component :total="inWallet" :title="(getMonthName(monthToShow))"/>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->


    <ion-content :fullscreen="true">
      <ion-spinner color="primary" style="margin-top: 50%; margin-left: 50%" v-if="!loaded" name="crescent"></ion-spinner>
      <ion-row v-else>
      <!--Resume card-->
        <ion-grid>
          <ion-card>
            <ion-card-title class="ion-text-center">
              Gastos este mês
            </ion-card-title>
            <ion-card-content>
              <ion-row style="margin-bottom: 12px">
                <ion-progress-bar
                  :color="colorForBarExpenses()"
                  :value="((amountExpense * 100)/totalToreceive)/100"
                  class="ion-progress-bar-infopercentage"
                ></ion-progress-bar>

                <ion-col class="ion-no-padding ion-text-left" @click="alertNewToReceive()">
                  <ion-label class="label-italic">
                      Proventos:<b>{{formatMoney(totalToreceive)}}</b>
                  </ion-label>
                </ion-col>
                <ion-col class="ion-no-padding ion-text-right">
                  <ion-label class="label-italic">Gastos:<b>{{formatMoney(amountExpense)}}</b></ion-label>
                </ion-col>
                  <ion-col size="12" class="ion-text-center" v-if="inWallet > 0">
                    <span style="font-size: 30px">&#128512;</span><br>
                    <ion-label color="success" class="label-italic">Podemos gastar: <b>{{formatMoney(inWallet)}}</b></ion-label>
                  </ion-col>
                  <ion-col size="12" class="ion-text-center" v-else>
                    <span style="font-size: 30px">&#128542;</span><br>
                    <ion-label color="danger" class="label-italic">Estamos devendo: <b>{{formatMoney(inWallet)}}</b></ion-label>
                  </ion-col>
              </ion-row>
            </ion-card-content>
          </ion-card>


          <ion-card>
            <ion-card-title class="ion-text-center">
              Reserva de emergência
            </ion-card-title>
            <ion-card-content>
              <ion-row>
                <ion-progress-bar
                  :color="colorForBarEmergencyGoal()"
                  :value="calcBarEmergencyGoal"
                  class="ion-progress-bar-infopercentage"
                ></ion-progress-bar>

                <ion-col class="ion-no-padding ion-text-left">
                  <ion-label class="label-italic" @click="alertUpdateEmergencyReserveGoal()">Meta:<b>{{formatMoney(emergencyReserveGoal)}}</b></ion-label><br>
                </ion-col>
                <ion-col class="ion-no-padding ion-text-right">
                  <ion-label class="label-italic" @click="alertUpdateEmergencyReserveReached()">Conquista:<b>{{formatMoney(emergencyReserveReached)}}</b></ion-label><br>
                </ion-col>
                <ion-col size="12" class="ion-text-center">
                  <ion-label class="label-italic" @click="alertUpdateEmergencyReserveReached()">Faltam:<b>{{formatMoney(emergencyGoalMissing)}}</b></ion-label>
                </ion-col>
              </ion-row>
            </ion-card-content>
          </ion-card>
        </ion-grid>
        <!--Resume card-->
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script>

import eventBus from '../eventBus'
import {getMonths, getActualMonthInt, getNextMonthIndex, userRef, expRef, getActualYear, toReceiveRef, formatInputReal, formatInputRealV3} from '../Helper'
import {updateDoc, onSnapshot, Timestamp, arrayUnion } from "firebase/firestore";
import { alertController} from "@ionic/vue";
import TollbarComponent from '../components/TollbarComponent.vue'

export default {
  components:{TollbarComponent},
  data: () => {
    return {
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
    getMonthName(month){
      const monthIndex = parseInt(month) - 1
      return getMonths(monthIndex)
    },

    loadAllData(year = null, month = null){
      if(!year && !month){
        month = getActualMonthInt();
        year = getActualYear()
        
        if(month === 12){
          month = 1
          year = year + 1
        }
      }

      // load user data
      onSnapshot(userRef(), (userSnapshot) => {
        this.emergencyReserveReached = userSnapshot.data().emergencyReserveReached
        this.emergencyReserveGoal = userSnapshot.data().emergencyReserveGoal
      })

      // load expenses data
      onSnapshot(expRef(year, month), (expSnapshot) => {
        this.expenses = []
        expSnapshot.docs.forEach((doc)=>{
          const e = doc.data()
          e.id = doc.id
          this.expenses.push(e)
        })

        this.expenses.sort((a, b) => {
          return  b.price - a.price;
        })

        if(this.allStratched){
          month = month + 1
          if(month === 12){
            month = 1
            year = year + 1
          }

          if(this.count === 0){
            this.loadAllData(year, month)
            this.count += 1

            this.monthToShow = month
          }
        }
      })

      // load toReceiveData
      onSnapshot(toReceiveRef(year, month), (toReceiveSnapShot) => {
        this.toReceives = []
        toReceiveSnapShot.docs.forEach((doc)=>{
          const e = doc.data()
          e.id = doc.id
          this.toReceives.push(e)
        })

        this.sendDataToComponents(this.toReceives)
      })

      setTimeout(() => {
        this.loaded = true
      }, 2000);
    },
    
    sendDataToComponents(data){
      console.log('Emitido')
      eventBus().emitter.emit("dataBetweenComponents", true);
    },

    colorForBarExpenses(){
      const result = ((this.amountExpense * 100) / this.totalToreceive) 
      if(result < 33){
        return 'success'
      }else if(result > 66){
        return 'danger' 
      }else{
        return 'warning'
      }
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
</style>