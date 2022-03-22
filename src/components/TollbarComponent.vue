<template>
  <ion-row>
      <ion-col>
        <ion-select @ionChange="sendEvent($event)" :selected-text="returnMonthName(defaultmonth)" :value="defaultmonth" interface="popover">
          <ion-select-option v-for="m in months" :value="m" :key="m">{{returnMonthName(m)}}</ion-select-option>
        </ion-select>
      </ion-col>
      <ion-col size="6" class="ion-text-right">
        <ion-label class="wallet" :color="(total > 0) ? 'success' : 'danger'">{{formatMoney(total)}}</ion-label>
      </ion-col>
  </ion-row>
</template>


<script>
// no-parsing-error

import {
  IonRow, 
  IonCol, 
  IonLabel,
  IonSelect, 
  IonSelectOption, 
} from '@ionic/vue'

import {
  getDatesExpenses,
  dataInMonthGroupByPayment,
} from '../models/expense'

import {
  getDatesReceivables,
  dataInMonthGroupByDebtor
} from '../models/receivables'

import {
  sum,
  dates,
} from '../Helper'

import eventBus from '../eventBus';

export default {
  components:{
    IonRow, 
    IonCol, 
    IonLabel,
    IonSelect, 
    IonSelectOption,
  },
  props: {
    tab: String,
  },

  data: () => {
    return{
      months: [],
      defaultmonth: '',
      total: 0,
    }
  },

  mounted(){
    this.defaultmonth = dates(null, 'yyyy-mm', 1);
    this.loadAllData()

    eventBus().emitter.on("loadAllData", ()=>{
      this.loadAllData()
    });
  },

  methods:{
    returnMonthName(key){
      const year = key.substring(0,4)
      const month = key.slice(-2)
      switch (month) {
        case '01':
          return 'Janeiro/'+year
        case '02':
          return 'Fevereiro/'+year
        case '03':
          return 'Março/'+year
        case '04':
          return 'Abril/'+year
        case '05':
          return 'Maio/'+year
        case '06':
          return 'Junho/'+year
        case '07':
          return 'Julho/'+year
        case '08':
          return 'Agosto/'+year
        case '09':
          return 'Setembro/'+year
        case '10':
          return 'Outubro/'+year
        case '11':
          return 'Novembro/'+year
        case '12':
          return 'Dezembro/'+year
        default:
          return key;
      }
    },

    async loadAllData(){
      if(this.tab === 'tab1'){
        this.months = await getDatesExpenses()
      }else{
        this.months = await getDatesReceivables()
      }

      const totalDeb = sum(await dataInMonthGroupByDebtor(this.defaultmonth), 'price')
      const totalExp = sum(await dataInMonthGroupByPayment(this.defaultmonth), 'price')
      this.total = (totalDeb - totalExp);
    },

    sendEvent(e){
      this.defaultmonth = e.target.value
      eventBus().emitter.emit("changeMonthSelect", this.defaultmonth);

      this.loadAllData()
    },

    formatMoney(amount) {
      if(amount){
        return parseFloat(amount).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      }else{
        return "R$ " + parseFloat("0.00").toFixed(2).replace(".", ",");
      }
    },
  }
}
</script>

<style scoped>
  .wallet{
    font-size: 20px!important;
    font-weight: bold;
  }
</style>