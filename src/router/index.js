import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

const router = new Router({
  routes: [

    {
      path: '/',
      name: 'index',
      component: resolve => require(['../components/home/index.vue'],resolve),
    },
    {
      path: '/makeCollections',
      name: 'makeCollections',
      component: resolve => require(['../components/home/makeCollections.vue'],resolve),
    },
    {
      path: '/collectionStatus',
      name: 'collectionStatus',
      component: resolve => require(['../components/home/collectionStatus.vue'],resolve),
    },
    {
      path: '/collectionSuccess',
      name: 'collectionSuccess',
      component: resolve => require(['../components/home/collectionSuccess.vue'],resolve),
    },
    {
      path: '/collectionFail',
      name: 'collectionFail',
      component: resolve => require(['../components/home/collectionFail.vue'],resolve),
    },
    {
      path: '/preLicensing',
      name: 'preLicensing',
      component: resolve => require(['../components/home/preLicensing.vue'],resolve),
    },
    {
      path: '/transactionQuery',
      name: 'transactionQuery',
      component: resolve => require(['../components/home/transactionQuery.vue'],resolve),
    },
    {
      path: '/wuwangluo',
      name: 'wuwangluo',
      component: resolve => require(['../components/home/wuwangluo.vue'],resolve),
    },
    {
      path: '/login',
      name: 'login',
      component: resolve => require(['../components/login/index.vue'],resolve),
    },
  ]
});


export default router
