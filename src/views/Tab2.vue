<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="dark">
        <tollbar-component :total="total" title="Saída"/>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->

    <ion-content :fullscreen="true">
      <ion-row>
        <ion-col size="12">
          <ion-segment :value="tab" color="light" @ionChange="segmentChanged($event)">
              <ion-segment-button value="toPaid">
                <ion-label style="font-weight: bold;" color="danger">Á pagar</ion-label>
              </ion-segment-button>
              <ion-segment-button value="paid">
                <ion-label style="font-weight: bold;" color="success">Pagos</ion-label>
              </ion-segment-button>
            </ion-segment>

            <ion-slides ref="slides" v-if="slideDatesExp.length > 0" :options="slideOpts" @ionSlideDidChange="slideChanged($event)">
              <ion-slide style="min-height: 100vh" v-for="p in slideDatesExp" :key="p">
                <ion-row>
                  <ion-col size="12">
                    <ion-label color="light">{{p}}</ion-label><br>
                    <ion-card :style="e.scratch ? 'font-style: italic; text-decoration: line-through; opacity: 0.8;' : ''" v-for="e in expenses" :key="e._id" @click="showInfo(e.description)">
                      <ion-card-content>
                        <ion-row>
                          <ion-col class="ion-text-center">
                            <ion-label color="dark" style="font-weight: bold;" class="savem-font-big">{{e.description}}</ion-label>
                          </ion-col>
                          <ion-col class="ion-text-right savem-font-big">
                            <ion-label color="dark" style="font-weight: bold;">{{formatMoney(e.price)}}</ion-label>
                          </ion-col>
                        </ion-row>
                        <ion-row>
                          <ion-col class="ion-text-left">
                            <ion-label>{{e.payment}}</ion-label>
                          </ion-col>
                          <ion-col class="ion-text-right">
                            <ion-label>Vencimento: {{formatDate(e.expiration)}}</ion-label>
                          </ion-col>
                        </ion-row>
                      </ion-card-content>
                    </ion-card>
                    <ion-label v-if="expenses.length === 0" color="light">Nada por aqui</ion-label>
                  </ion-col>
                </ion-row>
              </ion-slide>
            </ion-slides>
        </ion-col>
      </ion-row>
      
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="dark" @click="saveOrUpdateAlert()" style="font-size: 30px">+</ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script>
import { getDataByDescription, getDataById, getUnPaid, update, insert, getPaid, getDates } from '../models/expense'
import { addZero, getMonths, getNextMonthInt, expRef, getActualYear, toReceiveRef, userRef, dates, sumElements, sum} from '../Helper'
import { doc, updateDoc, onSnapshot, addDoc, deleteDoc, Timestamp, arrayUnion} from "firebase/firestore";
import { alertController, actionSheetController, IonFabButton, IonFab, IonCard, IonSegment, IonSegmentButton} from "@ionic/vue";
import TollbarComponent from '../components/TollbarComponent.vue'
import { arrowForwardCircle } from 'ionicons/icons';
import Swal from 'sweetalert2'

export default {
  components:{ TollbarComponent, IonFabButton, IonFab, IonCard, IonSegment, IonSegmentButton },
  data: () => {
    return {
      tab: 'toPaid',
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
  },

  methods: {
    formatDate(date){
      return dates(date, 'dd/mm')
    },

    async segmentChanged(e){
      this.tab = e.detail.value
      this.actualizeData()
    },

    getMonthName(month){
      const monthIndex = parseInt(month) - 1
      return getMonths(monthIndex)
    },

    loadAllData(year = null, month = null){
      let teste = false;
      if(!year && !month){
        teste = true;
        month = getNextMonthInt();
        year = getActualYear()
  
        if(month === 12){
          year = getActualYear() + 1
        }
      }

      onSnapshot(userRef(), (userSnapshot) => {
        if(teste){
          this.slideDatesExp = userSnapshot.data().slideDatesExp
        }
      })

      // load expenses data
      onSnapshot(expRef(year, month), (expSnapshot) => {
        this.expenses = []
        expSnapshot.docs.forEach((doc)=>{
          const e = doc.data()
          e.id = doc.id

          if(this.tab === 'toPaid'){
            if(!e.scratch){
              this.expenses.push(e)
            }
          }else{
            if(e.scratch){
              this.expenses.push(e)
            }
          }
        })


        this.expenses.sort((a, b) => {
          return  b.price - a.price;
        })

        this.expenses.sort((a, b) => {
          if(!a.scratch){
            a.scratch = false
          }

          if(!b.scratch){
            b.scratch = false
          }
          return  a.scratch - b.scratch;
        })
      })

      // load toReceiveData
      onSnapshot(toReceiveRef(year, month), (toReceiveSnapShot) => {
        this.toReceives = []
        toReceiveSnapShot.docs.forEach((doc)=>{
          const e = doc.data()
          e.id = doc.id
          this.toReceives.push(e)
        })
      })

      setTimeout(()=>{
        const date = dates(Date.now())
        const index = this.slideDatesExp.findIndex(x => (x.month === date.month && x.year === date.year));

        if(this.allStratched){
          this.slideOpts.initialSlide = index + 1
        }else{
          this.slideOpts.initialSlide = index
        }

        this.expenses.sort((a, b) => {
          return  b.price - a.price;
        })

        this.expenses.sort((a, b) => {
          return  a.scratch - b.scratch;
        })

        this.loaded = true
      }, 2000)
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
      if(doc){
        doc = await getDataById(doc)
      }
      const expiration = dates(Date.now(), null, 1)
      let html = `
        <input style="font-size: 16px" id="description" value="${doc ? doc.description : ''}" class="swal2-input">
        <input style="font-size: 16px" id="price" type="number" value="${doc ? doc.price : ''}" class="swal2-input">
      `;

      html += `<input style="font-size: 16px" value="${doc ? doc.expiration : expiration}" id="expiration " type="date" class="swal2-input">`
      
      const payments = ['Crédito', 'Débito', 'Reserva']
      html+= `<select style="font-size: 16px" class="swal2-input" value="${ (doc && typeof doc.payment !== undefined) ? payments[0] : ''}" name="payment" id="payment">`;
      payments.forEach(c => {
        html += `<option value="${c}">${c}</option>`;
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
        cancelButtonColor: 'blue'
      }).then((values)=>{
        if(values.isConfirmed){
          const description = document.getElementById('description').value
          const price = document.getElementById('price').value
          const expiration = document.querySelector('input[type="date"]').value
          const payment = document.getElementById('payment').value
          
          if(doc){
            doc.description = description
            doc.price = price
            doc.expiration = expiration
            doc.payment = payment
            update(doc)
            this.showInfo(doc.description)
          }else{
            insert({
              description: description,
              price: price,
              expiration: expiration,
              payment: payment
            })
          }
        }else if(values.isDenied){
          doc.deletedAt = dates(null, 'yyyy-mm-dd')
          update(doc)
          this.showInfo(doc.description)
        }else if(values.dismiss == 'cancel'){
          doc.paid = true
          update(doc)
          this.showInfo(doc.description)
        }
        console.log(values)
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
      this.slideDatesExp = await getDates();
      this.slideOpts.initialSlide = this.slideDatesExp.indexOf(this.monthYear)
      if(this.tab === 'toPaid'){
        this.expenses = await getUnPaid(this.monthYear)
        this.totalUnPaid = sum(this.expenses, 'price')
      }else{
        this.expenses = await getPaid(this.monthYear)
        this.totalPaid = sum(this.expenses, 'price')
      }
      
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

ion-card{
  background: white;
  /* background: rgb(13, 18, 40); */
  border-radius: 10px;
  /* color:white; */
  height: 100px;
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
</style>