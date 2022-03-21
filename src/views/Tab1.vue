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
          <ion-row  v-for="item in groupByPayment" :key="item" @click="showInfo(item, 'payment')">
            <ion-col>
              <ion-label>{{item.payment ? item.payment : '-'}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row style="font-weight: bold">
            <ion-col>
              <ion-label>Total:</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(totalExp)}}</ion-label>
            </ion-col>
          </ion-row>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-title class="ion-text-center">
          Por categoria
        </ion-card-title>
        <ion-card-content>
          <ion-row  v-for="item in groupByCategory" :key="item" @click="showInfo(item, 'category')">
            <ion-col>
              <ion-label :color="returnColor(item)">{{item.category ? item.category: '-'}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-center">
              <ion-label :color="returnColor(item)">{{calcPercentage(item.price)}}%</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label :color="returnColor(item)">{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row style="font-weight: bold">
            <ion-col>
              <ion-label>Total:</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(totalExp)}}</ion-label>
            </ion-col>
          </ion-row>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-title class="ion-text-center">
          Por produto
        </ion-card-title>
        <ion-card-content>
          <ion-row  v-for="item in groupByProduct" :key="item" @click="showInfo(item, 'product')">
            <ion-col>
              <ion-label>{{item.description ? item.description: '-'}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row style="font-weight: bold">
            <ion-col>
              <ion-label>Total:</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(totalExp)}}</ion-label>
            </ion-col>
          </ion-row>
        </ion-card-content>
      </ion-card>
    </ion-content>
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button color="dark" @click="insertOrUpdatePerson()" style="font-size: 30px">P</ion-fab-button>
      <ion-fab-button color="dark" @click="saveOrUpdateAlert()" style="font-size: 30px">-</ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script>
import {
  getActualMonthInt, 
  getNextMonthIndex, 
  formatInputRealV3, 
  formatInputReal, 
  getMonths, 
  userRef, 
  dates, 
  sum,
} from '../Helper'

import {
  arrayUnion, 
  updateDoc, 
  Timestamp, 
} from "firebase/firestore";

import { 
  dataInMonthGroupByCategory, 
  dataInMonthGroupByPayment, 
  dataInMonthGroupByProduct,  
  getDataByCategory, 
  getDataByPayment, 
  getDataByProduct, 
  getDatesExpenses,
  getDataById, 
  update, 
  insert
} from '../models/expense'

import { 
  dataInMonthGroupByDebtor, 
  getDataByDebtorId,
  updateReceivable, 
  insertReceivable, 
  getDataByDebtor, 
} from '../models/receivables'

import { 
  insertPerson, 
  updatePerson, 
  getPersons
} from '../models/persons'

import { 
  alertController,
  IonItemDivider,
  IonFab, 
  IonFabButton
} from "@ionic/vue";

import TollbarComponent from '../components/TollbarComponent.vue'

import Swal from 'sweetalert2'
import eventBus from '../eventBus'

export default {
  components:{
      TollbarComponent,
      IonItemDivider,
      IonFab, 
      IonFabButton
    },
  data: () => {
    return {
      componentKey: 0,
      groupByCategory: [],
      groupByPayment: [],
      groupByProduct: [],
      groupByDebtor: [],
      totalExp: 0,
      totalDeb: 0,
      yearMonth: '',
      monthToShow: getActualMonthInt(),
      slideOpts:{
        initialSlide: getNextMonthIndex(),
        speed: 400
      },
      name: '',
      months: [],
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
    this.yearMonth = dates(null, 'yyyy-mm', 1);
    eventBus().emitter.on("changeMonthSelect", async (e)=>{
      this.yearMonth = e
      await this.loadAllData()
    });
    await this.loadAllData()
  },

  methods: {
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

      const expiration = dates(Date.now(), null, 1)

      let html = `
        <input style="font-size: 16px" placeholder="Descrição" id="description" value="${doc ? doc.description : ''}" class="swal2-input">
        <input style="font-size: 16px" placeholder="Valor" id="price" type="number" value="${doc ? doc.price : ''}" class="swal2-input">
        <input style="font-size: 16px" placeholder="Parcelas" id="parcel" type="number" value="${doc ? doc.parcel : ''}" class="swal2-input">
      `;

      html += `<input style="font-size: 16px" value="${doc ? doc.expiration : expiration}" id="expiration " type="date" class="swal2-input">`
      
      const payments = ['Crédito', 'Débito', 'Reserva']
      html+= `<select style="font-size: 16px" class="swal2-input" value="" name="payment" id="payment">`;
      html += `<option value="">Selecione</option>`;
      payments.forEach(c => {
        const selected = (doc && c === doc.payment) ? 'selected' : ''
        html += `<option value="${c}" ${selected}>${c}</option>`;
      });
      html += `</select>`;

      const categories = ['50', '30', '20']
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
          description.focus()
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

          if(description == '' || price == '' || expiration == '' || payment == '' || category == ''){
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
          const parcel = document.getElementById('parcel').value
          
          if(doc){
            doc.description = description
            doc.price = price
            doc.expiration = expiration
            doc.payment = payment
            doc.category = category
            update(doc)
          }else{
            insert({
              description: description,
              price: price,
              expiration: expiration,
              category: category,
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

    async insertOrUpdatePerson(person= null){
      Swal.fire({
        title: person ? person.name : 'Nova pessoa',
        input: 'text',
        showCancelButton: true,
        cancelButtonText:'Cancelar',
        confirmButtonText: 'Salvar',
        confirmButtonColor: 'green',
        cancelButtonColor: 'blue',
        showCloseButton: true,
        preConfirm:(value)=>{
          if(value === ''){
            Swal.showValidationMessage('Informe o nome')
          }
        }
      }).then(async (values)=>{
        if(values.isConfirmed){
          if(person){
            updatePerson(person)
          }else{
            insertPerson({
              name: values.value
            })
          }
        }

        console.log(await getPersons())
      })
    },

    async saveOrUpdateAlertIn(doc= null, getById = false){
      if(getById){
        doc = await getDataByDebtorId(this.yearMonth, doc)
      }

      const expiration = dates(Date.now(), null, 1)

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
        <input style="font-size: 16px" placeholder="Valor" id="price" type="number" value="${doc ? doc.price : ''}" class="swal2-input">
        <input style="font-size: 16px" placeholder="Parcelas" id="parcel" type="number" value="${doc ? doc.parcel : '1'}" class="swal2-input">
      `;

      html += `<input style="font-size: 16px" value="${doc ? doc.expiration : expiration}" id="expiration " type="date" class="swal2-input">`
      
      
      Swal.fire({
        title: doc ? 'Editar' : 'Novo registro',
        html: html,
        didOpen:()=>{
          const price = document.getElementById('price')

          price.setAttribute('autocomplete', 'off')
          price.focus()
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
          const debtor = document.getElementById('debtor').value
          const expiration = document.querySelector('input[type="date"]').value

          if(price == '' || expiration == '' || debtor == ''){
            Swal.showValidationMessage('Preencha todos os campos')
          }
        }
      }).then((values)=>{
        if(values.isConfirmed){
          const price = document.getElementById('price').value
          const expiration = document.querySelector('input[type="date"]').value
          const debtor = document.getElementById('debtor').value
          const parcel = document.getElementById('parcel').value
          
          if(doc){
            doc.price = price
            doc.expiration = expiration
            doc.debtor = debtor
            updateReceivable(doc)
          }else{
            insertReceivable({
              price: price,
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
    
    async showInfo(item, type){
      let array = []
      let title = ''
      if(type === 'payment'){
        array = await getDataByPayment(this.yearMonth, item.payment)
        title = item.payment
      }else if(type === 'category'){
        array = await getDataByCategory(this.yearMonth, item.category)
        title = item.category
      }else{
        array = await getDataByProduct(this.yearMonth, item.description)
        title = item.description
      }

      let html = `<div id="tableExpenses" class="container">`
          html += `<h3>${title}</h3>`
          array.forEach(element => {
            html +=`
              <div id="row" class="row">
                  <div class="col-6" style="display: none">${element._id}</div>
                  <div class="col-6 ion-text-left">${element.description}</div>
                  <div class="col-6 ion-text-right">${this.formatMoney(element.price)}</div>
              </div>
              <hr>
            `
          });

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

    getMonthName(month){
      const monthIndex = parseInt(month) - 1
      return getMonths(monthIndex)
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

      this.groupByProduct = await dataInMonthGroupByProduct(this.yearMonth)
      this.groupByProduct.sort((a, b)=>{
        return a.description.localeCompare(b.description)
      })

      this.groupByDebtor = await dataInMonthGroupByDebtor(this.yearMonth)

      this.months = await getDatesExpenses()

      this.totalDeb = sum(this.groupByDebtor, 'price')
      this.totalExp = sum(this.groupByPayment, 'price')
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

    // getDataByDebtor

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

    calcPercentage(value){
      if(!this.totalDeb){
        return 100
      }

      return ((100 * value) / this.totalDeb).toFixed(2)
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
  margin-top: 0px;
  min-height: 1px!important;
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