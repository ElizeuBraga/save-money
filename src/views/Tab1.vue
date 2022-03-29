<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="dark">
        <tollbar-component tab="tab1"/>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->

    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-title class="ion-text-center">
          Por pagamento
        </ion-card-title>
        <ion-card-content>
          <ion-row :style="item.paid ? 'text-decoration: line-through; opacity: 0.5;' : ''"  v-for="item in groupByPayment" :key="item" @click="showInfo(item, 'payment')">
            <ion-col>
              <ion-label>{{item.payment ? item.payment : '-'}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row  v-if="groupByPayment.length === 0">
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
              <ion-label>{{sum(groupByPayment)}}</ion-label>
            </ion-col>
          </ion-row>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-title class="ion-text-center">
          Por regra
        </ion-card-title>
        <ion-card-content>
          <ion-row :style="item.paid ? 'text-decoration: line-through; opacity: 0.5;' : ''"  v-for="item in groupByRule" :key="item" @click="showInfo(item, 'rule')">
            <ion-col>
              <ion-label :color="returnColor(item)">{{item.rule ? item.rule: '-'}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-center">
              <ion-label :color="returnColor(item)">{{calcPercentage(item.price)}}%</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label :color="returnColor(item)">{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row  v-if="groupByRule.length === 0">
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
              <ion-label>{{sum(groupByRule)}}</ion-label>
            </ion-col>
          </ion-row>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-title class="ion-text-center">
          Por categoria
        </ion-card-title>
        <ion-card-content>
          <ion-row :style="item.paid ? 'text-decoration: line-through; opacity: 0.5;' : ''"  v-for="item in groupByCategory" :key="item" @click="showInfo(item, 'category')">
            <ion-col>
              <ion-label>{{item.category ? item.category: '-'}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row  v-if="groupByCategory.length === 0">
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
              <ion-label>{{sum(groupByCategory)}}</ion-label>
            </ion-col>
          </ion-row>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-title class="ion-text-center">
          Por produto
        </ion-card-title>
        <ion-card-content>
          <ion-row :style="item.paid ? 'text-decoration: line-through; opacity: 0.5;' : ''"  v-for="item in groupByProduct" :key="item" @click="showInfo(item, 'product')">
            <ion-col>
              <ion-label>{{item.description ? item.description: '-'}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row  v-if="groupByProduct.length === 0">
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
              <ion-label>{{sum(groupByProduct)}}</ion-label>
            </ion-col>
          </ion-row>
        </ion-card-content>
      </ion-card>
    </ion-content>
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button color="dark" @click="saveOrUpdateAlert()" style="font-size: 30px">+</ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script>

import {
  sum,
  dates, 
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

import { 
  dataInMonthGroupByDebtor, 
} from '../models/receivables'

import { 
  update, 
  insert,
  getDataById, 
  getDataByRule,
  getDataByPayment, 
  getDataByProduct, 
  getDataByCategory, 
  dataInMonthGroupByRule,
  dataInMonthGroupByPayment, 
  dataInMonthGroupByProduct,  
  dataInMonthGroupByCategory,
} from '../models/expense'

import { getRules } from '../models/rules'
import { getCategorys } from '../models/categories'
import { getPayments } from '../models/payments'

import Swal from 'sweetalert2'
import eventBus from '../eventBus'
import TollbarComponent from '../components/TollbarComponent.vue'

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
      totalDeb: 0,
      yearMonth: '',
      groupByRule: [],
      groupByDebtor: [],
      groupByPayment: [],
      groupByProduct: [],
      groupByCategory: [],
    }
  },

  async mounted() {
    this.yearMonth = dates(null, 'yyyy-mm', 1);
    eventBus().emitter.on("changeMonthSelect", async (e)=>{
      this.yearMonth = e
      await this.loadAllData()
    });
    await this.loadAllData()
  },

  methods: {
    sum(array){
      return this.formatMoney(sum(array, 'price'))
    },

    returnColor(item){
      if(item.category === '50'){
        if(this.calcPercentage(item.price) > 50){
          return 'danger'
        }
      }else if(item.category === '30'){
        if(this.calcPercentage(item.price) > 30){
          return 'danger'
        }
      }else{
        if(this.calcPercentage(item.price) > 20){
          return 'danger'
        }
      }
    },

    async saveOrUpdateAlert(doc= null, getById = false){
      if(getById){
        doc = await getDataById(doc)
      }

      const expiration = this.yearMonth + '-10'

      let html = `
        <input style="font-size: 16px" placeholder="Descrição" id="description" value="${doc ? doc.description : ''}" class="swal2-input">
        <input style="font-size: 16px" placeholder="Valor" id="price" type="number" value="${doc ? doc.price : ''}" class="swal2-input">
        <input style="font-size: 16px" placeholder="Parcelas" id="parcel" type="number" value="${doc ? doc.parcel : ''}" class="swal2-input">
      `;

      html += `<input style="font-size: 16px" value="${doc ? doc.expiration : expiration}" id="expiration " type="date" class="swal2-input">`
      
      const payments = await getPayments() 
      html+= `<select style="font-size: 16px" class="swal2-input" value="" name="payment" id="payment">`;
      html += `<option value="">Selecione</option>`;
      payments.forEach(c => {
        const selected = (doc && c === doc.payment) ? 'selected' : ''
        html += `<option value="${c}" ${selected}>${c}</option>`;
      });
      html += `</select>`;

      const rules = await getRules() 
      html+= `<select style="font-size: 16px" class="swal2-input" value="" name="rule" id="rule">`;
      html += `<option value="">Selecione</option>`;
      rules.forEach(c => {
        const selected = (doc && c === doc.rule) ? 'selected' : ''
        html += `<option value="${c}" ${selected}>${c}</option>`;
      });
      html += `</select>`;

      const categories = await getCategorys()
      html+= `<select style="font-size: 16px" class="swal2-input" value="" name="category" id="category">`;
      html += `<option value="">Selecione</option>`;
      categories.forEach(c => {
        const selected = (doc && c === doc.category) ? 'selected' : ''
        html += `<option value="${c}" ${selected}>${c}</option>`;
      });
      html += `</select>`;

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
        showCancelButton: doc,
        cancelButtonText: (doc && doc.paid) ? 'Não paguei' : 'Pagar',
        denyButtonText:'Excluir',
        confirmButtonText: 'Salvar',
        confirmButtonColor: 'green',
        cancelButtonColor: 'blue',
        showCloseButton: true,
        preConfirm:()=>{
          const description = document.getElementById('description').value
          const price = document.getElementById('price').value
          const expiration = document.querySelector('input[type="date"]').value
          const payment = document.getElementById('payment').value
          const category = document.getElementById('category').value
          const rule = document.getElementById('rule').value

          if(description == '' || price == '' || expiration == '' || payment == '' || category == '' || rule == ''){
            Swal.showValidationMessage('Preencha todos os campos')
          }
        }
      }).then((values)=>{
        if(values.isConfirmed){
          const description = document.getElementById('description').value
          const price = document.getElementById('price').value
          const expiration = document.querySelector('input[type="date"]').value
          const payment = document.getElementById('payment').value
          const category = document.getElementById('category').value
          const rule = document.getElementById('rule').value
          const parcel = document.getElementById('parcel').value
          
          if(doc){
            doc.description = description
            doc.price = price
            doc.expiration = expiration
            doc.payment = payment
            doc.category = category
            doc.rule = rule
            update(doc)
          }else{
            insert({
              description: description,
              price: price,
              expiration: expiration,
              category: category,
              rule: rule,
              payment: payment,
              parcel: parseInt(parcel)
            })
          }
        }else if(values.isDenied){
          doc.deletedAt = dates(null, 'yyyy-mm-dd')
          update(doc)
        }else if(values.dismiss == 'cancel'){
          doc.paid = !doc.paid
          update(doc)
        }
        this.loadAllData()
      })
    },

    async showInfo(item, type){
      let array = []
      let title = ''
      if(type === 'payment'){
        array = await getDataByPayment(this.yearMonth, item.payment)
        title = `Pagamento: ${item.payment}`
      }else if(type === 'category'){
        array = await getDataByCategory(this.yearMonth, item.category)
        title = `Categoria: ${item.category}`
      }else if (type === 'product'){
        array = await getDataByProduct(this.yearMonth, item.description)
        title = `Produto: ${item.description}`
      }else if(type === 'rule'){
        array = await getDataByRule(this.yearMonth, item.rule)
        title = `Regra: ${item.rule}`
      }

      let html = `<div id="tableExpenses" class="container">`
          html += `<h3>${title}</h3>`
          html +=``
          array.forEach(element => {
            const style = element.paid ? 'text-decoration: line-through; opacity: 0.5;' : ''
            html +=`
              <div style="${style}" id="row" class="row">
                  <div class="col-6" style="display: none">${element._id}</div>
                  <div class="col-6 ion-text-left">${element.description}</div>
                  <div class="col-6 ion-text-right">${this.formatMoney(element.price)}</div>
              </div>
              <hr>
            `
          });
          html+=`
            <div id="row" class="row" style="font-weight: bold">
              <div class="col-6 ion-text-left">Total:</div>
              <div class="col-6 ion-text-right">${this.formatMoney(sum(array, 'price'))}</div>
            </div>`;

          html+=`</div>`;
      
      Swal.fire({
        html: html,
        showCloseButton: true,
        showConfirmButton: false,
        didOpen:()=>{
          this.addRowHandlers()
        }
      })
    },

    async loadAllData(){
      this.groupByPayment = await dataInMonthGroupByPayment(this.yearMonth)
      this.groupByPayment.sort((a, b)=>{
        return a.payment.localeCompare(b.payment)
      })

      this.groupByCategory = await dataInMonthGroupByCategory(this.yearMonth)
      this.groupByCategory.sort((a, b)=>{
        return parseInt(b.category) - parseInt(a.category)
      })

      this.groupByRule = await dataInMonthGroupByRule(this.yearMonth)
      this.groupByRule.sort((a, b)=>{
        return parseInt(b.rule) - parseInt(a.rule)
      })

      this.groupByProduct = await dataInMonthGroupByProduct(this.yearMonth)
      this.groupByProduct.sort((a, b)=>{
        return a.description.localeCompare(b.description)
      })

      console.log(this.groupByProduct)

      this.groupByDebtor = await dataInMonthGroupByDebtor(this.yearMonth)
      this.totalDeb = sum(this.groupByDebtor, 'price')
      this.inWallet = (this.totalDeb - sum(this.groupByPayment, 'price'));

      eventBus().emitter.emit("loadAllData", true);
    },

    addRowHandlers() {
      const table = document.getElementById("tableExpenses");
      const rows = table.getElementsByClassName("row");

      let i;
      for (i = 0; i < rows.length; i++) {
        const currentRow = rows[i];
        const createClickHandler = (row) => {
          return () => {
            const cell = row.getElementsByClassName("col-6")[0];
            const id = cell.innerHTML;
            
            this.saveOrUpdateAlert(id, true)
          };
        };
        currentRow.onclick = createClickHandler(currentRow);
      }
    },

    calcPercentage(value){
      if(!this.totalDeb){
        return 100
      }

      return ((100 * value) / this.totalDeb).toFixed(2)
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
    font-size: 16px!important;
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
  margin-top: -10px;
  min-height: 20px!important;
}

ion-content {
  --ion-background-color: #252525;
}

.swal2-popup {
  font-family: "LabelInputsFont" !important;
}

hr
{
    background-color: #eee;
    border: 0 none;
    color: #eee;
    height: 1px;
    margin: 0!important;
}
</style>