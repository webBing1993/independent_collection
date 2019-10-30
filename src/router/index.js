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
      path: '/login',
      name: 'login',
      component: resolve => require(['../components/login/index.vue'],resolve),
    },
  ]
});

router.beforeEach((to, from, next) => {
  console.log(from);
  if (from.name != null || from.name != 'login') {
    router.onError((error) => {
      const pattern = /Loading chunk (\d)+ failed/g;
      const isChunkLoadFailed = error.message.match(pattern);
      if (isChunkLoadFailed) {
        router.push('/wuwangluo');
      }
      return;
    });
    next();
  }else {
    next();
  }
});



export default router
