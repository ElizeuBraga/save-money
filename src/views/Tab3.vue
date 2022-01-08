<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="primary">
        <tollbar-component :total="(getTotalToReceive - expenseTotal)" title="Entradas"/>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->

    <ion-content :fullscreen="true">
      <ion-spinner color="primary" style="margin-top: 50%; margin-left: 50%" v-if="!loaded" name="crescent"></ion-spinner>
      <ion-row v-else>
        <ion-col size="12">
          <ion-grid>
            <ion-card>
              <ion-button @click="alertNewToReceive()">Novo</ion-button>
              <ion-slides v-if="slideDatesToRe.length > 0" :options="slideOpts" @ionSlideDidChange="slideChanged($event)">
                <ion-slide v-for="m in slideDatesToRe" :key="m">
                  <span style="background: #3880ff; color: white; border-radius: 20px; padding: 0px 6px 0px 6px">{{getMonthName(m.month)}}/{{m.year}}</span>
                </ion-slide>
              </ion-slides>

              <ion-card-content align="center">
                <ion-list v-for="e in toReceives" :key="e.id">
                  <ion-item @click="presentActionSheet(e)">
                    <!-- <ion-img style="height: 30px; width: 30px; margin-right: 5px" :src="e.img"></ion-img> -->
                    <ion-label class="ion-text-left">{{e.name}}</ion-label>
                    <ion-label class="ion-text-right">{{"R$ " + parseFloat(e.price).toFixed(2).replace(".", ",")}}</ion-label>
                  </ion-item>
                </ion-list>

                <ion-list v-if="toReceives.length == 0">
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
      <footer-info :total="formatMoney(getTotalToReceive)"/>
    </ion-content>
  </ion-page>
</template>

<script>
import { addZero, getMonths, getNextMonthInt, getNextMonthIndex, expRef, getActualYear, toReceiveRef, userRef, dates} from '../Helper'
import { onSnapshot, addDoc, Timestamp, updateDoc, arrayUnion, deleteDoc, doc} from "firebase/firestore";
import { alertController, IonList, actionSheetController, IonSlides, IonSlide} from "@ionic/vue";
// import FooterInfo from '../components/FooterInfo.vue'
import TollbarComponent from '../components/TollbarComponent.vue'

export default {
  components:{ IonList, IonSlides, IonSlide, TollbarComponent},
  data: () => {
    return {
      slideOpts:{
        initialSlide: getNextMonthIndex(),
        speed: 400
      },
      name: '',
      months: getMonths(),
      loaded: false,
      expenses: [],
      toReceives:[],
      slideDatesToRe: [],
      actualSlide: null,

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

      setTimeout(() => {
        this.loaded = true

        const date = dates(Date.now())
        const index = this.slideDatesToRe.findIndex(x => (x.month === date.month && x.year === date.year));

        this.slideOpts.initialSlide = index
      }, 2000);
    },

    slideChanged(e){
      e.target.getActiveIndex().then(i => {
        const obj = this.slideDatesToRe[i]
        this.actualSlide = obj;
        this.loadAllData(obj.year, parseInt(obj.month))
      });
    },

    async alertNewToReceive(item){
      console.log(this.actualSlide)
      let expiration = this.actualSlide.year +'-'+this.actualSlide.month+'-'+'10'
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
              label: 'Nome',
              name: 'name',
              id: 'name',
              value: item ? item.name : '',
              placeholder: 'Digite o nome',
            },
            {
              label: 'Valor',
              name: 'price',
              id: 'price',
              value: item ? item.price : '',
              placeholder: 'Digite o valor',
              type: 'number'
            },
            {
              label: 'Data de vencimento',
              name: 'expiration',
              id: 'expiration',
              value: expiration,
              type: 'date',
              disabled: item ? true : false
            },
            {
              label: 'Repetir',
              name: 'repeat',
              id: 'repeat',
              value: '',
              placeholder: 'Repetir?',
              type: 'number',
              max: 60,
              disabled: item ? true : false
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler: (values) => {
                if(item){
                  item.name = values.name
                  item.price = values.price
                  this.updateToReceive(item);
                }else{
                  this.saveNewToReceive(values);
                }
              },
            },
            {
              text: 'Cancelar'
            }
          ],
        });

      const description = document.getElementById('name')
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

      await updateDoc(userRef(), {
        slideDatesToRe: arrayUnion({year: String(year), month: addZero(month)})
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
          slideDatesToRe: arrayUnion({year: String(year), month: addZero(month)})
        })

        repeat --
      }

      this.showToast('success', 'Novo item adicionado!')
    },

    async saveNewToReceive(expense){
      let img = '../img/imgs/'+expense.name.toLowerCase()+'.png'
  
      if(!await this.imageExists(img)){
        img = '../img/imgs/default.png'
      }

      // if repeat
      let repeat = parseInt(expense.repeat)

    
      const day = new Date(expense.expiration).getUTCDate()
      let month = new Date(expense.expiration).getMonth() + 1
      let year = new Date(expense.expiration).getFullYear()

      let expiration = new Date(`${year}-${addZero(month)}-${day}`).getTime()
      addDoc(toReceiveRef(year, month), {name: expense.name, price: parseFloat(expense.price), img: img, expiration: expiration, createdAt: this.milliseconds})

      await updateDoc(userRef(), {
        slideDatesToRe: arrayUnion({year: String(year), month: addZero(month)})
      })

      while (repeat > 1) {
        if(parseInt(month) == 12){
          year = String(parseInt(year) + 1)
          month = 1
        }else{
          month = String(parseInt(month) + 1)
        }
        
        expiration = new Date(`${year}-${addZero(month)}-${day}`).getTime()
        addDoc(toReceiveRef(year, month), {name: expense.name, price: parseFloat(expense.price), img: img, expiration: expiration, createdAt: this.milliseconds})

        await updateDoc(userRef(), {
          slideDatesToRe: arrayUnion({year: String(year), month: addZero(month)})
        })
        repeat --
      }

      this.showToast('success', 'Novo item adicionado!')
    },

    updateToReceive(item){
      const day = new Date(item.expiration).getUTCDate()
      const month = new Date(item.expiration).getMonth() + 1
      const year = new Date(item.expiration).getFullYear()

      const expiration = new Date(`${year}-${month}-${day}`).getTime()

      updateDoc(doc(toReceiveRef(year, month), item.id), {price: item.price})

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

    async presentActionSheet(expense) {
      const actionSheet = await actionSheetController
        .create({
          header: 'Opções',
          cssClass: 'my-custom-class',
          buttons: [
            {
              text: 'Editar',
              handler: () => {
                // this.alertUpdateExpense(expense)
                this.alertNewToReceive(expense)
              },
            },
            {
              text: 'Excluir',
              handler: () => {
                this.deleteItem(expense)
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
      let total = 0
      this.toReceives.forEach((e)=>{
        total += e.price
      })

      return total;
    },

    expenseTotal(){
      let total = 0
      this.expenses.forEach((e)=>{
        total += e.price
      })

      return total;
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