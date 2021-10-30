import { getAuth, onAuthStateChanged} from "firebase/auth";
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Tabs from '../views/Tabs.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    name: 'Login',
    path: '/login',
    component: () => import('@/views/Login.vue')
  },
  {
    name: 'Register',
    path: '/register',
    component: () => import('@/views/Register.vue')
  },
  {
    name: 'RecoverPassword',
    path: '/recoverPassword',
    component: () => import('@/views/RecoverPassword.vue')
  },
  {
    path: '/tabs',
    component: Tabs,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3.vue')
      },
      {
        path: 'monthlyIncomes',
        component: () => import('@/views/MonthlyIncomes.vue')
      },
      {
        path: 'familyHelp',
        component: () => import('@/views/FamilyHelp.vue')
      },
      {
        path: 'user',
        component: () => import('@/views/User.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if(to.name !== 'Login' && to.name !== 'Register' && to.name !== 'RecoverPassword'){
    const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          const uid = user.uid;
          
          next()
          // ...
        } else {
          // User is signed out
          // ...
          next('/login')
          console.log('Não está logado')
        }
      })
    }else{
      next()
    }
  })

  export default router
  