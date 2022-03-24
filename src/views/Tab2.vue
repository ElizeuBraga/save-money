<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="dark">
        <tollbar-component tab="tab2"/>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->

    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-title class="ion-text-center">
          Entradas
        </ion-card-title>
        <ion-card-content>
          <ion-row  v-for="item in groupByDebtor" :key="item" @click="showInfoReceivables(item.debtor)">
            <ion-col>
              <ion-label>{{item.debtor}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row  v-if="groupByDebtor.length === 0">
            <ion-col class="ion-text-center">
              <ion-label color="danger" style="font-style: italic">Nenhum item</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row v-else style="font-weight: bold">
            <ion-col>
              <ion-label>Total:</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{sum(groupByDebtor)}}</ion-label>
            </ion-col>
          </ion-row>
        </ion-card-content>
      </ion-card>
      
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="dark" @click="saveOrUpdateAlertIn()" style="font-size: 30px">+</ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  getDataByDebtor,
  insertReceivable,
  updateReceivable,
  getDataByDebtorId,
  dataInMonthGroupByDebtor,
} from '../models/receivables'

import { getPersons } from '../models/persons'

import { 
  sum,
  dates
} from '../Helper'

import { 
  IonFab,
  IonCol,
  IonPage,
  IonRow,
  IonCard,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonContent,
  IonCardTitle,
  IonFabButton,
  IonItemDivider,
  IonCardContent, 
} from "@ionic/vue";

import TollbarComponent from '../components/TollbarComponent.vue'

import Swal from 'sweetalert2'

import eventBus from '../eventBus'

export default {
  components:{ 
    IonFab,
    IonCol,
    IonPage,
    IonRow,
    IonCard,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonContent,
    IonCardTitle,
    IonFabButton,
    IonItemDivider,
    IonCardContent, 
    TollbarComponent, 
  },

  data: () => {
    return {
      groupByDebtor: [],
    }
  },

  async mounted(){
    this.yearMonth = dates(null, 'yyyy-mm', 1);
    eventBus().emitter.on("changeMonthSelect", (e)=>{
      this.yearMonth = e
      this.loadAllData()
    });
    this.loadAllData()
  },

  methods: {
    sum(array){
      return this.formatMoney(sum(array, 'price'))
    },

    async showInfoReceivables(debtor = null){
      let array = []
      if(debtor){
        array = await getDataByDebtor(this.yearMonth,debtor)
      }else{
        array = this.groupByDebtor
      }

      let html = `<div id="${debtor ? 'tableReceivables2' : 'tableReceivables'}" class="container">`
      html += `<h4>${debtor}</h4>`
          array.forEach(element => {
            html +=`
              <div id="row" class="row">
                <div style="display: none" class="col-6 ion-text-left">${debtor ? element._id : ''}</div>
                <div class="col-6 ion-text-left">${element.description? element.description : '-'}</div>
                <div class="col-6 ion-text-right">${this.formatMoney(element.price)}</div>
              </div>
              <hr>
            `
          });

          html+=`</div>`;
      
      Swal.fire({
        html: html,
        showCloseButton: true,
        showConfirmButton: true,
        didOpen:()=>{
          if(debtor){
            this.addRowHandlersReceiv2()
          }else{
            this.addRowHandlersReceiv()
          }
        }
      }).then((values)=>{
        if(values.isConfirmed){
          this.saveOrUpdateAlertIn()
        }
      })
    },

    addRowHandlersReceiv() {
      const table = document.getElementById("tableReceivables");
      const rows = table.getElementsByClassName("row");

      let i;
      for (i = 0; i < rows.length; i++) {
        const currentRow = rows[i];
        const createClickHandler = (row) => {
          return () => {
            const cell = row.getElementsByClassName("col-6")[1];
            const id = cell.innerHTML;
            
            this.showInfoReceivables(id, true)
          };
        };
        currentRow.onclick = createClickHandler(currentRow);
      }
    },

    addRowHandlersReceiv2() {
      const table = document.getElementById("tableReceivables2");
      const rows = table.getElementsByClassName("row");

      let i;
      for (i = 0; i < rows.length; i++) {
        const currentRow = rows[i];
        const createClickHandler = (row) => {
          return () => {
            const cell = row.getElementsByClassName("col-6")[0];
            const id = cell.innerHTML;
            this.saveOrUpdateAlertIn(id, true)
          };
        };
        currentRow.onclick = createClickHandler(currentRow);
      }
    },

    async saveOrUpdateAlertIn(doc= null, getById = false){
      if(getById){
        doc = await getDataByDebtorId(this.yearMonth, doc)
      }

      const expiration = this.yearMonth + '-10'

      let html = ``

      const debtors = await getPersons()
      html+= `<select style="font-size: 16px" class="swal2-input" value="" name="debtor" id="debtor">`;
      html += `<option value="">Selecione</option>`;
      debtors.forEach(c => {
        const selected = (doc && c === doc.debtor) ? 'selected' : ''
        html += `<option value="${c}" ${selected}>${c}</option>`;
      });
      html += `</select>`;

      html += `
        <input style="font-size: 16px" placeholder="Descrição" id="description" type="text" value="${doc ? doc.description : ''}" class="swal2-input">
        <input style="font-size: 16px" placeholder="Valor" id="price" type="number" value="${doc ? doc.price : ''}" class="swal2-input">
        <input style="font-size: 16px" placeholder="Parcelas" id="parcel" type="number" value="${doc ? doc.parcel : '1'}" class="swal2-input">
      `;

      html += `<input style="font-size: 16px" value="${doc ? doc.expiration : expiration}" id="expiration " type="date" class="swal2-input">`
      
      
      Swal.fire({
        title: doc ? 'Editar' : 'Novo registro',
        html: html,
        didOpen:()=>{
          const description = document.getElementById('description')
          const price = document.getElementById('price')
          description.setAttribute('autocomplete', 'off')
          price.setAttribute('autocomplete', 'off')
        },
        showDenyButton: true,
        showCancelButton: true,
        cancelButtonText:'Pagar',
        denyButtonText:'Excluir',
        confirmButtonText: 'Salvar',
        confirmButtonColor: 'green',
        cancelButtonColor: 'blue',
        showCloseButton: true,
        preConfirm:()=>{
          const price = document.getElementById('price').value
          const description = document.getElementById('description').value
          const debtor = document.getElementById('debtor').value
          const expiration = document.querySelector('input[type="date"]').value

          if(description == '' || price == '' || expiration == '' || debtor == ''){
            Swal.showValidationMessage('Preencha todos os campos')
          }
        }
      }).then((values)=>{
        if(values.isConfirmed){
          const price = document.getElementById('price').value
          const description = document.getElementById('description').value
          const expiration = document.querySelector('input[type="date"]').value
          const debtor = document.getElementById('debtor').value
          const parcel = document.getElementById('parcel').value
          
          if(doc){
            doc.price = price
            doc.expiration = expiration
            doc.debtor = debtor
            doc.description = description
            updateReceivable(doc)
          }else{
            insertReceivable({
              price: price,
              description: description,
              expiration: expiration,
              debtor: debtor,
              parcel: parseInt(parcel)
            })
          }
        }else if(values.isDenied){
          doc.deletedAt = dates(null, 'yyyy-mm-dd')
          updateReceivable(doc)
        }else if(values.dismiss == 'cancel'){
          doc.paid = !doc.paid
          updateReceivable(doc)
        }
        this.loadAllData()
      })
    },

    async loadAllData(){
      this.groupByDebtor = await dataInMonthGroupByDebtor(this.yearMonth)
      
      eventBus().emitter.emit("loadAllData", true);
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

.swiper-slide {
  display: block;
}

.savem-font-big{
  font-size: 20px;
  font-weight: 300;
}

.savem-font-sm{
  font-size: 17px;
}

ion-col{
  --padding-bottom: 0px
}

ion-content {
  --ion-background-color: #252525;
}

ion-card {
  padding: 20px;
  --ion-background-color: white;
  border-radius: 9px;
  padding-bottom: 40px;
}

.wallet{
  font-size: 20px!important;
  font-weight: bold;
}

.swal2-file, .swal2-input, .swal2-textarea{
  font-size: 10px;
}

table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}

ion-item-divider{
  margin-top: 0px;
  min-height: 1px!important;
}
</style>