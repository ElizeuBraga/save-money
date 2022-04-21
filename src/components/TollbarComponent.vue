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
  insertDoc, updateDoc
} from '../models/db'

import {
  getDatesExpenses,
  getDataByDescription,
  dataInMonthGroupByPayment,
} from '../models/expense'

import {
  getDatesReceivables,
  dataInMonthGroupByDebtor
} from '../models/receivables'

import {
  systemExists
} from '../models/system'

import {
  sum,
  dates,
  addZero
} from '../Helper'


import eventBus from '../eventBus';

import json from '../../package.json';

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

      await this.addNegatiValueInNextMonth()

      const system = await systemExists()
      // system.version = json.version
      if(!system){
        // insertDoc(system)
      }else{
        // updateDoc(system)
      }
    },

    sendEvent(e){
      this.defaultmonth = e.target.value
      eventBus().emitter.emit("changeMonthSelect", this.defaultmonth);

      this.loadAllData()
    },

    async addNegatiValueInNextMonth(){
      const year = this.defaultmonth.substring(0,4)
      const month = addZero(parseInt(this.defaultmonth.slice(-2))+1)
      const day = "10"

      const doc = {
        description: 'Mês anterior',
        price: parseFloat(Math.abs(this.total)).toFixed(2),
        rule: "30",
        category: 'Gasto extra',
        payment: 'Reserva',
        expiration: `${year}-${month}-${day}`,
        parcel: 1
      }

      const data = await getDataByDescription(`${year}-${month}`, doc.description)
      if(this.total < 0){
        if(data.length > 0){
            doc._id = data[0]._id
            doc.deletedAt = null
            updateDoc(doc)
        }else{
            insertDoc(doc)
        }
      }else{
        if(data.length > 0){
            doc._id = data[0]._id
            doc.deletedAt = dates(null, 'yyyy-mm-dd')
            updateDoc(doc)
        }
      }
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