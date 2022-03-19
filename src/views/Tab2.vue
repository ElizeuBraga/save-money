<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="dark">
        <tollbar-component :tab="tab"/>
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
      
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="dark" @click="saveOrUpdateAlertIn()" style="font-size: 30px">+</ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  update, 
  insert, 
  getPaid, 
  getUnPaid, 
  getDatesExpenses,
  getDataByDescription,
} from '../models/expense'

import {
  insertReceivable,
  updateReceivable,
  getDataByDebtorId,
  dataInMonthGroupByDebtor,
  getDataByDebtor
} from '../models/receivables'

import {
  getPersons
} from '../models/persons'

import { 
  sum,
  dates, 
  expRef, 
  userRef, 
  addZero, 
  getMonths, 
  sumElements
} from '../Helper'
import { 
  doc, 
  addDoc, 
  deleteDoc, 
  Timestamp, 
  updateDoc, 
  arrayUnion 
} from "firebase/firestore";

import { 
  IonFab, 
  IonCard, 
  IonToolbar,
  IonFabButton, 
  alertController, 
  actionSheetController, 
} from "@ionic/vue";

import TollbarComponent from '../components/TollbarComponent.vue'

import { 
  arrowForwardCircle 
} from 'ionicons/icons';

import Swal from 'sweetalert2'

import eventBus from '../eventBus'

export default {
  components:{ 
    IonFab, 
    IonCard, 
    IonToolbar,
    IonFabButton, 
    TollbarComponent, 
  },
  data: () => {
    return {
      groupByDebtor: [],
      tab: 'tab1',
      filter: 'description',
      monthYear: dates(null, 'yyyy-mm', 1),
      totalPaid: 0,
      totalUnPaid: 0,
      arrowForwardCircle,
      slideOpts:{
        initialSlide: 0,
        speed: 400
      },
      months: getMonths(),
      loaded: false,
      emergencyReserveGoal: 0,
      emergencyReserveReached: 0,
      expenses: [],
      toReceives:[],
      slideDatesExp: [],
      actualSlide: null,

      milliseconds: Timestamp.now().toMillis(),
      
      userRef: null,
      monthRef: null,
      expensesRef: null,

      allData: null
    }
  },

  async mounted(){
    this.actualizeData()

    this.yearMonth = dates(null, 'yyyy-mm', 1);
    eventBus().emitter.on("changeMonthSelect", async (e)=>{
      this.yearMonth = e
      await this.loadAllData()
    });
    this.loadAllData()
  },

  methods: {
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
        <input style="font-size: 16px" placeholder="Descrição" id="description" type="text" value="${doc ? doc.description : ''}" class="swal2-input">
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

    sort(sort){
      if(sort == 'description'){
        this.expenses.sort((a, b) =>{
          return a.description - b.description
        })
      }else if(sort == 'category'){
        this.expenses.sort((a, b)=>{
          return a.category - b.category
        })
      }else{
        this.expenses.sort((a, b)=>{
          return parseFloat(b.price) - parseFloat(a.price)
        })
      }
    },

    formatDate(date){
      return dates(date, 'dd/mm')
    },

    async segmentChanged(e){
      this.tab = e.detail.value
      this.actualizeData()
    },

    async segmentFilterChanged(e){
      this.filter = e.detail.value
      this.actualizeData()
    },

    getMonthName(month){
      const monthIndex = parseInt(month) - 1
      return getMonths(monthIndex)
    },

    async loadAllData(){
      this.groupByDebtor = await dataInMonthGroupByDebtor(this.yearMonth)
      
      eventBus().emitter.emit("loadAllData", true);
    },

    async slideChanged(e){
      e.target.getActiveIndex().then( async i => {
        this.monthYear = this.slideDatesExp[i]
        this.actualizeData()
      });
    },

    async alertNewExpense(item){
      const date = dates(Date.now())
      let expiration = date.year +'-'+date.month+'-'+'10'
      if(this.actualSlide){
        expiration = this.actualSlide.year +'-'+this.actualSlide.month+'-'+'10'
      }
      
      if(item){
        const date = dates(item.expiration);
        expiration = date.year + '-' + date.month + '-' + date.day
      }
      const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: 'Novo item',
          inputs: [
            {
              label: 'Descrição',
              name: 'description',
              id: 'description',
              value: '',
              placeholder: 'Digite uma descrição',
            },
            {
              label: 'Valor',
              name: 'price',
              id: 'price',
              value: '',
              placeholder: 'Digite o valor',
              type: 'number'
            },
            {
              label: 'Data de vencimento',
              name: 'expiration',
              id: 'expiration',
              value: expiration,
              type: 'date'
            },
            {
              label: 'Repetir',
              name: 'repeat',
              id: 'repeat',
              value: '',
              placeholder: 'Repetir?',
              type: 'number',
              max: 60
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

      const description = document.getElementById('description')
      const price = document.getElementById('price')
      const repeat = document.getElementById('repeat')

      description.setAttribute('autocomplete', 'off')
      price.setAttribute('autocomplete', 'off')
      repeat.setAttribute('autocomplete', 'off')

      return alert.present();
    },
    
    async saveOrUpdateAlert(doc= null){
      const expiration = dates(Date.now(), null, 1)
      let html = `
        <input style="font-size: 16px" id="description" value="${doc ? doc.description : ''}" class="swal2-input">
        <input style="font-size: 16px" id="price" type="number" value="${doc ? doc.price : ''}" class="swal2-input">
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
        showCancelButton: true,
        cancelButtonText:'Pagar',
        denyButtonText:'Excluir',
        confirmButtonText: 'Salvar',
        confirmButtonColor: 'green',
        cancelButtonColor: 'blue',
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
              category: category
            })
          }
        }else if(values.isDenied){
          doc.deletedAt = dates(null, 'yyyy-mm-dd')
          update(doc)
        }else if(values.dismiss == 'cancel'){
          doc.paid = true
          update(doc)
        }
        this.actualizeData()
      })
    },

    async saveNewExpense(expense){
      let img = '../img/imgs/'+expense.description.toLowerCase()+'.png'
  
      if(!await this.imageExists(img)){
        img = '../img/imgs/default.png'
      }

      // if repeat
      let repeat = parseInt(expense.repeat)

    
      const day = new Date(expense.expiration).getUTCDate()
      let month = new Date(expense.expiration).getMonth() + 1
      let year = new Date(expense.expiration).getFullYear()

      let expiration = new Date(`${year}-${addZero(month)}-${day}`).getTime()
      addDoc(expRef(year, month), {description: expense.description, price: parseFloat(expense.price), img: img, expiration: expiration, createdAt: this.milliseconds})
      await updateDoc(userRef(), {
        slideDatesExp: arrayUnion({year: String(year), month: addZero(month)})
      })
      
      while (repeat > 1) {
        if(parseInt(month) == 12){
          year = String(parseInt(year) + 1)
          month = 1
        }else{
          month = String(parseInt(month) + 1)
        }
        
        expiration = new Date(`${year}-${addZero(month)}-${day}`).getTime()
        
        addDoc(expRef(year, month), {description: expense.description, price: parseFloat(expense.price), img: img, expiration: expiration, createdAt: this.milliseconds})
        await updateDoc(userRef(), {
          slideDatesExp: arrayUnion({year: String(year), month: addZero(month)})
        })
        repeat --
      }

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
            {
              label: 'Data de vencimento',
              name: 'expiration',
              id: 'expiration',
              value: this.formatDateYYYMMMDDD(expense.expiration),
              type: 'date'
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

    formatDateYYYMMMDDD(date) {
      const d = new Date(date)
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        const year = d.getFullYear()

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
        
        return [year, month, day].join('-');
    },

    async updateExpense(expense){
      let img = '../img/imgs/'+expense.description.toLowerCase()+'.png'

      if(!await this.imageExists(img)){
        img = '../img/imgs/default.png'
      }

      const day = new Date(expense.expiration).getUTCDate()
      const month = new Date(expense.expiration).getMonth() + 1
      const year = new Date(expense.expiration).getFullYear()

      const expiration = new Date(`${year}-${month}-${day}`).getTime()

      updateDoc(doc(expRef(year, month), expense.id), {description: expense.description, price: parseFloat(expense.price), img: img, expiration: expiration, createdAt: this.milliseconds})

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
      // const day = new Date(expense.expiration).getUTCDate()
      const month = new Date(expense.expiration).getMonth() + 1
      const year = new Date(expense.expiration).getFullYear()
      deleteDoc(doc(expRef(year, month), expense.id));
      this.showToast('success', 'Item excluído!')
    },

    scratchEspense(expense){
      // const day = new Date(expense.expiration).getUTCDate()
      const month = new Date(expense.expiration).getMonth() + 1
      const year = new Date(expense.expiration).getFullYear()
      updateDoc(doc(expRef(year, month), expense.id), {scratch: expense.scratch ? false : true});
      this.showToast('success', 'Item riscado!')
    },

    async actualizeData(){
      this.slideDatesExp = await getDatesExpenses();
      this.slideOpts.initialSlide = this.slideDatesExp.indexOf(this.monthYear)
      if(this.tab === 'toPaid'){
        this.expenses = await getUnPaid(this.monthYear)
        this.totalUnPaid = sum(this.expenses, 'price')
      }else{
        this.expenses = await getPaid(this.monthYear)
        this.totalPaid = sum(this.expenses, 'price')
      }
      
      this.sort()
    },

    addRowHandlers() {
      const table = document.getElementById("tableExpenses");
      const rows = table.getElementsByTagName("tr");
      let i;
      for (i = 0; i < rows.length; i++) {
        const currentRow = table.rows[i];
        const createClickHandler = (row) => {
          return () => {
            const cell = row.getElementsByTagName("td")[0];
            const id = cell.innerHTML;
            
            this.saveOrUpdateAlert(id)
          };
        };
        currentRow.onclick = createClickHandler(currentRow);
      }
    },

    async showInfo(item){
      if(this.filter != 'description'){
        return 
      }
      const array = await getDataByDescription(this.monthYear, item, false)
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

    async presentActionSheet(expense) {
      const actionSheet = await actionSheetController
        .create({
          header: 'Opções',
          cssClass: 'my-custom-class',
          buttons: [
            {
              text: 'Editar',
              handler: () => {
                this.saveOrUpdateAlert(expense)
              },
            },
            {
              text: 'Excluir',
              handler: () => {
                expense.deletedAt = dates()
                update(expense)
                this.actualizeData()
              },
            },
            {
              cssClass: 'ion-color-danger',
              text: expense.paid ? 'Não paguei' : 'Pago',
              handler: () => {
                expense.paid = !expense.paid
                update(expense)
                this.actualizeData()
              },
            }
          ],
        });
      await actionSheet.present();
    }
  },

  computed:{
    allStratched(){
      if(this.expenses.findIndex(x => (!x.scratch)) > -1){
        return false
      }else{
        return true
      }
    },

    amountExpense(){
      return sumElements(this.expenses, 'price')
    },

    totalToreceive(){
      return sumElements(this.toReceives, 'price')
    },

    total(){
      if(this.tab === 'toPaid'){
        return this.totalUnPaid
      }else{
        return this.totalPaid
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