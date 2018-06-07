import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import'../app/style.css'

Vue.use(Router)
Vue.use(ElementUI)

export default new Router({
  routes:[
    {
        path: '*',
        redirect: '/'
    },
    {
      path: '/login',
      name: 'login',
      component: require('@/app/login/login.vue').default,
    },
    {
        path: '/',
        name: 'index',
        component: require('@/app/index').default,
        children: [
            {
              path: '/home',
              name: 'home',
              component: require('@/app/home/home.vue').default
            },
            {
              path: '/account/:name',
              name: 'account',
              component: require('@/app/account/account.vue').default
            },
            {
              path: '/oneToOne/:fromAddr/:money',
              name: 'one-to-one',
              component: require('@/app/oneToOne/oneToOne.vue').default
            },
            {
              path: '/oneToMany/:fromAddr/:money',
              name: 'one-to-many',
              component: require('@/app/oneToMany/oneToMany.vue').default
            },
            {
              path: '/manyToOne/:fromAddr/:money',
              name: 'many-to-one',
              component: require('@/app/manyToOne/manyToOne.vue').default
            },
            {
              path: '/search/:searchtext',
              name: 'search',
              component: require('@/app/search/search.vue').default
            }
        ]
    }
  ]
});