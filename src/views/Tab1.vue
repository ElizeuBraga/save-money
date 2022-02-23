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
          <ion-row  v-for="item in groupByPayment" :key="item" @click="showInfo(item, 'payment')">
            <ion-col>
              <ion-label>{{item.payment ? item.payment : '-'}}</ion-label>
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
          <ion-row  v-for="item in groupByCategory" :key="item" @click="showInfo(item, 'category')">
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
        </ion-card-content>
      </ion-card>
    </ion-content>
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button color="dark" @click="saveOrUpdateAlert()" style="font-size: 30px">+</ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script>

import {getMonths, getActualMonthInt, getNextMonthIndex, userRef, formatInputReal, formatInputRealV3, dates} from '../Helper'
import {updateDoc, Timestamp, arrayUnion } from "firebase/firestore";
import { dataInMonthGroupByPayment, dataInMonthGroupByCategory, getDataByPayment, getDataByCategory, getDataByProduct, dataInMonthGroupByProduct,  update, insert, getDataById} from '../models/expense'
import { alertController} from "@ionic/vue";
import TollbarComponent from '../components/TollbarComponent.vue'
import Swal from 'sweetalert2'

export default {
  components:{TollbarComponent},
  data: () => {
    return {
      groupByCategory: [],
      groupByPayment: [],
      groupByProduct: [],
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
    async saveOrUpdateAlert(doc= null, getById = false){
      if(getById){
        doc = await getDataById(doc)
      }

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
              payment: payment
            })
          }
        }else if(values.isDenied){
          doc.deletedAt = dates(null, 'yyyy-mm-dd')
          update(doc)
        }else if(values.dismiss == 'cancel'){
          doc.paid = true
          update(doc)
        }
        this.loadAllData()
      })
    },
    
    async showInfo(item, type){
      let array = []
      if(type === 'payment'){
        array = await getDataByPayment(this.monthYear, item.payment)
      }else if(type === 'category'){
        array = await getDataByCategory(this.monthYear, item.category)
      }else{
        array = await getDataByProduct(this.monthYear, item.description)
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
      this.groupByProduct = await dataInMonthGroupByProduct(this.yearMonth)
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
            
            this.saveOrUpdateAlert(id, true)
          };
        };
        currentRow.onclick = createClickHandler(currentRow);
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