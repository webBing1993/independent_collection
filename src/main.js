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

//  请求拦截
Axios.interceptors.request.use(config => {
  return config;
}, err => {
  Vue.prototype.$toast({
    message: "请求超时",
    iconClass: 'icon ',
  });
  return Promise.resolve(err);
});

// http response 响应拦截器
Axios.interceptors.response.use(response => {
  return response;
},error => {
  if (error.response) {
    switch (error.response.status) {
      // 返回401，清除token信息并跳转到登录页面
      case 401:
        localStorage.removeItem('token');
        Vue.prototype.$toast({
          message: "当前登录失效",
          iconClass: 'icon ',
        });
        // 这里要返回到登录页
        break;
      case 403:
        Vue.prototype.$toast({
          message: "权限不足,请联系管理员!",
          iconClass: 'icon ',
        });
        break;
      case 404:
        Vue.prototype.$toast({
          message: "服务器被吃了⊙﹏⊙∥",
          iconClass: 'icon ',
        });
        break;
      case 504:
        Vue.prototype.$toast({
          message: "服务器被吃了⊙﹏⊙∥",
          iconClass: 'icon ',
        });
        break;
      case 502:
        Vue.prototype.$toast({
          message: "服务端报错，请稍后再试",
          iconClass: 'icon ',
        });
        break;
      default:
        Vue.prototype.$toast({
          message: "发生未知错误",
          iconClass: 'icon ',
        });
        Vue.prototype.$message.error(error.response.data);
    }
    // 返回接口返回的错误信息
    return Promise.reject(error.response.data);
  }else {

  }
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
