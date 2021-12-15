<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="primary">
        <tollbar-component :total="(totalToreceive - amountExpense)" title="Saída"/>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->


    <ion-content :fullscreen="true">
      <ion-row>
        <ion-col size="12">
          <ion-grid>
            <ion-card>
              <ion-button @click="alertNewExpense()">Novo</ion-button>
              <ion-slides :options="slideOpts" @ionSlideDidChange="slideChanged($event)">
                <ion-slide v-for="m in months" :key="m">
                  <span style="background: #3880ff; color: white; border-radius: 20px; padding: 0px 6px 0px 6px">{{m}}</span>
                </ion-slide>
              </ion-slides>

              <ion-card-content align="center">
                <ion-list v-for="e in expenses" :key="e.id" style="max-height: 400px; overflow-y: scroll;">
                  <ion-item @click="presentActionSheet(e)">
                    <ion-img style="height: 30px; width: 30px; margin-right: 5px" :src="e.img"></ion-img>
                    <ion-label class="ion-text-left">{{e.description}}</ion-label>
                    <ion-label class="ion-text-right">{{"R$ " + parseFloat(e.price).toFixed(2).replace(".", ",")}}</ion-label>
                  </ion-item>
                </ion-list>

                <ion-list v-if="expenses.length == 0">
                  <ion-item>
                    <ion-label class="ion-text-center label-italic" color="danger">Nenhum item encontrado</ion-label>
                  </ion-item>
                </ion-list>
              </ion-card-content>
              <!-- List of Text Items -->
            </ion-card>
          </ion-grid>
        </ion-col>
      </ion-row>
      <footer-info :total="formatMoney(amountExpense)"/>
    </ion-content>
  </ion-page>
</template>

<script>
import { addZero, getMonths, getNextMonthInt, getNextMonthIndex, expRef, getActualYear, toReceiveRef} from '../Helper'
import { doc, updateDoc, onSnapshot, addDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { alertController, IonList, actionSheetController, IonSlides, IonSlide, IonImg} from "@ionic/vue";
import FooterInfo from '../components/FooterInfo.vue'
import TollbarComponent from '../components/TollbarComponent.vue'

export default {
  components:{ IonList, IonSlides, IonSlide, IonImg, FooterInfo, TollbarComponent},
  data: () => {
    return {
      slideOpts:{
        initialSlide: getNextMonthIndex(),
        speed: 400
      },
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

      allData: null
    }
  },

  async mounted() {
    this.loadAllData()
  },
  methods: {
    loadAllData(year = null, month = null){
      if(!year && !month){
        month = getNextMonthInt();
        year = getActualYear()
  
        if(month === 1){
          year = getActualYear() + 1
        }
      }

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

      this.loaded = true
    },

    slideChanged(e){
      e.target.getActiveIndex().then(i => {
        const month = i+1;
        let year = getActualYear()

        if(getNextMonthInt() === 1){
          year = getActualYear() + 1
        }

        this.loadAllData(year, month)
      });
    },

    async alertNewExpense(){
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
              value: getActualYear() + '-' + addZero(getNextMonthInt()) +'-10',
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

      
      while (repeat > 1) {
        if(parseInt(month) == 12){
          year = String(parseInt(year) + 1)
          month = 1
        }else{
          month = String(parseInt(month) + 1)
        }
        
        expiration = new Date(`${year}-${addZero(month)}-${day}`).getTime()
        addDoc(expRef(year, month), {description: expense.description, price: parseFloat(expense.price), img: img, expiration: expiration, createdAt: this.milliseconds})
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
      deleteDoc(doc(this.expensesRef, expense.id));
      this.showToast('success', 'Item excluído!')
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
                this.alertUpdateExpense(expense)
              },
            },
            {
              text: 'Excluir',
              handler: () => {
                this.deleteExpense(expense)
              },
            }
          ],
        });
      await actionSheet.present();
    }
  },

  computed:{
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
  min-height: 82vh;
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