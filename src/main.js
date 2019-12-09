// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'

import ElementUI from 'element-ui'
import 'element-theme-chalk';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

import VueAwesomeSwiper from 'vue-awesome-swiper'
Vue.use(VueAwesomeSwiper);

import './mixins'

import store from './store'
import Axios from 'axios'

import toastMsg from './components/home/toast'
Vue.prototype.$toastMsg = toastMsg.install;

var root = process.env.API_ROOT;
const axios = Axios.create();
//请求拦截
axios.interceptors.request.use((config) => {
  // 请求之前重新拼装url
  config.url = root + config.url;
  return config;
});


// http response 响应拦截器
Axios.interceptors.response.use(response => {
  const code = response.data.code;
  if (code === 401) {
    // 判断res.data.res_code 是否是401 如果是则跳转到登录，如果不是则正常返回
    Vue.prototype.$toastMsg({
      toastTip: true,
      toastTxt_: '当前登录失效，请重新登录',
    });
    setTimeout(() => {
      if (sessionStorage.getItem('isPad') == 'true') {
        window.android.forceLogout();
      }else if (sessionStorage.getItem('isDevice') == 'true') {
        jsObj.LogOut();
      }else {
        router.replace('/login')
      }
    },2000)
  }
  return response;
},error => {
  console.log("error", error);
  console.log("error.response", error.response);
  if (error.response) {
    switch (error.response.status) {
      case 304:
        Vue.prototype.$toastMsg({
          toastTip: true,
          toastTxt_: '当前登录失效，请重新登录',
        });
        setTimeout(() => {
          if (sessionStorage.getItem('isPad') == 'true') {
            window.android.forceLogout();
          }else if (sessionStorage.getItem('isDevice') == 'true') {
            jsObj.LogOut();
          }else {
            router.replace('/login')
          }
        },2000)
        break;
      case 403:
        Vue.prototype.$toastMsg({
          toastTip: true,
          toastTxt_: '当前登录失效，请重新登录',
        });
        setTimeout(() => {
          if (sessionStorage.getItem('isPad') == 'true') {
            window.android.forceLogout();
          }else if (sessionStorage.getItem('isDevice') == 'true') {
            jsObj.LogOut();
          }else {
            router.replace('/login')
          }
        },2000)
        break;
      case 404:
        Vue.prototype.$toastMsg({
          toastTip: true,
          toastTxt_: '当前登录失效，请重新登录',
        });
        setTimeout(() => {
          if (sessionStorage.getItem('isPad') == 'true') {
            window.android.forceLogout();
          }else if (sessionStorage.getItem('isDevice') == 'true') {
            jsObj.LogOut();
          }else {
            router.replace('/login')
          }
        },2000)
        break;
      case 504:
        Vue.prototype.$toastMsg({
          toastTip: true,
          toastTxt_: '请求超时或网络断开连接',
        });
        break;
      case 502:
        Vue.prototype.$toastMsg({
          toastTip: true,
          toastTxt_: '服务端报错，请稍后再试',
        });
        break;
      default:
        // Vue.prototype.$toastMsg({
        //   toastTip: true,
        //   toastTxt_: '当前登录失效，请重新登录',
        // });
        // setTimeout(() => {
        //   if (sessionStorage.getItem('isPad') == 'true') {
        //     window.android.forceLogout();
        //   }else if (sessionStorage.getItem('isDevice') == 'true') {
        //     jsObj.LogOut();
        //   }else {
        //     router.replace('/login')
        //   }
        // },2000)
    }
    // 返回接口返回的错误信息
    return Promise.reject(error.response.data);
  }else {
    Vue.prototype.$toastMsg({
      toastTip: true,
      toastTxt_: '当前登录失效，请重新登录',
    });
    setTimeout(() => {
      if (sessionStorage.getItem('isPad') == 'true') {
        window.android.forceLogout();
      }else if (sessionStorage.getItem('isDevice') == 'true') {
        jsObj.LogOut();
      }else {
        router.replace('/login')
      }
    },2000)
  }
});

router.beforeEach((to, from, next) => {
  if (from.name != null || from.name != 'index' || to.name == 'wuwangluo') {
    router.onError((error) => {
      console.log("error.response", error.response);
      if (error.response) {

      }else {
        const pattern = /Loading chunk (\d)+ failed/g;
        const isChunkLoadFailed = error.message.match(pattern);
        if (isChunkLoadFailed) {
          Vue.prototype.$toastMsg({
            toastTip: true,
            toastTxt_: '当前登录失效，请重新登录',
          });
          setTimeout(() => {
            if (sessionStorage.getItem('isPad') == 'true') {
              window.android.forceLogout();
            }else if (sessionStorage.getItem('isDevice') == 'true') {
              jsObj.LogOut();
            }else {
              router.replace('/login')
            }
          },2000)
        }else {
          router.replace('/wuwangluo');
        }
      }
      return;
    });
  }
  next();

});


Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
