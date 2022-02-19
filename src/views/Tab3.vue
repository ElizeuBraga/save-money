<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="dark">
        <tollbar-component :total="0" title="Entradas"/>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->

    <ion-content :fullscreen="true">
      <ion-row>
        <ion-col size="12">
          <ion-segment :value="tab" color="light" @ionChange="segmentChanged($event)">
              <ion-segment-button value="toPaid">
                <ion-label style="font-weight: bold;" color="danger">À receber</ion-label>
              </ion-segment-button>
              <ion-segment-button value="paid">
                <ion-label style="font-weight: bold;" color="success">Recebidos</ion-label>
              </ion-segment-button>
            </ion-segment>

            <ion-slides ref="slides" v-if="slideDatesExp.length > 0" :options="slideOpts" @ionSlideDidChange="slideChanged($event)">
              <ion-slide style="min-height: 100vh" v-for="p in slideDatesExp" :key="p">
                <ion-row>
                  <ion-col size="12">
                    <ion-label color="light">{{p}}</ion-label><br>
                    <ion-card :style="e.scratch ? 'font-style: italic; text-decoration: line-through; opacity: 0.8;' : ''" v-for="e in expenses" :key="e._id" @click="presentActionSheet(e)">
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
                            <ion-label>{{e.debtor}}</ion-label>
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
import { getUnPaid, update, insert, getPaid, getDates } from '../models/receivables'
import { getMonths, getNextMonthInt, expRef, getActualYear, toReceiveRef, userRef, dates, sumElements, sum} from '../Helper'
import { onSnapshot, Timestamp, updateDoc, deleteDoc, doc} from "firebase/firestore";
import { actionSheetController, IonFabButton, IonFab, IonCard, IonSegment, IonSegmentButton} from "@ionic/vue";
import Swal from 'sweetalert2'
// import FooterInfo from '../components/FooterInfo.vue'
import TollbarComponent from '../components/TollbarComponent.vue'

export default {
  components:{ TollbarComponent, IonFabButton, IonFab, IonCard, IonSegment, IonSegmentButton },
  data: () => {
    return {
      tab: 'toPaid',
      monthYear: dates(null, 'yyyy-mm', 1),
      totalUnPaid: 0,
      totalPaid: 0,
      slideOpts:{
        initialSlide: 0,
        speed: 400
      },
      slidind: false,
      name: '',
      months: getMonths(),
      loaded: false,
      expenses: [],
      data: [],
      toReceives:[],
      slideDatesToRe: [],
      actualSlide: null,
      slideDatesExp: [],

      milliseconds: Timestamp.now().toMillis(),
      
      userRef: null,
      monthRef: null,
      expensesRef: null,
      allData: null
    }
  },

  async mounted() {
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

    async actualizeData(){
      this.slideDatesExp = await getDates();

      if(this.tab === 'toPaid'){
        this.expenses = await getUnPaid(this.monthYear)
        this.totalUnPaid = sum(this.expenses, 'price')
      }else{
        this.expenses = await getPaid(this.monthYear)
        this.totalPaid = sum(this.expenses, 'price')
      }
      
      this.slideOpts.initialSlide = this.slideDatesExp.indexOf(this.monthYear)
    },

    ionSlideNextStarted(){
      this.slidind = true
      this.toReceives = []
    },

    ionSlideNextEnded(){
      this.slidind = false
    },

    getMonthName(month){
      const monthIndex = parseInt(month) - 1
      return getMonths(monthIndex)
    },

    loadAllData(year = null, month = null){
      let teste = false
      if(!year && !month){
        teste = true
        month = getNextMonthInt();
        year = getActualYear()
  
        if(month === 1){
          year = getActualYear() + 1
        }
      }

      onSnapshot(userRef(), (userSnapshot) => {
        if(teste){
          this.slideDatesToRe = userSnapshot.data().slideDatesToRe
        }
      })

      // load expenses data
      onSnapshot(expRef(year, month), (expSnapshot) => {
        this.expenses = []
        expSnapshot.docs.forEach((doc)=>{
          const e = doc.data()
          e.id = doc.id
          this.expenses.push(e)
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

        this.toReceives.sort((a, b) => {
          return  b.price - a.price;
        })

        this.toReceives.sort((a, b) => {
          return  a.scratch - b.scratch;
        })
      })

      setTimeout(() => {
        this.loaded = true

        const date = dates(Date.now())
        const index = this.slideDatesToRe.findIndex(x => (x.month === date.month && x.year === date.year));

        this.slideOpts.initialSlide = index
      }, 2000);
    },

    slideChanged(e){
      e.target.getActiveIndex().then( async i => {
        this.monthYear = this.slideDatesExp[i]
        this.actualizeData()
      });
    },

    async saveOrUpdateAlert(doc = null){
      const expiration = dates(Date.now(), null, 1)
      let html = `
        <input style="font-size: 16px" id="description" value="${doc ? doc.description : ''}" class="swal2-input">
        <input style="font-size: 16px" id="price" type="number" value="${doc ? doc.price : ''}" class="swal2-input">
      `;

      html += `<input style="font-size: 16px" value="${doc ? doc.expiration : expiration}" id="expiration " type="date" class="swal2-input">`
      
      const debtors = ['Marcão', 'Cida', 'Anny', 'Geilton']
      html+= `<select style="font-size: 16px" class="swal2-input" value="${ (doc && typeof doc.debtor !== undefined) ? debtors[0] : ''}" name="debtor" id="debtor">`;
      debtors.forEach(c => {
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
        confirmButtonText: 'Salvar',
        confirmButtonColor: 'black'
      }).then((values)=>{
        if(values.isConfirmed){
          const description = document.getElementById('description').value
          const price = document.getElementById('price').value
          const expiration = document.querySelector('input[type="date"]').value
          const debtor = document.getElementById('debtor').value
          
          if(doc){
            doc.description = description
            doc.price = price
            doc.expiration = expiration
            doc.debtor = debtor
            update(doc)
          }else{
            insert({
              description: description,
              price: price,
              expiration: expiration,
              debtor: debtor
            })
          }
          this.actualizeData()
        }
      })
    },

    scratchItem(item){
      // const day = new Date(expense.expiration).getUTCDate()
      const month = new Date(item.expiration).getMonth() + 1
      const year = new Date(item.expiration).getFullYear()
      
      updateDoc(doc(toReceiveRef(year, month), item.id), {scratch: item.scratch ? false : true});
      this.showToast('success', 'Item riscado!')
    },

    updateToReceive(item){
      const month = new Date(item.expiration).getMonth() + 1
      const year = new Date(item.expiration).getFullYear()

      updateDoc(doc(toReceiveRef(year, month), item.id), {name: item.name, price: parseFloat(item.price)})

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

    async presentActionSheet(item) {
      const actionSheet = await actionSheetController
        .create({
          header: 'Opções',
          cssClass: 'my-custom-class',
          buttons: [
            {
              text: 'Editar',
              handler: () => {
                this.saveOrUpdateAlert(item)
              },
            },
            {
              text: 'Excluir',
              handler: () => {
                this.deleteItem(item)
              },
            },
            {
              cssClass: 'ion-color-danger',
              text: item.scratch ? 'Não recebi' : 'Recebido',
              handler: () => {
                this.scratchItem(item)
              },
            },
            {
              cssClass: 'ion-color-danger',
              text: item.doubt ? 'Remover dúvida' : 'Duvidoso',
              handler: () => {
                const month = new Date(item.expiration).getMonth() + 1
                const year = new Date(item.expiration).getFullYear()
                
                updateDoc(doc(toReceiveRef(year, month), item.id), {doubt: item.doubt ? false : true});
                this.showToast('success', 'Marcado como duvidoso!')
              },
            }
          ],
        });
      await actionSheet.present();
    },

    deleteItem(item){
      // const day = new Date(expense.expiration).getUTCDate()
      const month = new Date(item.expiration).getMonth() + 1
      const year = new Date(item.expiration).getFullYear()
      deleteDoc(doc(toReceiveRef(year, month), item.id));
      this.showToast('success', 'Item excluído!')
    },
  },

  computed:{
    getTotalToReceive(){
      return sumElements(this.toReceives, 'price')
    },

    expenseTotal(){
      return sumElements(this.expenses, 'price')
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
</style>